import { tool } from "ai";
import { z } from "zod";
import { writeFile, mkdir, readdir, readFile } from "fs/promises";
import { join, dirname } from "path";

const OUTPUT_DIR = "./output";

// Tool for exploring files in the output directory
export const exploreFilesTool = tool({
  description:
    "List and optionally read files in the output directory. Use this to understand the current state of generated content.",
  inputSchema: z.object({
    path: z
      .string()
      .optional()
      .describe("Subdirectory path to explore (relative to output folder)"),
    readFile: z
      .string()
      .optional()
      .describe("If provided, read the content of this file"),
  }),
  execute: async ({ path, readFile: fileToRead }) => {
    const targetDir = path ? join(OUTPUT_DIR, path) : OUTPUT_DIR;

    try {
      if (fileToRead) {
        const filePath = join(OUTPUT_DIR, fileToRead);
        const content = await readFile(filePath, "utf-8");
        return {
          type: "file_content" as const,
          path: fileToRead,
          content,
        };
      }

      const entries = await readdir(targetDir, { withFileTypes: true });
      const files = entries.map((e) => ({
        name: e.name,
        type: e.isDirectory() ? "directory" : "file",
      }));

      return {
        type: "file_list" as const,
        path: path || "/",
        files,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return {
          type: "file_list" as const,
          path: path || "/",
          files: [],
          note: "Directory does not exist yet",
        };
      }
      throw error;
    }
  },
});

// Tool for writing files to the output directory
export const writeFileTool = tool({
  description:
    "Write content to a file in the output directory. Creates parent directories if needed.",
  inputSchema: z.object({
    path: z
      .string()
      .describe(
        "File path relative to output folder (e.g., 'scene/composition.json')"
      ),
    content: z.string().describe("Content to write to the file"),
  }),
  execute: async ({ path, content }) => {
    const filePath = join(OUTPUT_DIR, path);

    // Ensure parent directory exists
    await mkdir(dirname(filePath), { recursive: true });

    // Write the file
    await writeFile(filePath, content, "utf-8");

    return {
      success: true,
      path,
      bytesWritten: Buffer.byteLength(content),
    };
  },
});

// Tool for structured thinking
export const thinkTool = tool({
  description:
    "Use this tool to think through complex problems step by step. The user will see your thinking process.",
  inputSchema: z.object({
    thoughts: z
      .array(z.string())
      .describe(
        "Array of thought steps, each a concise observation or reasoning step"
      ),
  }),
  execute: async ({ thoughts }) => {
    return {
      acknowledged: true,
      thoughtCount: thoughts.length,
    };
  },
});
