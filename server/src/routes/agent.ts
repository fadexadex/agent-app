import { Router, Request, Response } from "express";
import { pipeAgentUIStreamToResponse, UIMessage } from "ai";
import { access, readFile } from "fs/promises";
import { join, resolve } from "path";
import mime from "mime-types";
import { remotionAgent } from "../agents/remotion-agent.js";
import { PREVIEWS_DIR } from "../tools/render-scene.js";
import { renderStates } from "../lib/render-state.js";
import { getGeneratedAssets } from "../lib/generated-assets.js";

const router = Router();

interface ChatRequest {
  messages: any[];
  sceneId?: string;
  sceneContext?: Record<string, unknown>;
  assets?: string[]; // Array of file URLs like "/uploads/foo.png"
}

const UPLOADS_DIR = resolve(process.cwd(), "../remotion/public");

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages, sceneId, sceneContext, assets } = req.body as ChatRequest;

    // Attach base64 data to the last user message if there are assets
    if (assets && assets.length > 0 && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        const textContent = typeof lastMessage.content === "string" ? lastMessage.content : "";
        const parts: any[] = [{ type: "text", text: textContent }];
        
        for (const assetUrl of assets) {
          try {
            // Assume assetUrl starts with /uploads/
            const localPath = join(UPLOADS_DIR, assetUrl.replace(/^\//, ""));
            const fileData = await readFile(localPath);
            const base64Data = fileData.toString("base64");
            const mimeType = mime.lookup(localPath) || "application/octet-stream";
            
            const isImage = mimeType && mimeType.startsWith('image/');
            if (isImage) {
              parts.push({
                type: "image",
                image: Buffer.from(base64Data, "base64"),
                mediaType: mimeType,
              });
            } else {
              parts.push({
                type: "file",
                data: Buffer.from(base64Data, "base64"),
                mediaType: mimeType,
              });
            }
          } catch (err) {
            console.error(`[API] Failed to read asset ${assetUrl}:`, err);
          }
        }
        // Using any here as a quick bypass for the union type complexity of Message content
        lastMessage.content = parts as any;
      }
    }

    // Build context to include in the agent's context
    if (sceneContext && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        const payloadText = `[SCENE_JSON_PAYLOAD:\n\`\`\`json\n${JSON.stringify(sceneContext, null, 2)}\n\`\`\`\n]`;
        
        if (typeof lastMessage.content === "string") {
          lastMessage.content = payloadText + "\n\n" + lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
          const textPartIndex = lastMessage.content.findIndex((p: any) => p.type === "text");
          if (textPartIndex !== -1) {
            lastMessage.content[textPartIndex].text = payloadText + "\n\n" + lastMessage.content[textPartIndex].text;
          } else {
            lastMessage.content.unshift({ type: "text", text: payloadText + "\n\n" });
          }
        }
      }
    }

    if (sceneContext) {
      console.log(`[API] Injected Scene context JSON payload`);
    }

    await pipeAgentUIStreamToResponse({
      response: res,
      agent: remotionAgent,
      uiMessages: messages,
      onStepFinish: ({ stepNumber, toolCalls, usage }) => {
        console.log(`[API] Step ${stepNumber} finished:`, {
          tools: toolCalls?.map((tc) => tc.toolName),
          tokens: usage?.totalTokens,
        });
      },
    });
  } catch (error) {
    console.error("Agent error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process request" });
    }
  }
});

// Poll endpoint: client checks whether a background render has finished
router.get("/render-status/:sceneId", async (req: Request, res: Response) => {
  const sceneId = req.params.sceneId as string;
  const videoPath = join(PREVIEWS_DIR, `${sceneId}.mp4`);

  // Check render state first for detailed status
  const state = renderStates.get(sceneId);

  if (state) {
    if (state.status === "complete") {
      return res.json({
        status: "complete",
        videoUrl: state.videoUrl || `/previews/${sceneId}.mp4`,
        durationSeconds: state.endTime
          ? (state.endTime - state.startTime) / 1000
          : undefined,
      });
    }

    if (state.status === "failed") {
      return res.json({
        status: "failed",
        exitCode: state.exitCode,
        error: state.errorOutput.slice(-10).join("\n"),
      });
    }

    // Still rendering
    return res.json({ status: "rendering" });
  }

  // No state tracked - fall back to file existence check
  try {
    await access(videoPath);
    // File exists — render is complete
    res.json({ status: "complete", videoUrl: `/previews/${sceneId}.mp4` });
  } catch {
    // File not yet available and no state — unknown
    res.json({ status: "unknown" });
  }
});

export default router;
