import { tool } from "ai";
import { z } from "zod";

// Tool for structured thinking - allows the agent to reason through problems
export const thinkTool = tool({
  description:
    "Share your thinking in simple, friendly language. " +
    "Avoid technical jargon - explain as if talking to a creative professional. " +
    "Use: 'Planning the visual flow', 'Designing animation timing', 'Creating scene layout'.",
  inputSchema: z.object({
    thoughts: z
      .array(z.string())
      .describe(
        "Thought steps in plain language. " +
        "Good: 'Setting up smooth entrance for the headline' " +
        "Bad: 'Configuring spring() with damping: 200'"
      ),
  }),
  execute: async ({ thoughts }) => {
    return {
      acknowledged: true,
      thoughtCount: thoughts.length,
    };
  },
});
