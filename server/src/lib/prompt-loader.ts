import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { loadCoreRemotionSkills } from "./skills-loader.js";

const REMOTION_DIR = resolve(process.cwd(), "../remotion");

interface LoadOptions {
  /** Include full component reference (larger context, more detail) */
  includeFullReference?: boolean;
  /** Include scene examples */
  includeExamples?: boolean;
}

/**
 * Load the condensed director prompt with component catalog.
 * This is the optimized version for faster generation.
 */
export function loadDirectorPrompt(options: LoadOptions = {}): string {
  const { includeFullReference = false, includeExamples = false } = options;

  const directorPromptPath = join(REMOTION_DIR, "prompts/DIRECTOR_SYSTEM_PROMPT.md");

  let directorPrompt = "";

  try {
    directorPrompt = readFileSync(directorPromptPath, "utf-8");
  } catch (error) {
    console.warn("Could not load DIRECTOR_SYSTEM_PROMPT.md:", error);
    directorPrompt = getDefaultDirectorPrompt();
  }

  const coreSkills = loadCoreRemotionSkills();

  // Minimal workflow reminder (main instructions are in director prompt)
  const workflowReminder = `
## Tool Workflow (Quick Reference)

1. **writeSceneCode** → Write TSX to remotion/src/scenes/
2. **triggerPreview** → Register in Root.tsx (validates syntax)
3. **renderScene** → Generate MP4 (REQUIRED)
4. **awaitRender** → Verify completion

**CRITICAL**: Always call renderScene + awaitRender. Videos are NOT auto-generated.
`;

  const parts = [
    directorPrompt,
    "\n---\n# Remotion Animation Patterns\n",
    coreSkills,
    "\n---\n",
    workflowReminder
  ];

  // Add examples if requested
  if (includeExamples) {
    const exampleContent = loadSceneExamples();
    if (exampleContent) {
      parts.push("\n---\n", exampleContent);
    }
  }

  return parts.join("\n");
}

/**
 * Load condensed prompt for quick generation (default behavior).
 */
export function loadCondensedPrompt(): string {
  return loadDirectorPrompt({ includeFullReference: false, includeExamples: false });
}

/**
 * Load full prompt with all references for complex scenes.
 */
export function loadFullPrompt(): string {
  return loadDirectorPrompt({ includeFullReference: true, includeExamples: true });
}

/**
 * Load scene examples for reference.
 */
function loadSceneExamples(): string {
  const examplePath = join(REMOTION_DIR, "prompts/scene-email-feature.json");

  if (!existsSync(examplePath)) {
    return "";
  }

  try {
    const example = readFileSync(examplePath, "utf-8");
    return `## Scene Example\n\n\`\`\`json\n${example}\n\`\`\``;
  } catch {
    return "";
  }
}

function getDefaultDirectorPrompt(): string {
  return `# Video Director Agent

Expert Remotion developer generating production-ready scene components.

**CRITICAL**: Include \`import React from "react";\` at the top of every \`.tsx\` file.

## Animation Rules
1. ALL animations use \`useCurrentFrame()\` - CSS animations FORBIDDEN
2. spring() has NO delay param - use \`frame - delay\` instead
3. Always clamp: \`interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })\`

## Code Structure
\`\`\`typescript
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const SceneName: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Scene content */}
    </AbsoluteFill>
  );
};
\`\`\`
`;
}

/**
 * Pre-built scene definitions for template-based generation.
 * These can be injected into the agent context to skip exploration.
 */
export const SCENE_TEMPLATES = {
  feature: {
    description: "Feature showcase with indicator pill, mockup, and label",
    timing: { indicator: 0, mockup: 15, label: 40, exit: 100 },
    duration: 120,
  },
  hook: {
    description: "Opening hook with animated text and visual anchor",
    timing: { text: 0, visual: 20, exit: 150 },
    duration: 180,
  },
  cta: {
    description: "Call-to-action with logo reveal and URL",
    timing: { logo: 0, url: 30, exit: 120 },
    duration: 150,
  },
} as const;

export type SceneTemplateType = keyof typeof SCENE_TEMPLATES;
