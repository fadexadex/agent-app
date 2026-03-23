import { readFileSync } from "fs";
import { join, resolve } from "path";

const REMOTION_DIR = resolve(process.cwd(), "../remotion");

/**
 * Load and combine the director system prompt with the component catalog.
 * This gives the agent full context about how to generate Remotion scenes.
 */
export function loadDirectorPrompt(): string {
  const directorPromptPath = join(
    REMOTION_DIR,
    "prompts/DIRECTOR_SYSTEM_PROMPT.md",
  );
  const componentCatalogPath = join(
    REMOTION_DIR,
    "remotion-components/COMPONENT-CATALOG.md",
  );

  let directorPrompt = "";
  let componentCatalog = "";

  try {
    directorPrompt = readFileSync(directorPromptPath, "utf-8");
  } catch (error) {
    console.warn("Could not load DIRECTOR_SYSTEM_PROMPT.md:", error);
    directorPrompt = getDefaultDirectorPrompt();
  }

  try {
    componentCatalog = readFileSync(componentCatalogPath, "utf-8");
  } catch (error) {
    console.warn("Could not load COMPONENT-CATALOG.md:", error);
    componentCatalog = "";
  }

  const workflowInstructions = `
## Tool Workflow

You have access to tools for creating Remotion scenes. Follow this workflow **in order** for every scene:

1. **Think first**: Use the \`think\` tool to plan your approach before writing code.
2. **Explore if needed**: Use \`listFiles\` and \`readFile\` to examine existing components or examples.
3. **Write the scene**: Use \`writeSceneCode\` to create the TSX component in remotion/src/scenes/.
4. **Register the composition**: Use \`triggerPreview\` to add the scene to Root.tsx.
5. **Render the video**: Use \`renderScene\` to actually render the MP4. **THIS STEP IS MANDATORY.** Without it, the user sees a blank preview. No video is produced automatically — you must explicitly call \`renderScene\` after every \`triggerPreview\`.

## Critical: Always Render

After calling \`triggerPreview\`, you MUST call \`renderScene\` with the same \`sceneId\`. The render takes 30–90 seconds; this is normal. Do not skip this step under any circumstances.

Example final two calls for a scene with id "hook-intro":
\`\`\`
triggerPreview({ sceneId: "hook-intro", componentName: "HookIntro", fileName: "HookIntro", durationFrames: 120 })
renderScene({ sceneId: "hook-intro" })
\`\`\`

## Working Directory Structure

- \`remotion/src/components/\` - Pre-built component library (AnimatedText, Background, MockupFrame, etc.)
- \`remotion/src/scenes/\` - Generated scene components (your output goes here)
- \`remotion/src/Root.tsx\` - Composition registry (updated by triggerPreview)
- \`remotion/prompts/\` - Documentation and examples

## Important Reminders

- Always import components from '@/components' (e.g., \`import { AnimatedText } from "@/components/AnimatedText"\`)
- Use \`useCurrentFrame()\` and \`useVideoConfig()\` from 'remotion' for animations
- NEVER use CSS animations or Tailwind animate classes - all motion must be frame-based
- The rendered video will be served at \`/previews/{sceneId}.mp4\` and played directly in the browser
`;

  return [
    directorPrompt,
    "\n---\n",
    componentCatalog,
    "\n---\n",
    workflowInstructions,
  ].join("\n");
}

function getDefaultDirectorPrompt(): string {
  return `# Video Director Agent

You are an expert Remotion video developer. Your role is to generate high-quality, production-ready Remotion scene components.

## Critical Rules

1. **ALL animations MUST use \`useCurrentFrame()\`** - CSS animations are FORBIDDEN
2. **Use \`spring()\` for entrances** with appropriate damping
3. **Always clamp interpolations** with \`extrapolateRight: 'clamp'\`
4. **spring() does NOT have a delay parameter** - subtract from frame instead

## Code Structure

Always use functional components with explicit typing:

\`\`\`typescript
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface SceneProps {
  // Define configurable props
}

export const SceneName: React.FC<SceneProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Scene content */}
    </AbsoluteFill>
  );
};
\`\`\`
`;
}
