export interface Scene {
  id: number;
  type: string;
  title: string;
  headline: string;
  script: string;
  duration: number;
  animation: string;
  gradient: string;
  thumbnail?: string;
}

export const generateMockScenes = (productName: string): Scene[] => [
  {
    id: 1,
    type: "Hook",
    title: "The Hook",
    headline: `What if you could 10x your workflow?`,
    script: `Every day, thousands of professionals waste hours on repetitive tasks. ${productName} changes that forever.`,
    duration: 4,
    animation: "Fade In",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    id: 2,
    type: "Problem",
    title: "The Problem",
    headline: "The old way is broken",
    script:
      "Manual processes, scattered tools, endless context switching — it's costing you time and money every single day.",
    duration: 5,
    animation: "Slide Up",
    gradient: "from-destructive/10 to-destructive/5",
  },
  {
    id: 3,
    type: "Solution",
    title: "The Solution",
    headline: `Meet ${productName}`,
    script: `${productName} brings everything together in one intelligent platform. Powered by AI, designed for humans.`,
    duration: 5,
    animation: "Zoom In",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    id: 4,
    type: "Features",
    title: "Key Features",
    headline: "Built for speed & simplicity",
    script:
      "Smart automation. Real-time collaboration. Beautiful dashboards. Everything you need, nothing you don't.",
    duration: 6,
    animation: "Slide Up",
    gradient: "from-primary/15 to-accent/10",
  },
  {
    id: 5,
    type: "CTA",
    title: "Call to Action",
    headline: "Start free today",
    script: `Join thousands of teams already using ${productName}. No credit card required. Get started in 30 seconds.`,
    duration: 4,
    animation: "Fade In",
    gradient: "from-accent/20 to-primary/10",
  },
];

export const examplePrompts = [
  "A project management app for remote teams that uses AI to prioritize tasks",
  "An e-commerce analytics dashboard that helps Shopify stores grow faster",
  "A design-to-code tool that converts Figma files into production React code",
];

export const animationOptions = [
  "Fade In",
  "Slide Up",
  "Slide Left",
  "Zoom In",
  "Bounce",
  "Rotate In",
];

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
