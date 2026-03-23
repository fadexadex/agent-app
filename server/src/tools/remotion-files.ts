import { tool } from "ai";
import { z } from "zod";
import { readFile, readdir } from "fs/promises";
import { join, resolve } from "path";

// Base directory for remotion - all paths are relative to this
const REMOTION_DIR = resolve(process.cwd(), "../remotion");

// Ensure path is within remotion directory (prevent path traversal)
function safePath(relativePath: string): string {
  const fullPath = resolve(REMOTION_DIR, relativePath);
  if (!fullPath.startsWith(REMOTION_DIR)) {
    throw new Error("Path must be within remotion directory");
  }
  return fullPath;
}

// Tool for reading files within the remotion directory
export const readFileTool = tool({
  description:
    "Read a file from the remotion directory. Use this to examine existing components, examples, or configuration files.",
  inputSchema: z.object({
    path: z
      .string()
      .describe(
        "File path relative to the remotion/ directory (e.g., 'src/components/AnimatedText/AnimatedText.tsx')"
      ),
  }),
  execute: async ({ path }) => {
    try {
      const fullPath = safePath(path);
      const content = await readFile(fullPath, "utf-8");
      return {
        success: true,
        path,
        content,
        lines: content.split("\n").length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error reading file";
      return {
        success: false,
        path,
        error: message,
      };
    }
  },
});

// Tool for listing files in the remotion directory
export const listFilesTool = tool({
  description:
    "List files and directories within the remotion directory. Use this to explore the codebase structure.",
  inputSchema: z.object({
    path: z
      .string()
      .optional()
      .describe(
        "Directory path relative to remotion/ (e.g., 'src/components'). Leave empty for root."
      ),
  }),
  execute: async ({ path = "" }) => {
    try {
      const fullPath = safePath(path);
      const entries = await readdir(fullPath, { withFileTypes: true });
      const files = entries.map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? "directory" : "file",
      }));

      return {
        success: true,
        path: path || "/",
        files,
        count: files.length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error listing directory";
      return {
        success: false,
        path: path || "/",
        error: message,
        files: [],
      };
    }
  },
});
