/**
 * Centralized configuration loader for server settings.
 * Reads from environment variables with sensible defaults.
 */

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const config = {
  /**
   * Enable parallel scene generation.
   * When true, all scenes will be generated simultaneously.
   * When false, scenes are generated sequentially (default).
   */
  parallelGeneration: process.env.PARALLEL_GENERATION === "true",

  /**
   * Maximum number of scenes to generate in parallel.
   * Only applies when parallelGeneration is true.
   */
  maxParallelScenes: parsePositiveInt(process.env.MAX_PARALLEL_SCENES, 5),

  /**
   * Maximum retries for Gemini-backed AI SDK calls.
   */
  geminiMaxRetries: parsePositiveInt(process.env.GEMINI_MAX_RETRIES, 5),

  /**
   * Whether the active model supports image/vision input.
   * Set to "false" for text-only models (e.g. OpenRouter free models like qwen3-coder).
   * Defaults to true to preserve existing Gemini behaviour.
   */
  supportsVision: process.env.AGENT_SUPPORTS_VISION !== "false",

  /**
   * Use local rendering (npx remotion) instead of AWS Lambda.
   */
  useLocalRender: process.env.USE_LOCAL_RENDER === "true",

  /**
   * Server port.
   */
  port: parsePositiveInt(process.env.PORT, 3001),
};

export type Config = typeof config;
