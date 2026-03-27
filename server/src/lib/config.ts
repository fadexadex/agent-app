/**
 * Centralized configuration loader for server settings.
 * Reads from environment variables with sensible defaults.
 */

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
  maxParallelScenes: parseInt(process.env.MAX_PARALLEL_SCENES || "5", 10),

  /**
   * Use local rendering (npx remotion) instead of AWS Lambda.
   */
  useLocalRender: process.env.USE_LOCAL_RENDER === "true",

  /**
   * Server port.
   */
  port: parseInt(process.env.PORT || "3001", 10),
};

export type Config = typeof config;
