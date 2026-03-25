import { tool } from "ai";
import { z } from "zod";
import { renderStates, RenderState } from "../lib/render-state.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Analyze render error output and suggest fixes based on common patterns
 */
function analyzeRenderError(errorOutput: string[]): string {
  const errorText = errorOutput.join("\n").toLowerCase();

  if (
    errorText.includes("could not find composition") ||
    errorText.includes("no composition")
  ) {
    return "Composition not found in Root.tsx. Verify triggerPreview succeeded before calling renderScene.";
  }

  if (errorText.includes("is not defined")) {
    const match = errorOutput
      .join("\n")
      .match(/['"]?(\w+)['"]?\s+is not defined/i);
    const identifier = match?.[1] || "identifier";
    return `Missing import: "${identifier}" is not defined. Add the missing import statement.`;
  }

  if (errorText.includes("cannot find module") || errorText.includes("cannot resolve")) {
    return "Module resolution error. Check import paths - use @/components for component imports.";
  }

  if (errorText.includes("typeerror")) {
    return "TypeError in scene code. Check spring/interpolate config, component props, and ensure all values are correct types.";
  }

  if (errorText.includes("cannot read property") || errorText.includes("cannot read properties")) {
    return "Null reference error. A value is undefined - check component props and ensure required data is passed.";
  }

  if (errorText.includes("syntaxerror") || errorText.includes("unexpected token")) {
    return "Syntax error in scene code. Check for missing brackets, parentheses, or invalid JSX.";
  }

  if (errorText.includes("duplicate") || errorText.includes("already declared")) {
    return "Duplicate declaration. Check for duplicate variable names or component exports.";
  }

  if (errorText.includes("out of memory") || errorText.includes("heap")) {
    return "Memory error during render. Scene may be too complex - try reducing animation complexity or duration.";
  }

  return "Review the error output above and fix the underlying issue in the scene code.";
}

// ─── Tool ─────────────────────────────────────────────────────────────────────

export const awaitRenderTool = tool({
  description: `Wait for a render to complete and return its status.

Call this IMMEDIATELY after renderScene to verify the video was created successfully.
If the render failed, the error output is returned so you can diagnose and fix the issue.

Workflow:
  1. writeSceneCode   - write the TSX component
  2. triggerPreview   - register the composition (validates syntax)
  3. renderScene      - start the render
  4. awaitRender      - THIS TOOL - wait for completion and verify success

If this returns failed:
  - Read the errorOutput and suggestion fields
  - Fix the scene code with writeSceneCode
  - Re-register with triggerPreview
  - Re-render with renderScene
  - Verify again with awaitRender`,

  inputSchema: z.object({
    sceneId: z
      .string()
      .describe("The scene ID to wait for (must match the sceneId used in renderScene)"),
    timeoutMs: z
      .number()
      .optional()
      .default(120000)
      .describe("Maximum time to wait in milliseconds (default: 120000 = 2 minutes)"),
  }),

  execute: async ({ sceneId, timeoutMs = 120000 }) => {
    const deadline = Date.now() + timeoutMs;
    const pollInterval = 2000; // 2 seconds

    console.log(`[awaitRender] Waiting for render of "${sceneId}" (timeout: ${timeoutMs / 1000}s)`);

    while (Date.now() < deadline) {
      const state = renderStates.get(sceneId);

      if (!state) {
        // State not found - render may not have started
        console.log(`[awaitRender] No state found for "${sceneId}", waiting...`);
        await sleep(pollInterval);
        continue;
      }

      if (state.status === "complete") {
        const durationSeconds = state.endTime
          ? (state.endTime - state.startTime) / 1000
          : 0;

        console.log(
          `[awaitRender] ✅ Render complete for "${sceneId}" in ${durationSeconds.toFixed(1)}s`
        );

        return {
          success: true,
          status: "complete" as const,
          sceneId,
          videoUrl: state.videoUrl,
          durationSeconds: Math.round(durationSeconds * 10) / 10,
          message: `Video rendered successfully at ${state.videoUrl}`,
        };
      }

      if (state.status === "failed") {
        const durationSeconds = state.endTime
          ? (state.endTime - state.startTime) / 1000
          : 0;

        console.log(
          `[awaitRender] ❌ Render failed for "${sceneId}" after ${durationSeconds.toFixed(1)}s`
        );

        return {
          success: false,
          status: "failed" as const,
          sceneId,
          exitCode: state.exitCode,
          errorOutput: state.errorOutput.slice(-20), // Last 20 error lines
          outputLog: state.outputLog.slice(-10), // Last 10 output lines for context
          suggestion: analyzeRenderError(state.errorOutput),
          durationSeconds: Math.round(durationSeconds * 10) / 10,
        };
      }

      // Still rendering - wait and poll again
      await sleep(pollInterval);
    }

    // Timeout reached
    const state = renderStates.get(sceneId);
    console.log(
      `[awaitRender] ⏱️ Timeout waiting for "${sceneId}" after ${timeoutMs / 1000}s`
    );

    return {
      success: false,
      status: "timeout" as const,
      sceneId,
      message: `Render timed out after ${timeoutMs / 1000} seconds. The render may still be running in the background.`,
      lastKnownStatus: state?.status || "unknown",
      partialErrorOutput: state?.errorOutput?.slice(-10) || [],
    };
  },
});
