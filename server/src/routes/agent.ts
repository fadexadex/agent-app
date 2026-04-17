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
  projectId?: string; // Project UUID for organising render outputs
}

const UPLOADS_DIR = resolve(process.cwd(), "../remotion/public");

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages: rawMessages, sceneId, sceneContext, assets, projectId } = req.body as ChatRequest;

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

    // Resolve FileUIPart server-relative URLs into raw base64 payloads across ALL user messages.
    // For the agent streaming path, passing a data: URL causes the AI SDK to treat
    // it as a downloadable URL and reject it before provider conversion. Raw base64
    // keeps the part inline and lets the SDK use the declared media type.
    // We must resolve ALL messages (not just the last) so that follow-up messages
    // don't replay unresolved paths from earlier turns into the model, causing
    // "Base64 decoding failed for /uploads/..." errors.
    const lastUserMsgIndex = messages.reduce(
      (lastIdx: number, msg: any, i: number) => (msg?.role === "user" ? i : lastIdx),
      -1
    );
    const lastUserMsgAssets: Array<{ path: string; filename: string }> = [];

    for (let msgIdx = 0; msgIdx < messages.length; msgIdx++) {
      const msg = messages[msgIdx];
      if (msg?.role === "user" && Array.isArray(msg.parts)) {
        for (const part of msg.parts) {
          if (
            part.type === "file" &&
            typeof part.url === "string" &&
            (part.url.startsWith("/uploads/") || part.url.startsWith("/generated/"))
          ) {
            try {
              const originalUrl = part.url; // capture before overwrite
              const localPath = join(UPLOADS_DIR, originalUrl.replace(/^\//, ""));
              const fileData = await readFile(localPath);
              const mimeType = mime.lookup(localPath) || part.mediaType || "application/octet-stream";
              part.mediaType = mimeType;
              part.url = fileData.toString("base64");
              console.log(`[API] Resolved FileUIPart ${part.filename || localPath} → base64 bytes`);

              // Track assets from the last user message so we can tell the agent their paths
              if (msgIdx === lastUserMsgIndex) {
                lastUserMsgAssets.push({
                  path: originalUrl.replace(/^\//, ""), // "uploads/file-xxx.webp"
                  filename: part.filename || originalUrl.split("/").pop() || originalUrl,
                });
              }
            } catch (err) {
              console.error(`[API] Failed to resolve FileUIPart url ${part.url}:`, err);
            }
          }
        }
      }
    }

    // Inject [REFERENCE_ASSETS] block so the agent knows how to use staticFile() for uploaded images
    if (lastUserMsgAssets.length > 0 && lastUserMsgIndex !== -1) {
      const assetLines = lastUserMsgAssets
        .map(({ path, filename }) => `- "${filename}"  →  staticFile('${path}')`)
        .join("\n");

      const referenceAssetsText =
        `[REFERENCE_ASSETS]\n` +
        `The user has uploaded reference image(s) saved in the Remotion project's public folder.\n` +
        `Use staticFile() to reference them in scene code (import { staticFile } from 'remotion'):\n\n` +
        `${assetLines}\n` +
        `[/REFERENCE_ASSETS]\n\n`;

      const lastMessage = messages[lastUserMsgIndex];
      // Inject into msg.parts (AI SDK UIMessage format)
      if (Array.isArray(lastMessage.parts)) {
        const textPartIdx = lastMessage.parts.findIndex((p: any) => p.type === "text");
        if (textPartIdx !== -1) {
          lastMessage.parts[textPartIdx].text = referenceAssetsText + lastMessage.parts[textPartIdx].text;
        } else {
          lastMessage.parts.unshift({ type: "text", text: referenceAssetsText });
        }
      }
      // Also inject into msg.content (legacy/wire format)
      if (typeof lastMessage.content === "string") {
        lastMessage.content = referenceAssetsText + lastMessage.content;
      } else if (Array.isArray(lastMessage.content)) {
        const textPartIdx = lastMessage.content.findIndex((p: any) => p.type === "text");
        if (textPartIdx !== -1) {
          lastMessage.content[textPartIdx].text = referenceAssetsText + lastMessage.content[textPartIdx].text;
        } else {
          lastMessage.content.unshift({ type: "text", text: referenceAssetsText });
        }
      }
      console.log(`[API] Injected [REFERENCE_ASSETS] block with ${lastUserMsgAssets.length} asset(s)`);
    }

    // Legacy: Attach base64 data to the last user message if there are assets passed via body
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

    // Inject project context so the agent knows which projectId to pass to renderScene
    if (projectId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        const projectText = `[PROJECT_CONTEXT: projectId="${projectId}"]\nWhen calling renderScene, always pass this projectId so videos are stored under the project folder.\n\n`;
        if (typeof lastMessage.content === "string") {
          lastMessage.content = projectText + lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
          const textPartIndex = lastMessage.content.findIndex((p: any) => p.type === "text");
          if (textPartIndex !== -1) {
            lastMessage.content[textPartIndex].text = projectText + lastMessage.content[textPartIndex].text;
          } else {
            lastMessage.content.unshift({ type: "text", text: projectText });
          }
        }
        console.log(`[API] Injected project context for projectId=${projectId}`);
      }
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
  assets?: string[]; // uploaded file URLs like "/uploads/file-xxx.webp"
}

router.post("/generate-batch", async (req: Request, res: Response) => {
  if (!isParallelGenerationEnabled()) {
    return res.status(400).json({
      error: "Parallel generation is disabled. Set PARALLEL_GENERATION=true to enable.",
    });
  }

  const { scenes, prompt, assets } = req.body as BatchGenerateRequest;

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
    assets,
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
