import { describe, it, expect, afterAll } from "vitest";
import { readFile, rm } from "fs/promises";
import { join } from "path";

// Import the tools
import { thinkTool } from "../tools/think.js";
import { readFileTool, listFilesTool } from "../tools/remotion-files.js";
import { writeSceneCodeTool } from "../tools/write-scene.js";

// Helper: AI SDK v6 tool.execute takes (input, options) and may return Result | AsyncIterable
// We provide a minimal options object and assert non-iterable result.
const toolOpts = { toolCallId: "test", messages: [] as never[] };

describe("Tools", () => {
  describe("thinkTool", () => {
    it("should acknowledge thoughts", async () => {
      const result = await thinkTool.execute!(
        {
          thoughts: [
            "First, I need to understand the scene requirements",
            "The scene needs animated text with a gradient background",
            "I should use AnimatedText and Background components",
          ],
        },
        toolOpts
      );

      expect(result).toHaveProperty("acknowledged", true);
      expect(result).toHaveProperty("thoughtCount", 3);
    });

    it("should handle empty thoughts array", async () => {
      const result = await thinkTool.execute!({ thoughts: [] }, toolOpts);

      expect(result).toHaveProperty("acknowledged", true);
      expect(result).toHaveProperty("thoughtCount", 0);
    });
  });

  describe("listFilesTool", () => {
    it("should list files in remotion/src directory", async () => {
      const result = (await listFilesTool.execute!(
        { path: "src" },
        toolOpts
      )) as { success: boolean; path: string; files: { name: string; type: string }[]; count: number };

      expect(result.success).toBe(true);
      expect(result.path).toBe("src");
      expect(Array.isArray(result.files)).toBe(true);
      expect(result.files.length).toBeGreaterThan(0);

      // Should contain known directories/files
      const names = result.files.map((f) => f.name);
      expect(names).toContain("components");
      expect(names).toContain("Root.tsx");
    });

    it("should list files in root remotion directory", async () => {
      const result = (await listFilesTool.execute!({}, toolOpts)) as {
        success: boolean;
        path: string;
        files: { name: string; type: string }[];
      };

      expect(result.success).toBe(true);
      expect(result.path).toBe("/");
      expect(Array.isArray(result.files)).toBe(true);

      const names = result.files.map((f) => f.name);
      expect(names).toContain("src");
      expect(names).toContain("prompts");
    });

    it("should handle non-existent directory", async () => {
      const result = (await listFilesTool.execute!(
        { path: "nonexistent" },
        toolOpts
      )) as { success: boolean; error?: string };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("readFileTool", () => {
    it("should read existing file", async () => {
      const result = (await readFileTool.execute!(
        { path: "src/Root.tsx" },
        toolOpts
      )) as { success: boolean; path: string; content: string; lines: number };

      expect(result.success).toBe(true);
      expect(result.path).toBe("src/Root.tsx");
      expect(result.content).toContain("Composition");
      expect(result.lines).toBeGreaterThan(0);
    });

    it("should handle non-existent file", async () => {
      const result = (await readFileTool.execute!(
        { path: "nonexistent.tsx" },
        toolOpts
      )) as { success: boolean; error?: string };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("writeSceneCodeTool", () => {
    const testSceneId = "test-scene-vitest";
    const testFileName = "TestSceneVitest";
    const testContent = `import { AbsoluteFill } from 'remotion';

export const TestSceneVitest: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'blue' }}>
      <h1>Test Scene</h1>
    </AbsoluteFill>
  );
};
`;

    afterAll(async () => {
      // Clean up test file
      try {
        const scenesDir = join(process.cwd(), "../remotion/src/scenes");
        await rm(join(scenesDir, `${testFileName}.tsx`), { force: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    it("should write scene code to scenes directory", async () => {
      const result = (await writeSceneCodeTool.execute!(
        {
          sceneId: testSceneId,
          fileName: testFileName,
          content: testContent,
        },
        toolOpts
      )) as { success: boolean; sceneId: string; fileName: string; bytesWritten: number };

      expect(result.success).toBe(true);
      expect(result.sceneId).toBe(testSceneId);
      expect(result.fileName).toBe(`${testFileName}.tsx`);
      expect(result.bytesWritten).toBeGreaterThan(0);

      // Verify file was actually written
      const scenesDir = join(process.cwd(), "../remotion/src/scenes");
      const writtenContent = await readFile(
        join(scenesDir, `${testFileName}.tsx`),
        "utf-8"
      );
      expect(writtenContent).toBe(testContent);
    });

    it("should sanitize filename", async () => {
      const result = (await writeSceneCodeTool.execute!(
        {
          sceneId: "test",
          fileName: "Test../../../etc/passwd",
          content: "malicious",
        },
        toolOpts
      )) as { success: boolean; fileName?: string };

      // Should sanitize to just alphanumeric
      expect(result.success).toBe(true);
      expect(result.fileName).not.toContain("..");
      expect(result.fileName).not.toContain("/");
    });
  });
});
