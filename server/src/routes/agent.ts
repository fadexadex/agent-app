import { Router, Request, Response } from "express";
import { pipeAgentUIStreamToResponse, UIMessage } from "ai";
import { access, readFile } from "fs/promises";
import { join, resolve } from "path";
import mime from "mime-types";
import { remotionAgent } from "../agents/remotion-agent.js";
import { PREVIEWS_DIR } from "../tools/render-scene.js";
import { renderStates } from "../lib/render-state.js";
import { getGeneratedAssets } from "../lib/generated-assets.js";
import { config } from "../lib/config.js";
import {
  generateScenesInParallel,
  isParallelGenerationEnabled,
  SceneGenerationTask,
  SceneProgressUpdate,
} from "../services/parallel-scene-renderer.js";

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
    const { messages: rawMessages, sceneId, sceneContext, assets } = req.body as ChatRequest;

    // Deep clone to avoid mutating req.body accidentally
    let messages = JSON.parse(JSON.stringify(rawMessages));

    // Sanitization: Remove any tool-calls that don't have a corresponding tool-result in the same message or turn.
    // This prevents the "Tool result is missing" error when refinement chat history is sent back to the LLM.
    messages = messages.map((msg: any) => {
      if (msg.role === "assistant" && Array.isArray(msg.parts)) {
        const parts = [...msg.parts];
        const toolCallIdsWithResults = new Set(
          parts.filter((p: any) => p.type === "tool-result").map((p: any) => p.toolCallId)
        );

        // Filter out tool calls that don't have a matching result
        const sanitizedParts = parts.filter((p: any) => {
          if (p.type === "tool-invocation" || p.type === "tool-call") {
             const hasResult = toolCallIdsWithResults.has(p.toolCallId);
             if (!hasResult) {
                console.warn(`[API] Removing dangling tool call ${p.toolCallId} from message ${msg.id}`);
                return false;
             }
          }
          return true;
        });

        msg.parts = sanitizedParts;
      }
      return msg;
    });

    console.log(`[API] Processing chat with ${messages.length} messages. History length: ${JSON.stringify(messages).length} chars.`);

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

// Get generated assets (images created by the AI agent)
router.get("/generated-assets", (req: Request, res: Response) => {
  const assets = getGeneratedAssets();
  res.json({ assets });
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

// Get server configuration (for client to know about parallel generation)
router.get("/config", (req: Request, res: Response) => {
  res.json({
    parallelGeneration: config.parallelGeneration,
    maxParallelScenes: config.maxParallelScenes,
  });
});

// Batch scene generation endpoint (for parallel mode)
interface BatchGenerateRequest {
  scenes: Array<{
    sceneId: string;
    sceneIndex: number;
    sceneContext: Record<string, unknown>;
  }>;
  prompt: string;
}

router.post("/generate-batch", async (req: Request, res: Response) => {
  if (!isParallelGenerationEnabled()) {
    return res.status(400).json({
      error: "Parallel generation is disabled. Set PARALLEL_GENERATION=true to enable.",
    });
  }

  const { scenes, prompt } = req.body as BatchGenerateRequest;

  if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
    return res.status(400).json({ error: "No scenes provided" });
  }

  // Set up SSE for progress updates
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const tasks: SceneGenerationTask[] = scenes.map((scene) => ({
    sceneId: scene.sceneId,
    sceneIndex: scene.sceneIndex,
    sceneContext: scene.sceneContext,
    prompt,
  }));

  const onProgress = (update: SceneProgressUpdate) => {
    res.write(`data: ${JSON.stringify({ type: "progress", ...update })}\n\n`);
  };

  try {
    console.log(`[API] Starting batch generation for ${tasks.length} scenes`);

    const results = await generateScenesInParallel(tasks, onProgress);

    // Send final results
    for (const result of results) {
      res.write(`data: ${JSON.stringify({ type: "scene-result", ...result })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: "complete", results })}\n\n`);
    res.end();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Batch generation error:", errorMessage);
    res.write(`data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`);
    res.end();
  }
});

export default router;
