import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const SKILLS_DIR = resolve(process.cwd(), "../.agents/skills/remotion-best-practices/rules");

export function loadSkillRule(ruleName: string): string {
  const filePath = join(SKILLS_DIR, ruleName);
  if (!existsSync(filePath)) {
    return `// Rule ${ruleName} not found`;
  }
  return readFileSync(filePath, "utf-8");
}

export function loadCoreRemotionSkills(): string {
  const coreRules = [
    "animations.md",
    "timing.md",
    "sequencing.md",
    "text-animations.md",
    "transitions.md",
  ];

  return coreRules
    .map((rule) => {
      const content = loadSkillRule(rule);
      return `### ${rule.replace(".md", "")}\n${content}\n`;
    })
    .join("\n");
}
