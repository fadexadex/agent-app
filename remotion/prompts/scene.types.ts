/**
 * Video Generation Scene Schema
 * 
 * This schema defines the structure for scene prompts that will be
 * sent to an AI agent for Remotion code generation.
 */

// ============================================================
// CORE ENUMS
// ============================================================

export type AnimationPreset = 
  | 'fadeBlurIn'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'scaleUp'
  | 'typewriter'
  | 'glitchReveal'
  | 'maskSlideUp'
  | 'spring'
  | 'custom';

export type ExitPreset =
  | 'fadeOut'
  | 'blurOut'
  | 'slideOut'
  | 'scaleDown'
  | 'custom';

export type TransitionType =
  | 'fade'
  | 'slide'
  | 'wipe'
  | 'flip'
  | 'clockWipe'
  | 'blur'
  | 'none';

export type AnchorPosition =
  | 'center'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type SpringConfig = 'smooth' | 'snappy' | 'bouncy' | 'heavy' | 'custom';

export type BackgroundType =
  | 'solid'
  | 'gradient-mesh'
  | 'grid-lines'
  | 'blobs'
  | 'preset';

// ============================================================
// TIMING
// ============================================================

export interface TimingConfig {
  /** Frame when this element/animation starts (relative to scene start) */
  startFrame: number;
  /** Duration in frames */
  durationFrames: number;
  /** Optional delay before animation begins */
  delayFrames?: number;
  /** Spring configuration preset */
  springConfig?: SpringConfig;
  /** Custom spring values if springConfig is 'custom' */
  customSpring?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

export interface ExitConfig {
  /** Frame when exit animation starts (relative to scene start) */
  startFrame: number;
  /** Exit animation preset */
  preset?: ExitPreset;
  /** Duration of exit in frames */
  durationFrames?: number;
  /** Custom exit properties */
  custom?: {
    opacity?: { from: number; to: number };
    blur?: { from: number; to: number };
    scale?: { from: number; to: number };
    position?: { fromX?: number; toX?: number; fromY?: number; toY?: number };
  };
}

// ============================================================
// VISUAL ELEMENTS
// ============================================================

export interface TextElement {
  type: 'text';
  id: string;
  content: string;
  style: {
    fontSize: number;
    fontWeight?: number;
    fontFamily?: string;
    color?: string;
    /** For multi-color text: array of { text, color } */
    segments?: Array<{ text: string; color: string; bold?: boolean }>;
    /** Gradient text */
    gradient?: { colors: string[]; angle?: number };
  };
  position: {
    anchor: AnchorPosition;
    offsetX?: number;
    offsetY?: number;
  };
  animation: {
    preset: AnimationPreset;
    /** 'full' | 'word' | 'character' | 'line' */
    unit?: 'full' | 'word' | 'character' | 'line';
    /** Frames between each unit animation */
    stagger?: number;
    timing: TimingConfig;
  };
  exit?: ExitConfig;
}

export interface MockupElement {
  type: 'mockup';
  id: string;
  mockupType: 'browser' | 'iphone15' | 'iphone-notch' | 'card' | 'plain';
  /** Static image source */
  src?: string;
  /** Or dynamic content description */
  content?: {
    type: 'email' | 'chat' | 'social' | 'custom';
    /** Detailed description for the AI to generate */
    description: string;
    /** Typewriter effect for text content */
    typewriter?: {
      text: string;
      charsPerFrame: number;
      startFrame: number;
    };
  };
  config?: {
    url?: string;
    title?: string;
    theme?: 'light' | 'dark';
  };
  style: {
    width?: number;
    height?: number;
    glass?: boolean | { blur: number; opacity: number };
    glare?: boolean;
  };
  position: {
    anchor: AnchorPosition;
    offsetX?: number;
    offsetY?: number;
  };
  animation: {
    preset: AnimationPreset;
    timing: TimingConfig;
    /** 3D rotation animation */
    rotate?: {
      startAngle: { x: number; y: number };
      endAngle: { x: number; y: number };
    };
  };
  exit?: ExitConfig;
}

export interface ShapeElement {
  type: 'shape';
  id: string;
  shapeType: 'circle' | 'rectangle' | 'pill' | 'arc' | 'custom';
  style: {
    width: number;
    height: number;
    backgroundColor?: string;
    borderRadius?: number | string;
    border?: string;
    boxShadow?: string;
    /** For custom SVG shapes */
    svgPath?: string;
  };
  position: {
    anchor: AnchorPosition;
    offsetX?: number;
    offsetY?: number;
  };
  animation: {
    preset: AnimationPreset;
    timing: TimingConfig;
    /** Continuous animations */
    continuous?: {
      type: 'rotate' | 'pulse' | 'float' | 'wave';
      speed?: number;
    };
  };
  exit?: ExitConfig;
}

export interface CustomElement {
  type: 'custom';
  id: string;
  /** Name of the custom component to use or create */
  componentName: string;
  /** Detailed description for the AI */
  description: string;
  /** Props to pass to the component */
  props?: Record<string, unknown>;
  position: {
    anchor: AnchorPosition;
    offsetX?: number;
    offsetY?: number;
  };
  animation: {
    timing: TimingConfig;
    /** Describe the animation in natural language */
    description?: string;
  };
  exit?: ExitConfig;
}

export interface IconGridElement {
  type: 'iconGrid';
  id: string;
  layout: 'arc' | 'grid' | 'row' | 'scattered';
  icons: Array<{
    src?: string;
    name: string;
    /** For arc layout */
    position?: { angle: number; radius: number };
  }>;
  style: {
    iconSize: number;
    gap?: number;
    /** For arc layout */
    arcRadius?: number;
    arcStartAngle?: number;
    arcEndAngle?: number;
  };
  position: {
    anchor: AnchorPosition;
    offsetX?: number;
    offsetY?: number;
  };
  animation: {
    /** Stagger delay between icons */
    stagger: number;
    preset: AnimationPreset;
    timing: TimingConfig;
  };
  exit?: ExitConfig;
}

export type SceneElement =
  | TextElement
  | MockupElement
  | ShapeElement
  | CustomElement
  | IconGridElement;

// ============================================================
// BACKGROUND
// ============================================================

export interface BackgroundConfig {
  type: BackgroundType;
  /** For 'solid' type */
  color?: string;
  /** For 'preset' type */
  preset?: string;
  /** For 'gradient-mesh', 'blobs' types */
  meshColors?: {
    primary?: string;
    secondary?: string;
  };
  variant?: 'light' | 'dark' | 'brand';
  animated?: boolean;
  animationSpeed?: number;
  /** Custom layers for complex backgrounds */
  layers?: Array<{
    type: 'solid' | 'linear' | 'radial' | 'mesh' | 'noise' | 'blur' | 'vignette' | 'glow' | 'grid';
    [key: string]: unknown;
  }>;
}

// ============================================================
// SCENE DEFINITION
// ============================================================

export interface SceneTransition {
  type: TransitionType;
  direction?: 'from-left' | 'from-right' | 'from-top' | 'from-bottom';
  durationFrames: number;
  timing?: 'linear' | 'spring';
}

export interface Scene {
  /** Unique scene identifier */
  id: string;
  /** Human-readable scene name */
  name: string;
  /** Scene category for organization */
  category: 'hook' | 'intro' | 'feature' | 'benefit' | 'cta' | 'transition';
  /** Duration in frames */
  durationFrames: number;
  /** Background configuration */
  background: BackgroundConfig;
  /** All elements in this scene */
  elements: SceneElement[];
  /** Transition to next scene */
  transitionOut?: SceneTransition;
  /** Audio/voiceover reference (if any) */
  audio?: {
    src?: string;
    /** Transcript for timing */
    transcript?: string;
    /** Volume 0-1 */
    volume?: number;
  };
  /** Additional notes for the AI */
  notes?: string;
}

// ============================================================
// VIDEO PROJECT
// ============================================================

export interface VideoProject {
  /** Project metadata */
  meta: {
    name: string;
    description?: string;
    width: number;
    height: number;
    fps: number;
  };
  /** Global styles that apply to all scenes */
  globalStyles: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    typography: {
      fontFamily: string;
      headingWeight: number;
      bodyWeight: number;
    };
    animation: {
      defaultSpring: SpringConfig;
      defaultStagger: number;
    };
  };
  /** All scenes in order */
  scenes: Scene[];
  /** Global audio track (if any) */
  backgroundMusic?: {
    src: string;
    volume: number;
  };
}

// ============================================================
// PROMPT OUTPUT FORMAT
// ============================================================

export interface ScenePrompt {
  sceneId: string;
  /** The full prompt to send to the AI */
  prompt: string;
  /** Expected component name */
  outputComponent: string;
  /** Dependencies that should be imported */
  requiredImports: string[];
  /** Validation criteria */
  validation: {
    mustInclude: string[];
    mustNotInclude: string[];
  };
}
