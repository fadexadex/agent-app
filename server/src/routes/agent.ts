import { Router, Request, Response } from "express";
import { pipeAgentUIStreamToResponse, UIMessage } from "ai";
import { access } from "fs/promises";
import { join } from "path";
import { remotionAgent } from "../agents/remotion-agent.js";
import { PREVIEWS_DIR } from "../tools/render-scene.js";
import { renderStates } from "../lib/render-state.js";
import { getGeneratedAssets } from "../lib/generated-assets.js";
import { config } from "../lib/config.js";
import { prepareChatMessagesForAgent } from "../lib/chat-request-preparation.js";
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

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages: rawMessages, sceneId, sceneContext, assets, projectId } = req.body as ChatRequest;
    const { messages, referenceAssets } = await prepareChatMessagesForAgent({
      rawMessages,
      legacyAssetUrls: assets,
      sceneContext,
      projectId,
      supportsVision: config.supportsVision,
    });

    console.log(
      `[API] Processing chat with ${messages.length} messages. History length: ${JSON.stringify(messages).length} chars.`,
    );
    if (referenceAssets.length > 0) {
      console.log(
        `[API] Prepared ${referenceAssets.length} grounded asset(s) for the latest user turn.`,
      );
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
