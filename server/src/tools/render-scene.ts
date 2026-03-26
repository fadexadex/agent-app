import { tool } from "ai";
import { z } from "zod";
import { mkdir, access } from "fs/promises";
import { join, resolve } from "path";
import * as fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import {
  initRenderState,
  appendErrorOutput,
  appendOutputLog,
  markRenderComplete,
  markRenderFailed,
} from "../lib/render-state.js";
import {
  deploySite,
  getOrCreateBucket,
  getFunctions,
  renderMediaOnLambda,
  getRenderProgress,
} from "@remotion/lambda";

// ─── Paths ────────────────────────────────────────────────────────────────────

const REMOTION_DIR = resolve(process.cwd(), "../remotion");
export const PREVIEWS_DIR = resolve(process.cwd(), "public", "previews");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verify that the scene file actually exists before trying to render it.
 * Prevents confusing Remotion errors when the scene was never written.
 */
async function assertSceneExists(sceneId: string): Promise<void> {
  const rootFile = join(REMOTION_DIR, "src", "Root.tsx");
  try {
    await access(rootFile);
  } catch {
    throw new Error(
      `Root.tsx not found at ${rootFile}. Make sure triggerPreview ran first.`
    );
  }
  const { readFile } = await import("fs/promises");
  const rootContent = await readFile(rootFile, "utf-8");
  if (!rootContent.includes(`id="${sceneId}"`)) {
    throw new Error(
      `Composition "${sceneId}" not found in Root.tsx. Call triggerPreview before renderScene.`
    );
  }
}

// ─── Tool ─────────────────────────────────────────────────────────────────────

export const renderSceneTool = tool({
  description: `Render a Remotion composition to an MP4 video file so it can be played
back directly in the browser preview.

IMPORTANT: You MUST call this tool after triggerPreview for every scene.
Without this step the preview will stay blank — no video is rendered automatically.

Workflow order:
  1. writeSceneCode   – write the TSX component
  2. triggerPreview   – register the composition in Root.tsx
  3. renderScene      – THIS TOOL – render the frames to an MP4

The render runs in the background. The agent can continue to the next scene
while this render completes in parallel. Poll /api/agent/render-status/:sceneId
to check completion status.`,

  inputSchema: z.object({
    sceneId: z
      .string()
      .describe(
        "The Remotion composition id — must exactly match the id used in triggerPreview " +
          "(e.g. 'hook-intro', 'the-hook')"
      ),
  }),

  execute: async ({ sceneId }) => {
    // 1. Sanity-check: composition must be registered before rendering
    try {
      await assertSceneExists(sceneId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[renderScene] Pre-flight check failed: ${message}`);
      return { success: false, sceneId, error: message };
    }

    // 2. Ensure the output directory exists
    try {
      await mkdir(PREVIEWS_DIR, { recursive: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[renderScene] Could not create previews dir: ${message}`);
      return { success: false, sceneId, error: message };
    }

    const outputFile = join(PREVIEWS_DIR, `${sceneId}.mp4`);

    // Initialize render state for tracking
    initRenderState(sceneId);
    appendOutputLog(sceneId, `Starting Lambda render process for ${sceneId}...`);

    // 3. Run the Lambda render process in the background
    (async () => {
      try {
        const region = (process.env.AWS_REGION || "us-east-1") as any;

        // 1. Setup / Identify bucket
        appendOutputLog(sceneId, "Checking S3 bucket...");
        const { bucketName } = await getOrCreateBucket({ region });

        appendOutputLog(sceneId, "Bundling and uploading site to S3...");

        // 2. Deploy the dynamically updated site
        const { serveUrl } = await deploySite({
          bucketName,
          entryPoint: join(REMOTION_DIR, "src", "index.ts"),
          region,
          siteName: `agent-ui-${sceneId}`,
          options: {
            publicDir: join(REMOTION_DIR, "public"),
            webpackOverride: (config) => {
              return {
                ...config,
                resolve: {
                  ...config.resolve,
                  alias: {
                    ...(config.resolve?.alias || {}),
                    "@": join(REMOTION_DIR, "src"),
                  },
                },
              };
            },
          }
        });

        // 3. Find the Lambda function we deployed earlier
        appendOutputLog(sceneId, "Finding compatible Lambda function...");
        const functions = await getFunctions({ region, compatibleOnly: true });
        
        if (functions.length === 0) {
            throw new Error(`No compatible Remotion Lambda function found in region ${region}. Did you deploy one?`);
        }
        
        const functionName = functions[0].functionName;

        appendOutputLog(sceneId, `Triggering Lambda render for ${sceneId}...`);

        // 4. Trigger the Render on AWS
        const { renderId } = await renderMediaOnLambda({
          region,
          functionName,
          serveUrl,
          composition: sceneId,
          inputProps: {},
          codec: "h264",
          imageFormat: "jpeg",
          privacy: "public",
        });

        appendOutputLog(sceneId, `Render started with ID: ${renderId}`);

        // 5. Poll for completion
        let done = false;
        let s3Url = "";
        while (!done) {
          await new Promise((res) => setTimeout(res, 2000));
          const progress = await getRenderProgress({ renderId, bucketName, functionName, region });
          
          if (progress.fatalErrorEncountered) {
              const errMsgs = progress.errors.map(e => e.message).join(", ");
              throw new Error(`Lambda render failed: ${errMsgs}`);
          }
          if (progress.done) {
              s3Url = progress.outputFile!;
              done = true;
          } else {
              appendOutputLog(sceneId, `Render progress: ${Math.round(progress.overallProgress * 100)}%`);
          }
        }

        // 6. Download the file from S3 to local public/previews
        appendOutputLog(sceneId, `Downloading rendered video from ${s3Url}...`);
        const res = await fetch(s3Url);
        if (!res.ok) {
            throw new Error(`Failed to download from S3: ${res.statusText}`);
        }
        
        const fileStream = fs.createWriteStream(outputFile);
        if (res.body) {
            // Convert Web Stream to Node Stream
            const reader = res.body.getReader();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fileStream.write(value);
            }
            fileStream.end();
            await finished(fileStream);
        } else {
            throw new Error("No response body from S3 download");
        }
        
        appendOutputLog(sceneId, `Successfully downloaded to ${outputFile}`);
        markRenderComplete(sceneId, `/previews/${sceneId}.mp4`);

      } catch (error) {
        console.error(`[renderScene] Lambda render error for ${sceneId}:`, error);
        markRenderFailed(sceneId, 1);
        appendErrorOutput(sceneId, String(error));
      }
    })();

    // Return immediately — render continues in background
    const videoUrl = `/previews/${sceneId}.mp4`;

    return {
      success: true,
      status: "rendering",
      sceneId,
      videoUrl,
      message: `Lambda render started for "${sceneId}". Video will be available at ${videoUrl} when complete.`,
    };
  },
});
