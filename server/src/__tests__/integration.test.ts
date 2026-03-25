import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { Server } from "http";

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

export const IntegrationTestScene: React.FC = () => {
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
        sceneId: "integration-test-scene",
        fileName: "IntegrationTestScene",
        content: sceneCode,
      },
      toolOpts
    )) as { success: boolean; fileName: string };
    expect(writeResult.success).toBe(true);
    expect(writeResult.fileName).toBe("IntegrationTestScene.tsx");

    // Step 5: Trigger preview (this will update Root.tsx)
    const previewResult = (await triggerPreviewTool.execute!(
      {
        projectFolder: "integration-test",
        sceneId: "integration-test-scene",
        componentName: "IntegrationTestScene",
        fileName: "IntegrationTestScene",
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
    expect(previewResult.previewUrl).toBe(
      "http://localhost:3100/preview/integration-test-scene"
    );

    // Verify Root.tsx was updated
    const { readFile } = await import("fs/promises");
    const { resolve, join } = await import("path");
    const rootPath = resolve(process.cwd(), "../remotion/src/Root.tsx");
    const rootContent = await readFile(rootPath, "utf-8");

    expect(rootContent).toContain("IntegrationTestScene");
    expect(rootContent).toContain('id="integration-test-scene"');
  });
});
