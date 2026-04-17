import { tool } from "ai";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { addGeneratedAsset } from "../lib/generated-assets.js";

const GENERATED_DIR = resolve(process.cwd(), "../remotion/public", "generated");
mkdirSync(GENERATED_DIR, { recursive: true });

/**
 * Per-asset-type prompt prefixes that steer the model toward
 * isolated, compositable assets rather than full-scene illustrations.
 */
const ASSET_PREFIXES: Record<string, string> = {
  product:
    "Product photography: isolated product on a plain white background, " +
    "studio lighting, sharp focus, no shadows, no other objects, photorealistic.",
  logo:
    "Clean vector-style logo / brand mark on a flat white background, " +
    "high contrast, no drop shadows, minimal design, professional.",
  icon:
    "Single flat UI icon centered on a pure white background, " +
    "clean lines, no background pattern, icon-pack style, 1:1 square.",
  person:
    "Portrait or full-body photo of a person, isolated on a plain white background, " +
    "professional studio lighting, no props, sharp edges.",
  illustration:
    "Flat vector illustration on a white background, clean bold shapes, " +
    "professional editorial style, no photograph, no gradients.",
  texture:
    "Seamless repeating texture / material surface, tileable, " +
    "even lighting, no obvious seams, high detail.",
  screenshot:
    "Realistic UI screenshot / app screen mockup, " +
    "clean modern interface, no device frame, flat perspective.",
  background:
    "Abstract graphic background / wallpaper, " +
    "suitable for overlaying text, wide 16:9 format, no focal objects.",
  chart:
    "Clean infographic chart or data visualisation on a white background, " +
    "professional business style, clear labels, flat colours.",
  other: "",
};

export const generateImageTool = tool({
  description:
    "Generate a visual asset using AI image generation. " +
    "Call this whenever the scene needs a real-world visual element that cannot be built with Remotion code alone: " +
    "a product shot, a person, a logo, an icon, a UI screenshot, a texture, a chart, etc. " +
    "Do NOT use for simple geometric shapes, gradients, or typographic effects — build those with code. " +
    "Choose the assetType that best matches what you need; the generator will automatically steer the output " +
    "toward an isolated, compositable asset rather than a full-scene illustration.",

  inputSchema: z.object({
    description: z
      .string()
      .describe(
        "What the asset should look like. Be specific: describe colours, style, subject, and any key details. " +
          "Do NOT describe layout or animation — only the visual content of the asset itself."
      ),
    assetType: z
      .enum([
        "product",      // physical product isolated on white
        "logo",         // brand mark / logomark
        "icon",         // single UI/concept icon
        "person",       // portrait or full-body person
        "illustration", // flat vector-style illustration
        "texture",      // seamless surface / material
        "screenshot",   // UI / app screen mockup
        "background",   // abstract graphic background
        "chart",        // infographic / data visualisation
        "other",        // fallback — describe fully in `description`
      ])
      .describe(
        "The category of asset. Controls quality-steering prompts that ensure the output is " +
          "a clean, isolated element rather than a full scene composition."
      ),
  }),

  execute: async ({ description, assetType }) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

    const prefix = ASSET_PREFIXES[assetType] ?? "";
    const fullPrompt = prefix
      ? `${prefix}\n\nSubject: ${description}`
      : description;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: fullPrompt,
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const imageId = randomUUID();
          const fileName = `${imageId}.png`;
          const filePath = resolve(GENERATED_DIR, fileName);
          const buffer = Buffer.from(part.inlineData.data as string, "base64");
          writeFileSync(filePath, buffer);

          const imageUrl = `/generated/${fileName}`;
          // staticFilePath is relative to remotion/public/.
          // Use with staticFile() in scene code — works for local render AND Lambda.
          const staticFilePath = `generated/${fileName}`;
          addGeneratedAsset(imageId, imageUrl, fullPrompt);

          console.log(`[generateImage] Generated ${assetType} asset → ${staticFilePath}`);

          return {
            success: true,
            assetType,
            imageUrl,
            staticFilePath,
            imageId,
            usageExample: `<img src={staticFile('${staticFilePath}')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />`,
          };
        }
      }

      return { success: false, error: "No image data returned by the model." };
    } catch (e: any) {
      return { success: false, error: e.message || "Image generation failed." };
    }
  },
});
