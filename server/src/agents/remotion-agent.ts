import { ToolLoopAgent, stepCountIs, InferAgentUIMessage } from "ai";
import { model } from "../lib/gateway.js";
import { loadDirectorPrompt } from "../lib/prompt-loader.js";
import { thinkTool } from "../tools/think.js";
import { readFileTool, listFilesTool } from "../tools/remotion-files.js";
import { writeSceneCodeTool } from "../tools/write-scene.js";
import { triggerPreviewTool } from "../tools/trigger-preview.js";
import { renderSceneTool } from "../tools/render-scene.js";
import { awaitRenderTool } from "../tools/await-render.js";

/**
 * Remotion Scene Agent
 *
 * An AI agent specialized in generating Remotion video scenes.
 * It has access to tools for:
 * - Thinking through problems
 * - Reading/listing files in the remotion directory
 * - Writing scene code to remotion/src/scenes/
 * - Registering scenes and triggering previews
 */
export const remotionAgent = new ToolLoopAgent({
  id: "remotion-scene-agent",
  model,
  instructions: loadDirectorPrompt(),
  tools: {
    think: thinkTool,
    readFile: readFileTool,
    listFiles: listFilesTool,
    writeSceneCode: writeSceneCodeTool,
    triggerPreview: triggerPreviewTool,
    renderScene: renderSceneTool,
    awaitRender: awaitRenderTool,
  },
  stopWhen: stepCountIs(20),
  onStepFinish: ({ stepNumber, toolCalls }) => {
    if (toolCalls && toolCalls.length > 0) {
      console.log(
        `[RemotionAgent] Step ${stepNumber}: ${toolCalls.map((tc) => tc.toolName).join(", ")}`,
      );
    }
  },
});

// Export the inferred UIMessage type for type-safe client usage
export type RemotionAgentUIMessage = InferAgentUIMessage<typeof remotionAgent>;
