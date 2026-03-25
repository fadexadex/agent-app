/**
 * Persistent Render State Store
 *
 * Captures render outcomes so the agent can verify
 * renders completed successfully and get error details if they fail.
 */

export interface RenderState {
  sceneId: string;
  status: "rendering" | "complete" | "failed";
  startTime: number;
  endTime?: number;
  errorOutput: string[]; // Last 50 stderr lines
  outputLog: string[]; // Last 20 stdout lines
  videoUrl?: string;
  exitCode?: number | null;
}

export const renderStates = new Map<string, RenderState>();

// Maximum lines to keep in buffers
const MAX_ERROR_LINES = 50;
const MAX_OUTPUT_LINES = 20;

// Cleanup states older than this duration (5 minutes)
const STATE_TTL_MS = 5 * 60 * 1000;

/**
 * Initialize a new render state when a render starts
 */
export function initRenderState(sceneId: string): RenderState {
  const state: RenderState = {
    sceneId,
    status: "rendering",
    startTime: Date.now(),
    errorOutput: [],
    outputLog: [],
  };
  renderStates.set(sceneId, state);
  cleanupOldStates();
  return state;
}

/**
 * Append stderr output to a render state
 */
export function appendErrorOutput(sceneId: string, lines: string): void {
  const state = renderStates.get(sceneId);
  if (!state) return;

  const newLines = lines.split("\n").filter((l) => l.trim());
  state.errorOutput.push(...newLines);

  // Keep only last MAX_ERROR_LINES
  if (state.errorOutput.length > MAX_ERROR_LINES) {
    state.errorOutput = state.errorOutput.slice(-MAX_ERROR_LINES);
  }
}

/**
 * Append stdout output to a render state
 */
export function appendOutputLog(sceneId: string, lines: string): void {
  const state = renderStates.get(sceneId);
  if (!state) return;

  const newLines = lines.split("\n").filter((l) => l.trim());
  state.outputLog.push(...newLines);

  // Keep only last MAX_OUTPUT_LINES
  if (state.outputLog.length > MAX_OUTPUT_LINES) {
    state.outputLog = state.outputLog.slice(-MAX_OUTPUT_LINES);
  }
}

/**
 * Mark a render as complete
 */
export function markRenderComplete(sceneId: string, videoUrl: string): void {
  const state = renderStates.get(sceneId);
  if (!state) return;

  state.status = "complete";
  state.endTime = Date.now();
  state.videoUrl = videoUrl;
  state.exitCode = 0;
}

/**
 * Mark a render as failed
 */
export function markRenderFailed(
  sceneId: string,
  exitCode: number | null
): void {
  const state = renderStates.get(sceneId);
  if (!state) return;

  state.status = "failed";
  state.endTime = Date.now();
  state.exitCode = exitCode;
}

/**
 * Remove states older than STATE_TTL_MS
 */
function cleanupOldStates(): void {
  const now = Date.now();
  for (const [sceneId, state] of renderStates.entries()) {
    // Only cleanup completed or failed states
    if (state.status === "rendering") continue;

    const age = now - (state.endTime || state.startTime);
    if (age > STATE_TTL_MS) {
      renderStates.delete(sceneId);
    }
  }
}
