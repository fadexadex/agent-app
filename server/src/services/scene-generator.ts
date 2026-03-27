import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";
import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Load few-shot example once at startup ────────────────────────────────────

let SCENE_EXAMPLE = "";
try {
  SCENE_EXAMPLE = readFileSync(
    resolve(process.cwd(), "../remotion/prompts/scene-email-feature.json"),
    "utf-8",
  );
} catch {
  // Fallback: minimal inline example so the service still works
  SCENE_EXAMPLE = JSON.stringify({
    scene: {
      id: "example-scene",
      name: "Example Scene",
      category: "feature",
      duration: 120,
      background: { type: "solid", color: "#FFFFFF" },
      elements: [
        {
          type: "text",
          id: "headline",
          description: "Main headline text",
          animation: { timing: { start: 0, duration: 30, spring: "smooth" } },
          exit: { frame: 100, type: "blur", duration: 15 },
        },
      ],
      transition: { type: "blur", duration: 15 },
      notes: "Exit elements staggered by 3 frames.",
    },
  }, null, 2);
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const SceneElementSchema = z.object({
  type: z.enum(["text", "mockup", "shape", "custom", "iconGrid"]),
  id: z.string(),
  component: z.string().optional(),
  description: z.string(),
  props: z.record(z.unknown()).optional(),
  position: z
    .object({
      anchor: z.string(),
      x: z.number().optional(),
      y: z.number().optional(),
    })
    .optional(),
  animation: z
    .object({
      preset: z.string().optional(),
      timing: z.object({
        start: z.number(),
        duration: z.number(),
        spring: z.string().optional(),
      }),
      description: z.string().optional(),
      rotate3d: z
        .object({
          startX: z.number(),
          startY: z.number(),
          endX: z.number(),
          endY: z.number(),
        })
        .optional(),
    })
    .optional(),
  typewriter: z
    .object({
      text: z.string(),
      speed: z.number(),
      start: z.number(),
    })
    .optional(),
  exit: z
    .object({
      frame: z.number(),
      type: z.string(),
      duration: z.number(),
    })
    .optional(),
  mockupType: z.string().optional(),
  content: z.string().optional(),
});

export const SceneSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["hook", "intro", "feature", "benefit", "cta", "transition"]),
  duration: z.number().min(60).max(300),
  background: z.object({
    type: z.enum(["solid", "gradient", "noise", "mesh"]),
    color: z.string().optional(),
    colors: z.array(z.string()).optional(),
    preset: z.string().optional(),
  }),
  elements: z.array(SceneElementSchema).min(1).max(6),
  transition: z
    .object({
      type: z.string(),
      duration: z.number(),
    })
    .optional(),
  notes: z.string().optional(),
});

export type GeneratedScene = z.infer<typeof SceneSchema>;

// ─── Progress event types ─────────────────────────────────────────────────────

export type ProgressEvent =
  | { step: "analyzing"; message: string }
  | { step: "writing"; message: string }
  | { step: "designing"; message: string }
  | { step: "scene"; scene: GeneratedScene }
  | { step: "complete" }
  | { step: "error"; message: string };

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(
  assets: string[] = [],
  brandColors: string[] = [],
  brandName?: string,
  generationMode?: string,
): string {
  let assetInstruction = "";
  if (assets.length > 0) {
    assetInstruction = `\n\nThe user has uploaded the following assets:\n${assets.join("\n")}\nYou can reference these exact URLs in the scene elements (e.g., for MockupFrame, Image, or custom components). Utilize these assets directly in the scenes.`;
  }

  const trimmedBrand = brandName?.trim();
  let brandInstruction = "";
  if (trimmedBrand) {
    brandInstruction = `\n\nBrand name (use for logos, titles, and CTA copy when appropriate): ${trimmedBrand}. Do not substitute a different company name.`;
  }

  let colorInstruction = "";
  if (brandColors.length > 0) {
    colorInstruction = `\n\nBrand Colors (REQUIRED): ${brandColors.join(", ")}
YOU MUST use these colors in scene backgrounds. For solid backgrounds, pick one of these colors.
For gradient backgrounds, combine 2-3 of these colors. DO NOT use random colors when brand colors are provided.
Use these colors for text accents and UI elements where appropriate.`;
  }

  let modeInstruction = "";
  if (generationMode === "animate-media") {
    modeInstruction = `\n\nMODE: Animate Media. The user wants to animate their provided assets (like PDFs or images). Focus on creating scenes that display the uploaded assets prominently using panning, zooming, and motion suitable for a data/media showcase. Do not invent fake product UI if they just want their media animated.`;
  }

  return `You are a video scene scriptwriter for Remotion animations.

Generate exactly 5-6 scenes for a product demo video. Follow EXACTLY this JSON structure (the schema of one scene object — do not include the outer "scene" wrapper key):

${SCENE_EXAMPLE}

Rules:
- Output an array of 5-6 scene objects (no wrapper object, just the array)
- category sequence: hook → intro → feature → feature → benefit → cta
- duration: integer frames at 30fps (90–150 frames per scene is typical)
- spring values: "snappy" | "smooth" | "bouncy" | "heavy"
- element types: text | mockup | custom | iconGrid
- For mockup elements use mockupType: "browser" | "iphone15" | "card"
- For custom elements, set component to a Remotion component name (e.g. "FeaturePill", "VoiceIndicatorPill", "AnimatedText", "MockupFrame")
- notes: concise exit order + stagger timing guidance (e.g. "Exit order: mockup first, label last. Stagger 3 frames.")
- id: unique kebab-case slug per scene
- Make element descriptions vivid and specific — the Remotion developer uses them to build the component${assetInstruction}${brandInstruction}${colorInstruction}${modeInstruction}`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateSceneScript(
  prompt: string,
  modelId: string = "gemini-2.5-flash",
  assets: string[] = [],
  brandColors: string[] = [],
  onProgress: (event: ProgressEvent) => void,
  brandName?: string,
  generationMode?: string,
): Promise<void> {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  onProgress({ step: "analyzing", message: "Analyzing your product..." });

  const UPLOADS_DIR = resolve(process.cwd(), "../remotion/public");
  const contentParts: any[] = [{ type: "text", text: `Generate 5-6 Remotion video scenes for this product: ${prompt}` }];

  // Inject base64 data for each asset so Gemini can "see" them
  if (assets.length > 0) {
    const fs = await import("fs/promises");
    const mime = await import("mime-types");
    for (const assetUrl of assets) {
      try {
        const localPath = resolve(UPLOADS_DIR, assetUrl.replace(/^\//, ""));
        const fileData = await fs.readFile(localPath);
        const base64Data = fileData.toString("base64");
        const mimeType = mime.lookup(localPath) || "application/octet-stream";
        contentParts.push({
          type: "file",
          data: base64Data, // Some models might need data URL format depending on AI SDK version, but google sdk usually expects base64 or DataURL. We'll use data URL to be safe, per documentation.
          mimeType,
        });
      } catch (err) {
        console.error(`[scene-generator] Failed to read asset ${assetUrl}:`, err);
      }
    }
  }

  // We map file part correctly for AI SDK Core
  const mappedParts = contentParts.map(part => {
    if (part.type === "file") {
      const isImage = part.mimeType && part.mimeType.startsWith('image/');
      // AI SDK 3.x+ expects the actual binary data or a URL, not a data URL string.
      // We pass the raw Uint8Array buffer here
      if (isImage) {
        return {
          type: "image",
          image: Buffer.from(part.data, "base64"),
          mediaType: part.mimeType,
        };
      }
      return {
        type: "file",
        data: Buffer.from(part.data, "base64"),
        mediaType: part.mimeType,
      };
    }
    return part;
  });

  const result = streamObject({
    model: google(modelId),
    output: "array",
    schema: SceneSchema,
    system: buildSystemPrompt(assets, brandColors, brandName, generationMode),
    messages: [
      { role: "user", content: mappedParts as any }
    ],
  });

  onProgress({ step: "writing", message: "Writing your story arc..." });

  let sceneCount = 0;
  for await (const scene of result.elementStream) {
    if (sceneCount === 2) {
      onProgress({ step: "designing", message: "Composing visual elements..." });
    }
    onProgress({ step: "scene", scene });
    sceneCount++;
  }

  onProgress({ step: "complete" });
}
