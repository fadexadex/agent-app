import { Router, Request, Response } from "express";
import { generateSceneScript, ProgressEvent } from "../services/scene-generator.js";

const router = Router();

router.post("/generate", async (req: Request, res: Response) => {
  const { prompt, assets, brandColors, brandName, generationMode, brandFonts, brandLogos, brandBackdrops } = req.body as {
    prompt?: string;
    assets?: Array<
      | string
      | {
          url: string;
          filename?: string;
          mediaType?: string;
        }
    >;
    brandColors?: string[];
    brandName?: string;
    generationMode?: string;
    brandFonts?: { role?: string; family: string }[];
    brandLogos?: string[];
    brandBackdrops?: string[];
  };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering if proxied
  res.flushHeaders();

  const send = (event: ProgressEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    await generateSceneScript(
      prompt.trim(),
      assets || [],
      brandColors || [],
      send,
      typeof brandName === "string" ? brandName : undefined,
      typeof generationMode === "string" ? generationMode : undefined,
      brandFonts || [],
      brandLogos || [],
      brandBackdrops || [],
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[scenes/generate] error:", message);
    send({ step: "error", message });
  } finally {
    res.end();
  }
});

export default router;
