import { describe, it, expect } from "vitest";
import { config } from "dotenv";
import { join } from "path";

// Ensure environment variables are loaded from server/.env
config({ path: join(process.cwd(), ".env") });

import { remotionAgent } from "../agents/remotion-agent.js";
import { UIMessage } from "ai";

describe("Generate Linear Sample Scenes", () => {
  it("should generate the requested Linear scenes based on the prompt", async () => {
    // Check if an AI provider API key is present
    if (
      !process.env.ANTHROPIC_API_KEY &&
      !process.env.OPENAI_API_KEY &&
      !process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ) {
      console.warn("Skipping test due to missing API keys.");
      return;
    }

    const prompt = `Create a highly technical, 4-scene promotional video for "Linear" that feels incredibly precise, high-performance, and dark-mode premium.
AESTHETIC & BRAND GUIDELINES:
- Colors: Backgrounds must be deep black (#000000) or very dark gray (#0A0A0A). Main text is pure white (#FFFFFF) and secondary text is slate gray (#888888). Use subtle neon glows (deep purple or cyan) for active states, borders, and shadows.
- Typography: Use the "Inter" font exclusively. Text reveals should feel mechanical and exact, using fast opacity fades and slight upward translations.
- Motion: Use high-performance, snappy spring physics (damping: 20, stiffness: 250). Avoid long, slow delays. Everything should feel like a perfectly optimized, 60fps native app. Staggers should be tight (1-3 frames).
SCENE BREAKDOWN:
Scene 1: The Precision Hook (Duration: 3 seconds)
- Start with a pitch-black canvas.
- A 1px glowing purple line quickly draws itself across the center of the screen.
- Crisp, white text rapidly slides up from behind the line: "Plan less."
- A fraction of a second later, the text updates/morphs into: "Build more."
- Exit: The glowing line retracts, and the text scales down and fades into the darkness.
Scene 2: The Command Center (Duration: 4 seconds)
- Use a slight 3D perspective to reveal a dark, glassmorphic UI window (representing the Linear issue board).
- Three columns quickly slide up into place: "Todo", "In Progress", and "Done".
- 5 "Issue Cards" populate the columns with an aggressive, tight stagger. Each card should have a very subtle glowing border.
- Exit: The entire 3D board zooms dramatically toward the camera, blurring as it passes "through" the screen.
Scene 3: The Shortcut (Duration: 4 seconds)
- A sleek, dark command menu (representing Cmd+K) snaps onto the screen instantly with a subtle box-shadow glow.
- Simulate fast, robotic typing inside the menu: "Set status to In Progress..."
- Immediately upon finishing the typing, a glowing "Success" toast notification slides in from the bottom right.
- Exit: Both the command menu and toast notification snap out of view downwards.
Scene 4: The Outro (Duration: 3 seconds)
- A glowing gradient orb (purple and blue) appears in the center and quickly collapses into a sharp, geometric shape (representing the Linear logo).
- A harsh, bright flash of light (opacity spike) reveals the text: "Linear."
- Below it, a slate gray subtitle appears: "A better way to build."
- Fade entirely to black.`;

    const messages = [
      {
        id: "msg-1",
        role: "user",
        content: prompt,
      },
    ] as UIMessage[];

    try {
      console.log("Starting scene generation for Linear...");
      
      const result = await remotionAgent.generate({
        messages: messages,
        maxSteps: 20,
        onStepFinish: ({ stepNumber, text, toolCalls }) => {
          console.log(`\n--- Step ${stepNumber} ---`);
          if (text) {
             console.log(`Text: ${text.substring(0, 100)}...`);
          }
          if (toolCalls && toolCalls.length > 0) {
             console.log("Tools used:", toolCalls.map(tc => tc.toolName).join(", "));
          }
        }
      });
      
      console.log("\n--- Final Result ---");
      console.log(result.text);

      expect(result).toBeDefined();
    } catch (error) {
      console.error("Error generating scenes:", error);
      throw error;
    }

  }, 300000); // 5 minute timeout
});
