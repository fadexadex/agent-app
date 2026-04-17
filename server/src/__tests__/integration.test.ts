import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { Server } from "http";
import { apiErrorHandler } from "../lib/http-errors.js";

// Helper: AI SDK v6 tool.execute takes (input, options)
const toolOpts = { toolCallId: "test", messages: [] as never[] };

// Note: This test validates the server setup without making actual AI calls
describe("Server Integration", () => {
  let app: express.Application;
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    // Create a minimal test server
    app = express();
    app.use(express.json());

    // Health check endpoint
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });

    // Start server on random port
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === "object") {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("should respond to health check", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
  });

  it("should have express app configured correctly", () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe("function");
  });

  it("should return a user-friendly error for oversized JSON payloads", async () => {
    const payload = { prompt: "x".repeat(2_000) };
    const oversizedApp = express();
    oversizedApp.use(express.json({ limit: "1kb" }));
    oversizedApp.post("/api/test", (req, res) => {
      res.json({ ok: true });
    });
    oversizedApp.use(apiErrorHandler);

    const oversizedServer = await new Promise<Server>((resolve) => {
      const instance = oversizedApp.listen(0, () => resolve(instance));
    });

    const address = oversizedServer.address();
    const oversizedBaseUrl =
      address && typeof address === "object"
        ? `http://localhost:${address.port}`
        : "";

    try {
      const response = await fetch(`${oversizedBaseUrl}/api/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data).toEqual({
        error:
          "Your request is too large. Shorten it or split it into smaller parts and try again.",
      });
    } finally {
      await new Promise<void>((resolve) => {
        oversizedServer.close(() => resolve());
      });
    }
  });
});

describe("Tool Execution Flow", () => {
  it("should execute think -> listFiles -> writeSceneCode -> triggerPreview flow", async () => {
    // Import all tools
    const { thinkTool } = await import("../tools/think.js");
    const { listFilesTool, readFileTool } = await import("../tools/remotion-files.js");
    const { writeSceneCodeTool } = await import("../tools/write-scene.js");
    const { triggerPreviewTool } = await import("../tools/trigger-preview.js");

    // Step 1: Think
    const thinkResult = (await thinkTool.execute!(
      {
        thoughts: [
          "I need to create a simple hook scene",
          "The scene should use AnimatedText with fadeBlurIn preset",
          "Background should be a dark gradient",
        ],
      },
      toolOpts
    )) as { acknowledged: boolean };
    expect(thinkResult.acknowledged).toBe(true);

    // Step 2: List files to understand structure
    const listResult = (await listFilesTool.execute!(
      { path: "src/components" },
      toolOpts
    )) as { success: boolean; files: { name: string }[] };
    expect(listResult.success).toBe(true);
    expect(listResult.files.length).toBeGreaterThan(0);

    // Step 3: Read an example component for reference
    const readResult = (await readFileTool.execute!(
      { path: "src/Root.tsx" },
      toolOpts
    )) as { success: boolean; content: string };
    expect(readResult.success).toBe(true);
    expect(readResult.content).toContain("Composition");

    // Step 4: Write scene code
    const sceneCode = `import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const CleanTestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background preset="deepPurpleAurora" />
      <AnimatedText
        text="Integration Test"
        preset="fadeBlurIn"
        anchor="center"
        fontSize={72}
        color="#ffffff"
      />
    </AbsoluteFill>
  );
};
`;

    const writeResult = (await writeSceneCodeTool.execute!(
      {
        projectFolder: "integration-test",
        sceneId: "clean-test-scene",
        fileName: "CleanTestScene",
        content: sceneCode,
      },
      toolOpts
    )) as { success: boolean; fileName: string };
    expect(writeResult.success).toBe(true);
    expect(writeResult.fileName).toBe("CleanTestScene.tsx");

    // Step 5: Trigger preview (this will update Root.tsx)
    const previewResult = (await triggerPreviewTool.execute!(
      {
        projectFolder: "integration-test",
        sceneId: "clean-test-scene",
        componentName: "CleanTestScene",
        fileName: "CleanTestScene",
        durationFrames: 90,
        width: 1920,
        height: 1080,
        fps: 30,
      },
      toolOpts
    )) as { success: boolean; previewUrl: string; error?: string };
    
    if (!previewResult.success) {
      console.error(previewResult.error);
    }
    
    expect(previewResult.success).toBe(true);
    expect(previewResult.previewUrl).toContain("scene=clean-test-scene");
    expect(previewResult.previewUrl).toContain("component=CleanTestScene");

    // Verify Root.tsx was updated
    const { readFile } = await import("fs/promises");
    const { resolve, join } = await import("path");
    const rootPath = resolve(process.cwd(), "../remotion/src/Root.tsx");
    const rootContent = await readFile(rootPath, "utf-8");

    expect(rootContent).toContain("CleanTestScene");
    expect(rootContent).toContain('id="clean-test-scene"');
  });
});
