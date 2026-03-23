import { tool } from "ai";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import { join, resolve, dirname } from "path";

// Base directory for remotion scenes
const REMOTION_DIR = resolve(process.cwd(), "../remotion");
const SCENES_DIR = join(REMOTION_DIR, "src/scenes");

// Sanitize filename - only allow alphanumeric, dash, underscore
function sanitizeFileName(fileName: string): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!sanitized) {
    throw new Error("Invalid filename");
  }
  return sanitized;
}

// Ensure path is within scenes directory (prevent path traversal)
function safeScenesPath(fileName: string): { path: string; sanitizedName: string } {
  const sanitizedName = sanitizeFileName(fileName);
  const fullPath = join(SCENES_DIR, `${sanitizedName}.tsx`);
  if (!fullPath.startsWith(SCENES_DIR)) {
    throw new Error("Path must be within scenes directory");
  }
  return { path: fullPath, sanitizedName };
}

// Tool for writing scene code to the remotion/src/scenes directory
export const writeSceneCodeTool = tool({
  description:
    "Write a Remotion scene component to the scenes directory. This creates or updates a TSX file that can be rendered by Remotion.",
  inputSchema: z.object({
    sceneId: z
      .string()
      .describe(
        "Unique identifier for the scene (e.g., 'hook-intro', 'feature-demo')"
      ),
    fileName: z
      .string()
      .describe(
        "Name of the file without extension (e.g., 'HookIntro' will create HookIntro.tsx)"
      ),
    content: z
      .string()
      .describe("The complete TypeScript/React component code for the scene"),
  }),
  execute: async ({ sceneId, fileName, content }) => {
    try {
      // Ensure scenes directory exists
      await mkdir(SCENES_DIR, { recursive: true });

      // Write the scene file (sanitizes filename)
      const { path: filePath, sanitizedName } = safeScenesPath(fileName);
      await writeFile(filePath, content, "utf-8");

      return {
        success: true,
        sceneId,
        fileName: `${sanitizedName}.tsx`,
        path: `remotion/src/scenes/${sanitizedName}.tsx`,
        bytesWritten: Buffer.byteLength(content),
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error writing scene";
      return {
        success: false,
        sceneId,
        error: message,
      };
    }
  },
});
