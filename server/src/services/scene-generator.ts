import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  buildReferenceAssetsBlock,
  resolveUploadedAssets,
  toModelAssetPart,
  type UploadedAssetDescriptor,
} from "../lib/uploaded-assets.js";

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

interface BrandFont { role?: string; family: string; }

type SceneGenerationAssetInput =
  | string
  | {
      url: string;
      filename?: string;
      mediaType?: string;
    };

function normalizeSceneGenerationAssets(
  assets: SceneGenerationAssetInput[],
): {
  uploadedAssetInputs: {
    url: string;
    filename?: string;
    mediaType?: string;
  }[];
  externalAssetUrls: string[];
} {
  const uploadedAssetInputs: {
    url: string;
    filename?: string;
    mediaType?: string;
  }[] = [];
  const externalAssetUrls: string[] = [];

  for (const asset of assets) {
    if (typeof asset === "string") {
      if (/^https?:\/\//i.test(asset)) {
        externalAssetUrls.push(asset);
      } else {
        uploadedAssetInputs.push({ url: asset });
      }
      continue;
    }

    if (!asset?.url) {
      continue;
    }

    if (/^https?:\/\//i.test(asset.url)) {
      externalAssetUrls.push(asset.url);
      continue;
    }

    uploadedAssetInputs.push({
      url: asset.url,
      filename: asset.filename,
      mediaType: asset.mediaType,
    });
  }

  return { uploadedAssetInputs, externalAssetUrls };
}

function buildSystemPrompt(
  uploadedAssets: UploadedAssetDescriptor[] = [],
  externalAssetUrls: string[] = [],
  brandColors: string[] = [],
  brandName?: string,
  generationMode?: string,
  brandFonts: BrandFont[] = [],
  brandLogos: string[] = [],
  brandBackdrops: string[] = [],
): string {
  let assetInstruction = "";
  if (uploadedAssets.length > 0) {
    const assetLines = uploadedAssets
      .map(
        (asset) =>
          `- "${asset.filename}" -> source "${asset.sourceUrl}" and scene-code path staticFile('${asset.staticFilePath}')`,
      )
      .join("\n");
    assetInstruction =
      `\n\nThe user uploaded the following grounded assets:\n${assetLines}\n` +
      `Use these exact assets when planning the scenes. Do not substitute different logos, filenames, or placeholder imagery.\n` +
      `CRITICAL: For every element that should display an uploaded asset, set its type to "mockup" or "custom" and place the EXACT staticFile path string ` +
      `(e.g. staticFile('uploads/filename.jpg')) inside that element's \`props.src\` or \`content\` field. ` +
      `This is how the downstream code generator knows to embed the asset in the Remotion scene code.`;
  }

  const allExternal = [...new Set([...externalAssetUrls, ...brandLogos, ...brandBackdrops])];
  if (allExternal.length > 0) {
    assetInstruction +=
      `\n\nBRAND / EXTERNAL ASSET URLS:\n${allExternal.map((url) => `- ${url}`).join("\n")}\n` +
      `Reference these URLs directly in element props when a scene needs the exact uploaded brand asset, logo, or backdrop.`;
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

  let fontInstruction = "";
  if (brandFonts.length > 0) {
    const fontList = brandFonts.map(f => `${f.family}${f.role ? ` (${f.role})` : ""}`).join(", ");
    fontInstruction = `\n\nBrand Fonts: Apply these font families in text element props where applicable: ${fontList}.`;
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
- Make element descriptions vivid and specific — the Remotion developer uses them to build the component${assetInstruction}${brandInstruction}${colorInstruction}${fontInstruction}${modeInstruction}`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateSceneScript(
  prompt: string,
  modelId: string = "gemini-2.5-flash",
  assets: SceneGenerationAssetInput[] = [],
  brandColors: string[] = [],
  onProgress: (event: ProgressEvent) => void,
  brandName?: string,
  generationMode?: string,
  brandFonts: BrandFont[] = [],
  brandLogos: string[] = [],
  brandBackdrops: string[] = [],
): Promise<void> {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  onProgress({ step: "analyzing", message: "Analyzing your product..." });

  const { uploadedAssetInputs, externalAssetUrls } =
    normalizeSceneGenerationAssets(assets);
  const resolvedAssets = await resolveUploadedAssets(uploadedAssetInputs);
  const referenceAssetsBlock = buildReferenceAssetsBlock(resolvedAssets);
  const mappedParts: any[] = [
    {
      type: "text",
      text:
        `${referenceAssetsBlock}Generate 5-6 Remotion video scenes for this product: ${prompt}`,
    },
    ...resolvedAssets.map((asset) => toModelAssetPart(asset)),
  ];

  const result = streamObject({
    model: google(modelId),
    output: "array",
    schema: SceneSchema,
    system: buildSystemPrompt(
      resolvedAssets,
      externalAssetUrls,
      brandColors,
      brandName,
      generationMode,
      brandFonts,
      brandLogos,
      brandBackdrops,
    ),
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
