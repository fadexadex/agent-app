import { tool } from "ai";
import { z } from "zod";
import { spawn, ChildProcess } from "child_process";
import { mkdir, access } from "fs/promises";
import { join, resolve } from "path";
import {
  initRenderState,
  appendErrorOutput,
  appendOutputLog,
  markRenderComplete,
  markRenderFailed,
} from "../lib/render-state.js";

// ─── Paths ────────────────────────────────────────────────────────────────────

const REMOTION_DIR = resolve(process.cwd(), "../remotion");
export const PREVIEWS_DIR = resolve(process.cwd(), "public", "previews");

// ─── Active render tracking ───────────────────────────────────────────────────

interface ActiveRender {
  startTime: number;
  process: ChildProcess;
}

export const activeRenders = new Map<string, ActiveRender>();

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
    const startMs = Date.now();

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

    // 3. Spawn the Remotion CLI but DON'T await — render runs in background
    const args = [
      "remotion",
      "render",
      sceneId,
      outputFile,
      "--overwrite",
      "--log",
      "verbose",
      "--concurrency",
      "1", // Limit concurrency to prevent Heroku memory (R15) errors
    ];

    console.log(
      `[renderScene] Spawning (non-blocking): npx ${args.join(" ")}\n             cwd: ${REMOTION_DIR}`
    );

    const child = spawn("npx", args, {
      cwd: REMOTION_DIR,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });

    activeRenders.set(sceneId, { startTime: startMs, process: child });

    // Initialize render state for tracking
    initRenderState(sceneId);

    child.stdout?.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().trim();
      if (lines) {
        console.log(`[Remotion/${sceneId}] ${lines}`);
        appendOutputLog(sceneId, lines);
      }
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().trim();
      if (lines) {
        console.log(`[Remotion/${sceneId}] ${lines}`);
        appendErrorOutput(sceneId, lines);
      }
    });

    child.on("error", (err: Error) => {
      console.error(
        `[renderScene] Spawn error for ${sceneId}: ${err.message}`
      );
      activeRenders.delete(sceneId);
      appendErrorOutput(sceneId, `Spawn error: ${err.message}`);
      markRenderFailed(sceneId, null);
    });

    child.on("close", (code: number | null) => {
      const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
      activeRenders.delete(sceneId);

      if (code === 0) {
        console.log(`[renderScene] ✅ ${sceneId} rendered in ${elapsed}s → ${outputFile}`);
        markRenderComplete(sceneId, `/previews/${sceneId}.mp4`);
      } else {
        console.error(`[renderScene] ❌ ${sceneId} failed with exit code ${code}`);
        markRenderFailed(sceneId, code);
      }
    });

    // Return immediately — render continues in background
    const videoUrl = `/previews/${sceneId}.mp4`;

    return {
      success: true,
      status: "rendering",
      sceneId,
      videoUrl,
      message: `Render started for "${sceneId}". Video will be available at ${videoUrl} when complete.`,
    };
  },
});
