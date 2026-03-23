import { tool } from "ai";
import { z } from "zod";

// Tool for structured thinking - allows the agent to reason through problems
export const thinkTool = tool({
  description:
    "Use this tool to think through complex problems step by step. The user will see your thinking process. Use this FIRST before taking actions.",
  inputSchema: z.object({
    thoughts: z
      .array(z.string())
      .describe(
        "Array of thought steps, each a concise observation or reasoning step"
      ),
  }),
  execute: async ({ thoughts }) => {
    return {
      acknowledged: true,
      thoughtCount: thoughts.length,
    };
  },
});
