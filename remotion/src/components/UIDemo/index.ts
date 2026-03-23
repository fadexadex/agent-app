/**
 * UIDemo Components
 *
 * Components for creating UI demonstration videos:
 * - UIHighlight: Draw attention to UI elements with animated callouts
 * - ScrollContainer: Animated scrolling within a container
 * - UIWalkthrough: Orchestrate cursor, highlights, and scroll sequences
 */

export { UIHighlight } from './UIHighlight';
export type { UIHighlightProps, HighlightType, LabelPosition } from './UIHighlight';

export { ScrollContainer } from './ScrollContainer';
export type { ScrollContainerProps } from './ScrollContainer';

export { UIWalkthrough } from './UIWalkthrough';
export type {
  UIWalkthroughProps,
  UIStep,
  Position,
  ClickConfig,
  HighlightConfig,
  ScrollConfig,
} from './UIWalkthrough';
