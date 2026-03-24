// ─── Rich scene types (match the scene JSON schema) ───────────────────────────

export interface SceneElement {
  type: "text" | "mockup" | "shape" | "custom" | "iconGrid";
  id: string;
  component?: string;
  description: string;
  props?: Record<string, unknown>;
  position?: { anchor: string; x?: number; y?: number };
  animation?: {
    preset?: string;
    timing: { start: number; duration: number; spring?: string };
    description?: string;
    rotate3d?: { startX: number; startY: number; endX: number; endY: number };
  };
  typewriter?: { text: string; speed: number; start: number };
  exit?: { frame: number; type: string; duration: number };
  mockupType?: string;
  content?: string;
}

export interface RichScene {
  id: string;       // kebab-case slug e.g. "feature-email"
  name: string;     // human display name
  category: "hook" | "intro" | "feature" | "benefit" | "cta" | "transition";
  duration: number; // frames at 30fps
  background: {
    type: "solid" | "gradient" | "noise" | "mesh";
    color?: string;
    colors?: string[];
    preset?: string;
  };
  elements: SceneElement[];
  transition?: { type: string; duration: number };
  notes?: string;
  // Optional display helper — derived from background if absent
  gradient?: string;
}

/** Backward-compat alias so existing imports of `Scene` keep working */
export type Scene = RichScene;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function framesToSeconds(frames: number): number {
  return Math.round(frames / 30);
}

export function backgroundToGradient(bg: RichScene["background"]): string {
  const categoryGradients: Record<string, string> = {
    hook: "from-primary/20 to-primary/5",
    intro: "from-accent/20 to-accent/5",
    feature: "from-primary/15 to-accent/10",
    benefit: "from-accent/20 to-primary/10",
    cta: "from-primary/20 to-accent/10",
    transition: "from-muted/20 to-muted/5",
  };
  if (bg.type === "gradient" && bg.colors && bg.colors.length >= 2) {
    return "from-primary/20 to-accent/10";
  }
  return "from-primary/20 to-primary/5";
}

// ─── Fallback mock (used only if AI generation fails / dev convenience) ───────

export const generateMockScenes = (productName: string): RichScene[] => [
  {
    id: "the-hook",
    name: "The Hook",
    category: "hook",
    duration: 120,
    background: { type: "gradient", colors: ["#4F46E5", "#10B981"] },
    gradient: "from-primary/20 to-primary/5",
    elements: [
      {
        type: "text",
        id: "headline",
        description: `What if you could 10x your workflow?`,
        animation: { timing: { start: 0, duration: 30, spring: "smooth" } },
        exit: { frame: 100, type: "blur", duration: 15 },
      },
      {
        type: "text",
        id: "subtext",
        description: `Every day, thousands of professionals waste hours on repetitive tasks. ${productName} changes that forever.`,
        animation: { timing: { start: 20, duration: 25, spring: "smooth" } },
        exit: { frame: 100, type: "blur", duration: 15 },
      },
    ],
    transition: { type: "blur", duration: 15 },
    notes: "Exit headline first, then subtext. Stagger 5 frames.",
  },
  {
    id: "the-problem",
    name: "The Problem",
    category: "intro",
    duration: 150,
    background: { type: "solid", color: "#18181B" },
    gradient: "from-destructive/10 to-destructive/5",
    elements: [
      {
        type: "text",
        id: "problem-headline",
        description: "The old way is broken",
        animation: { timing: { start: 0, duration: 30, spring: "snappy" } },
        exit: { frame: 130, type: "blur", duration: 15 },
      },
      {
        type: "text",
        id: "problem-desc",
        description:
          "Manual processes, scattered tools, endless context switching — it's costing you time and money every single day.",
        animation: { timing: { start: 20, duration: 25, spring: "smooth" } },
        exit: { frame: 130, type: "blur", duration: 15 },
      },
    ],
    transition: { type: "fade", duration: 15 },
    notes: "Exit headline then desc. Stagger 3 frames.",
  },
  {
    id: "the-solution",
    name: "The Solution",
    category: "feature",
    duration: 150,
    background: { type: "gradient", colors: ["#10B981", "#4F46E5"] },
    gradient: "from-accent/20 to-accent/5",
    elements: [
      {
        type: "text",
        id: "solution-headline",
        description: `Meet ${productName}`,
        animation: { timing: { start: 0, duration: 30, spring: "bouncy" } },
        exit: { frame: 130, type: "blur", duration: 15 },
      },
      {
        type: "text",
        id: "solution-desc",
        description: `${productName} brings everything together in one intelligent platform. Powered by AI, designed for humans.`,
        animation: { timing: { start: 20, duration: 25, spring: "smooth" } },
        exit: { frame: 130, type: "blur", duration: 15 },
      },
    ],
    transition: { type: "blur", duration: 15 },
    notes: "Entrance bouncy for impact. Exit both together.",
  },
  {
    id: "key-features",
    name: "Key Features",
    category: "benefit",
    duration: 180,
    background: { type: "mesh" },
    gradient: "from-primary/15 to-accent/10",
    elements: [
      {
        type: "text",
        id: "features-headline",
        description: "Built for speed & simplicity",
        animation: { timing: { start: 0, duration: 30, spring: "smooth" } },
        exit: { frame: 160, type: "blur", duration: 15 },
      },
      {
        type: "iconGrid",
        id: "feature-icons",
        description:
          "Smart automation, real-time collaboration, beautiful dashboards — everything you need, nothing you don't.",
        animation: { timing: { start: 20, duration: 40, spring: "smooth" } },
        exit: { frame: 160, type: "blur", duration: 15 },
      },
    ],
    transition: { type: "slide", duration: 15 },
    notes: "Icon grid staggers in. Exit headline first then grid. 3 frame stagger.",
  },
  {
    id: "cta-start-free",
    name: "Call to Action",
    category: "cta",
    duration: 120,
    background: { type: "gradient", colors: ["#7C3AED", "#06B6D4"] },
    gradient: "from-accent/20 to-primary/10",
    elements: [
      {
        type: "text",
        id: "cta-headline",
        description: "Start free today",
        animation: { timing: { start: 0, duration: 25, spring: "bouncy" } },
        exit: { frame: 100, type: "blur", duration: 15 },
      },
      {
        type: "text",
        id: "cta-subtext",
        description: `Join thousands of teams already using ${productName}. No credit card required.`,
        animation: { timing: { start: 15, duration: 20, spring: "smooth" } },
        exit: { frame: 100, type: "blur", duration: 15 },
      },
    ],
    transition: { type: "blur", duration: 15 },
    notes: "Bouncy headline entrance for energy. Exit together.",
  },
];

// ─── Static config ─────────────────────────────────────────────────────────────

export const examplePrompts = [
  "A project management app for remote teams that uses AI to prioritize tasks",
  "An e-commerce analytics dashboard that helps Shopify stores grow faster",
  "A design-to-code tool that converts Figma files into production React code",
];

export const categoryOptions = [
  { value: "hook", label: "Hook" },
  { value: "intro", label: "Intro" },
  { value: "feature", label: "Feature" },
  { value: "benefit", label: "Benefit" },
  { value: "cta", label: "Call to Action" },
  { value: "transition", label: "Transition" },
] as const;

export const stylePresets = [
  {
    name: "Modern",
    primary: "#4F46E5",
    secondary: "#10B981",
    font: "Plus Jakarta Sans",
  },
  {
    name: "Bold",
    primary: "#DC2626",
    secondary: "#F59E0B",
    font: "Plus Jakarta Sans",
  },
  { name: "Minimal", primary: "#18181B", secondary: "#71717A", font: "Inter" },
  {
    name: "Vibrant",
    primary: "#7C3AED",
    secondary: "#06B6D4",
    font: "Plus Jakarta Sans",
  },
];
