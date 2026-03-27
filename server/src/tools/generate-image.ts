import { tool } from "ai";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { addGeneratedAsset } from "../lib/generated-assets.js";

const GENERATED_DIR = resolve(process.cwd(), "../remotion/public", "generated");
mkdirSync(GENERATED_DIR, { recursive: true });

export const generateImageTool = tool({
  description:
    "Generate an image using AI. Use ONLY when the scene absolutely requires a custom image " +
    "that cannot be created with code (e.g., product photos, realistic backgrounds, complex illustrations). " +
    "For simple shapes, gradients, or UI elements - use code instead.",
  inputSchema: z.object({
    prompt: z.string().describe("Detailed image description"),
    style: z.enum(["realistic", "illustration", "3d-render", "minimalist"]).optional(),
  }),
  execute: async ({ prompt, style }) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

    const fullPrompt = style
      ? `${prompt}. Style: ${style}, high quality, professional`
      : prompt;

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
          const buffer = Buffer.from(part.inlineData.data, "base64");
          writeFileSync(filePath, buffer);

          const imageUrl = `/generated/${fileName}`;
          addGeneratedAsset(imageId, imageUrl, fullPrompt);

          return {
            success: true,
            imageUrl,
            imageId,
            prompt: fullPrompt,
          };
        }
      }

      return { success: false, error: "No image generated" };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to generate image" };
    }
  },
});
