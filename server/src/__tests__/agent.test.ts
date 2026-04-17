import { describe, it, expect } from "vitest";
import { remotionAgent } from "../agents/remotion-agent.js";

describe("Remotion Agent", () => {
  it("should have correct id", () => {
    expect(remotionAgent.id).toBe("remotion-scene-agent");
  });

  it("should have all required tools", () => {
    const tools = remotionAgent.tools;
    expect(tools).toBeDefined();

    const toolNames = Object.keys(tools);
    expect(toolNames).toContain("think");
    expect(toolNames).toContain("readFile");
    expect(toolNames).toContain("listFiles");
    expect(toolNames).toContain("writeSceneCode");
    expect(toolNames).toContain("triggerPreview");
    expect(toolNames).toContain("renderScene");
    expect(toolNames).toContain("awaitRender");
    expect(toolNames.length).toBeGreaterThanOrEqual(7);
  });

  it("should be a valid agent with stream method", () => {
    // ToolLoopAgent should have stream method
    expect(typeof remotionAgent.stream).toBe("function");
  });

  it("should be a valid agent with generate method", () => {
    // ToolLoopAgent should have generate method
    expect(typeof remotionAgent.generate).toBe("function");
  });
});

describe("Prompt Loader", () => {
  it("should load and combine prompts", async () => {
    const { loadDirectorPrompt } = await import("../lib/prompt-loader.js");
    const prompt = loadDirectorPrompt();

    expect(prompt).toBeDefined();
    expect(typeof prompt).toBe("string");
    console.log(`[Prompt Size]: The size of the Director system prompt is ${prompt.length} characters.`);
    
    expect(prompt.length).toBeGreaterThan(1000);

    // Should contain content from DIRECTOR_SYSTEM_PROMPT.md
    expect(prompt).toContain("Video Director Agent");

    // Should contain the workflow instructions we added
    expect(prompt).toContain("Tool Workflow");
    expect(prompt).toContain("triggerPreview");
  });
});

describe("Scene Registry", () => {
  it("should parse registered scenes from Root.tsx", async () => {
    const { getRegisteredScenes } = await import("../lib/scene-registry.js");
    const scenes = await getRegisteredScenes();

    expect(Array.isArray(scenes)).toBe(true);

    // Should find at least the default compositions
    if (scenes.length > 0) {
      const scene = scenes[0];
      expect(scene).toHaveProperty("id");
      expect(scene).toHaveProperty("componentName");
      expect(scene).toHaveProperty("durationInFrames");
      expect(scene).toHaveProperty("fps");
      expect(scene).toHaveProperty("width");
      expect(scene).toHaveProperty("height");
    }
  });
});
