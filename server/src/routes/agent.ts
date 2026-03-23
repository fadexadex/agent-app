import { Router, Request, Response } from "express";
import { pipeAgentUIStreamToResponse } from "ai";
import { access } from "fs/promises";
import { join } from "path";
import { remotionAgent } from "../agents/remotion-agent.js";
import { PREVIEWS_DIR } from "../tools/render-scene.js";

const router = Router();

interface ChatRequest {
  messages: unknown[];
  sceneId?: string;
  sceneContext?: {
    title?: string;
    description?: string;
    duration?: number;
  };
}

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages, sceneId, sceneContext } = req.body as ChatRequest;

    // Build context to include in the agent's context
    let contextInfo = "";
    if (sceneId) {
      contextInfo = `[Scene: ${sceneId}]`;
      if (sceneContext?.title) {
        contextInfo += ` Title: "${sceneContext.title}"`;
      }
      if (sceneContext?.description) {
        contextInfo += ` - ${sceneContext.description}`;
      }
      if (sceneContext?.duration) {
        contextInfo += ` (${sceneContext.duration}s)`;
      }
    }

    if (contextInfo) {
      console.log(`[API] Scene context: ${contextInfo}`);
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
  const { sceneId } = req.params;
  const videoPath = join(PREVIEWS_DIR, `${sceneId}.mp4`);

  try {
    await access(videoPath);
    // File exists — render is complete
    res.json({ status: "complete", videoUrl: `/previews/${sceneId}.mp4` });
  } catch {
    // File not yet available — still rendering or failed
    res.json({ status: "rendering" });
  }
});

export default router;
