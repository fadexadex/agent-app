import { describe, it, expect } from "vitest";
import { config } from "dotenv";
import { join } from "path";

// Ensure environment variables are loaded from server/.env
config({ path: join(process.cwd(), ".env") });

import { remotionAgent } from "../agents/remotion-agent.js";
import { UIMessage } from "ai";

describe("Generate Notion Sample Scenes", () => {
  it("should generate the requested Notion scenes based on the prompt", async () => {
    // Check if an AI provider API key is present
    if (
      !process.env.ANTHROPIC_API_KEY &&
      !process.env.OPENAI_API_KEY &&
      !process.env.GOOGLE_GENERATIVE_AI_API_KEY
    ) {
      console.warn("Skipping test due to missing API keys.");
      return;
    }

    const prompt = `Create a cinematic, 4-scene promotional video for "Notion" that feels effortless, modern, and magical. 
AESTHETIC & BRAND GUIDELINES:
- Colors: Backgrounds should be minimal off-white (#F7F7F5) or pure white (#FFFFFF). Main text is dark charcoal (#37352F). Use soft, semi-transparent borders (rgba(0,0,0,0.05)) and subtle, expansive drop shadows.
- Typography: Use the "Inter" font exclusively. Apply smooth word-by-word or line-by-line reveal animations using translateY masks and opacity fades. DO NOT use basic character-by-character typewriter effects for main headings.
- Motion: Use snappy but elegant spring physics (damping: 20, stiffness: 200). Elements should stagger their entrances with 3-5 frame gaps to create a visual rhythm.
SCENE BREAKDOWN:
Scene 1: The Minimalist Hook (Duration: 3 seconds)
- Start with a completely blank off-white canvas. 
- A clean, dark charcoal text block reveals itself word-by-word sliding up from a mask: "Your wiki, docs, & projects."
- A beat later, a second line appears below it in a lighter gray: "Together at last."
- Exit: The text fades and slides up smoothly.
Scene 2: The Workspace Assembly (Duration: 4 seconds)
- Use 3D perspective (e.g., rotateX, rotateY) to show a sleek, glassmorphic UI window floating onto the screen. It should look like a blank Notion page.
- Inside the window, stagger the entrance of 3 "blocks": a Title block ("Q3 Roadmap"), a Checklist block, and a small Database/Table mockup. 
- Have a simulated cursor (a custom arrow element) fly in smoothly, click the empty space, and trigger a subtle ripple effect.
- Exit: The 3D window pushes backward into the Z-axis, blurring and fading out to 0 opacity.
Scene 3: The Notion AI Magic (Duration: 4 seconds)
- A sleek floating prompt bar (pill shape) springs up from the bottom center. It has a slight blur backdrop-filter.
- Inside the pill, simulate typing (using a typewriter effect, which is allowed here for UI simulation): "Draft a launch plan..."
- Suddenly, the prompt bar morphs/expands smoothly into a larger document card. 
- As it expands, apply a subtle glowing purple/blue gradient shadow to represent "AI Magic", and have 3 lines of placeholder text gently skeleton-load into the card.
Scene 4: The Outro (Duration: 3 seconds)
- A minimalist black square with a white "N" (representing the Notion logo) scales up in the center with a bouncy spring.
- Below it, a clean typography reveal: "Notion." 
- Below that, a smaller gray subtitle: "For your life's work."`;

    const messages = [
      {
        id: "msg-1",
        role: "user",
        content: prompt,
      },
    ] as UIMessage[];

    try {
      console.log("Starting scene generation...");
      
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

  }, 300000); // 5 minute timeout since it will likely write files and trigger renders
});
