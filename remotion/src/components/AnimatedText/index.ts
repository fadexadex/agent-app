export { AnimatedText } from "./AnimatedText";
export { LayoutGrid } from "./LayoutGrid";
export { TextSequence, type TextSequenceItemProps } from "./TextSequence";
export type {
  AnimatedTextProps,
  BlurAnimation,
  OpacityAnimation,
  ScaleAnimation,
  PositionAnimation,
  TypewriterConfig,
  ExitAnimation,
  StaggerConfig,
  GradientConfig,
  PresetType,
  AnimationUnit,
  EasingType,
  SpringConfig,
  // Positioning API types
  AnchorPosition,
  AnchorAnimation,
  PositioningProps,
  PositioningResult,
  LayoutGridProps,
  TextSequenceProps,
  // Styled segments API types
  TextSegment,
  ParsedUnit,
} from "./types";
export { presets, getPreset, DEFAULTS } from "./presets";
export { usePositioning } from "./hooks/usePositioning";
export { iconMap, getIcon, availableIcons } from "./icons";
