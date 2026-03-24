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

function buildSystemPrompt(): string {
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
- Make element descriptions vivid and specific — the Remotion developer uses them to build the component`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateSceneScript(
  prompt: string,
  modelId: string = "gemini-2.5-flash",
  onProgress: (event: ProgressEvent) => void,
): Promise<void> {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  onProgress({ step: "analyzing", message: "Analyzing your product..." });

  const result = streamObject({
    model: google(modelId),
    output: "array",
    schema: SceneSchema,
    system: buildSystemPrompt(),
    prompt: `Generate 5-6 Remotion video scenes for this product: ${prompt}`,
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
