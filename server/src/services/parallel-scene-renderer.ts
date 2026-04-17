import { ToolLoopAgent, stepCountIs, generateText } from "ai";
import { model } from "../lib/gateway.js";
import { loadDirectorPrompt } from "../lib/prompt-loader.js";
import { thinkTool } from "../tools/think.js";
import { readFileTool, listFilesTool } from "../tools/remotion-files.js";
import { writeSceneCodeTool } from "../tools/write-scene.js";
import { triggerPreviewTool } from "../tools/trigger-preview.js";
import { renderSceneTool } from "../tools/render-scene.js";
import { awaitRenderTool } from "../tools/await-render.js";
import { generateImageTool } from "../tools/generate-image.js";
import { config } from "../lib/config.js";
import {
  buildReferenceAssetsBlock,
  resolveUploadedAssets,
  toModelAssetPart,
  type UploadedAssetDescriptor,
} from "../lib/uploaded-assets.js";

/**
 * Task for generating a single scene.
 */
export interface SceneGenerationTask {
  sceneId: string;
  sceneIndex: number;
  sceneContext: Record<string, unknown>;
  prompt: string;
  assets?: string[]; // uploaded file URLs like "/uploads/file-xxx.webp"
}

/**
 * Result of generating a single scene.
 */
export interface SceneGenerationResult {
  sceneId: string;
  sceneIndex: number;
  success: boolean;
  error?: string;
  videoUrl?: string;
  previewUrl?: string;
}

/**
 * Progress update for a scene.
 */
export interface SceneProgressUpdate {
  sceneId: string;
  sceneIndex: number;
  status: "started" | "in_progress" | "complete" | "error";
  step?: string;
  progress?: number;
  videoUrl?: string;
  error?: string;
}

export function buildSceneGenerationUserMessage(params: {
  sceneId: string;
  sceneIndex: number;
  sceneContext: Record<string, unknown>;
  prompt: string;
  assets?: UploadedAssetDescriptor[];
}) {
  const {
    sceneId,
    sceneIndex,
    sceneContext,
    prompt,
    assets = [],
  } = params;
  const referenceAssetsBlock = buildReferenceAssetsBlock(assets);

  return {
    role: "user" as const,
    content: [
      {
        type: "text" as const,
        text: `${referenceAssetsBlock}[SCENE_CONTEXT]
Scene Index: ${sceneIndex}
Scene ID: ${sceneId}
Scene Data:
\`\`\`json
${JSON.stringify(sceneContext, null, 2)}
\`\`\`
[/SCENE_CONTEXT]

${prompt}

Generate this scene, write the code, register it, render it, and wait for the render to complete.
`,
      },
      ...assets.map((asset) => toModelAssetPart(asset)),
    ],
  };
}

/**
 * Creates a new agent instance for a specific scene.
 * Each scene gets its own isolated agent to prevent context contamination.
 */
function createSceneAgent(sceneId: string) {
  return new ToolLoopAgent({
    id: `scene-agent-${sceneId}`,
    model,
    maxRetries: config.geminiMaxRetries,
    instructions: loadDirectorPrompt(),
    tools: {
      think: thinkTool,
      readFile: readFileTool,
      listFiles: listFilesTool,
      writeSceneCode: writeSceneCodeTool,
      triggerPreview: triggerPreviewTool,
      renderScene: renderSceneTool,
      awaitRender: awaitRenderTool,
      generateImage: generateImageTool,
    },
    stopWhen: stepCountIs(20),
    onStepFinish: ({ stepNumber, toolCalls }) => {
      if (toolCalls && toolCalls.length > 0) {
        console.log(
          `[ParallelAgent:${sceneId}] Step ${stepNumber}: ${toolCalls.map((tc) => tc.toolName).join(", ")}`
        );
      }
    },
  });
}

/**
 * Generates a single scene using a dedicated agent instance.
 */
async function generateSingleScene(
  task: SceneGenerationTask,
  onProgress?: (update: SceneProgressUpdate) => void
): Promise<SceneGenerationResult> {
  const { sceneId, sceneIndex, sceneContext, prompt, assets } = task;

  try {
    onProgress?.({
      sceneId,
      sceneIndex,
      status: "started",
      step: "Initializing agent...",
    });

    const agent = createSceneAgent(sceneId);
    const resolvedAssets = await resolveUploadedAssets(
      (assets || []).map((url) => ({ url })),
    );
    const userMessage = buildSceneGenerationUserMessage({
      sceneId,
      sceneIndex,
      sceneContext,
      prompt,
      assets: resolvedAssets,
    });

    onProgress?.({
      sceneId,
      sceneIndex,
      status: "in_progress",
      step: "Generating scene...",
      progress: 10,
    });

    // Generate with the agent
    const result = await agent.generate({
      messages: [userMessage as any],
    });

    // Extract video URL from the result
    let videoUrl: string | undefined;
    let previewUrl: string | undefined;

    // Look through steps for render results
    for (const step of result.steps) {
      for (const toolCall of step.toolCalls || []) {
        if (toolCall.toolName === "renderScene" && toolCall.result) {
          const renderResult = toolCall.result as { videoUrl?: string };
          if (renderResult.videoUrl) {
            videoUrl = renderResult.videoUrl;
          }
        }
        if (toolCall.toolName === "triggerPreview" && toolCall.result) {
          const previewResult = toolCall.result as { previewUrl?: string };
          if (previewResult.previewUrl) {
            previewUrl = previewResult.previewUrl;
          }
        }
      }
    }

    onProgress?.({
      sceneId,
      sceneIndex,
      status: "complete",
      videoUrl,
      progress: 100,
    });

    return {
      sceneId,
      sceneIndex,
      success: true,
      videoUrl,
      previewUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[ParallelScene:${sceneId}] Error:`, errorMessage);

    onProgress?.({
      sceneId,
      sceneIndex,
      status: "error",
      error: errorMessage,
    });

    return {
      sceneId,
      sceneIndex,
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generates multiple scenes in parallel using separate agent instances.
 * Results are returned for each scene, even if some fail.
 */
export async function generateScenesInParallel(
  tasks: SceneGenerationTask[],
  onProgress?: (update: SceneProgressUpdate) => void
): Promise<SceneGenerationResult[]> {
  if (!config.parallelGeneration) {
    throw new Error("Parallel generation is disabled. Set PARALLEL_GENERATION=true to enable.");
  }

  const maxParallel = config.maxParallelScenes;
  console.log(`[ParallelRenderer] Starting ${tasks.length} scenes with max ${maxParallel} parallel`);

  // Limit parallelism
  const limitedTasks = tasks.slice(0, maxParallel);

  const results = await Promise.allSettled(
    limitedTasks.map((task) => generateSingleScene(task, onProgress))
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    return {
      sceneId: tasks[index].sceneId,
      sceneIndex: tasks[index].sceneIndex,
      success: false,
      error: result.reason?.message || "Unknown error",
    };
  });
}

/**
 * Check if parallel generation is enabled.
 */
export function isParallelGenerationEnabled(): boolean {
  return config.parallelGeneration;
}
