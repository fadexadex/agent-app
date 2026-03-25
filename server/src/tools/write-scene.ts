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
function safeScenesPath(projectFolder: string, fileName: string): { dirPath: string; path: string; sanitizedFolder: string; sanitizedName: string } {
  const sanitizedFolder = sanitizeFileName(projectFolder);
  const sanitizedName = sanitizeFileName(fileName);
  const dirPath = join(SCENES_DIR, sanitizedFolder);
  const fullPath = join(dirPath, `${sanitizedName}.tsx`);
  if (!fullPath.startsWith(SCENES_DIR)) {
    throw new Error("Path must be within scenes directory");
  }
  return { dirPath, path: fullPath, sanitizedFolder, sanitizedName };
}

// Tool for writing scene code to the remotion/src/scenes directory
export const writeSceneCodeTool = tool({
  description:
    "Write a Remotion scene component to a project folder within the scenes directory. This creates or updates a TSX file that can be rendered by Remotion. Group all scenes for a single video into the same projectFolder.",
  inputSchema: z.object({
    projectFolder: z
      .string()
      .describe(
        "A descriptive folder name to group all scenes for this video project (e.g., 'app-promo', 'tiktok-hook'). Must be consistent across all scenes for the current project."
      ),
    sceneId: z
      .string()
      .describe(
        "Unique identifier for the scene (e.g., 'hook-intro', 'feature-demo')"
      ),
    fileName: z
      .string()
      .describe(
        "Name of the file without extension (e.g., 'HookIntro' will create [projectFolder]/HookIntro.tsx)"
      ),
    content: z
      .string()
      .describe("The complete TypeScript/React component code for the scene"),
  }),
  execute: async ({ projectFolder, sceneId, fileName, content }) => {
    try {
      // Write the scene file (sanitizes filename and folder)
      const { dirPath, path: filePath, sanitizedFolder, sanitizedName } = safeScenesPath(projectFolder, fileName);

      // Ensure the project folder exists
      await mkdir(dirPath, { recursive: true });
      
      await writeFile(filePath, content, "utf-8");

      return {
        success: true,
        sceneId,
        projectFolder: sanitizedFolder,
        fileName: `${sanitizedName}.tsx`,
        path: `remotion/src/scenes/${sanitizedFolder}/${sanitizedName}.tsx`,
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
