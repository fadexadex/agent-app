/**
 * UIWalkthrough Component
 *
 * High-level orchestrator for UI demo sequences.
 * Coordinates cursor movement, highlights, scrolling, and click animations.
 *
 * @example
 * ```tsx
 * import { UIWalkthrough } from '@/components/UIDemo';
 *
 * const steps: UIStep[] = [
 *   {
 *     cursorTo: { x: 100, y: 200 },
 *     cursorDuration: 30,
 *     highlight: { width: 120, height: 40, type: 'ring' },
 *     click: { delay: 10 },
 *     duration: 60,
 *   },
 *   {
 *     cursorTo: { x: 300, y: 400 },
 *     cursorDuration: 25,
 *     scroll: { fromY: 0, toY: 200, duration: 30 },
 *     duration: 50,
 *   },
 * ];
 *
 * <UIWalkthrough steps={steps} />
 * ```
 */

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { DynamicCursor, CursorVariant } from '../DynamicCursor/DynamicCursor';
import { UIHighlight, HighlightType, LabelPosition } from './UIHighlight';

// ============================================
// Types
// ============================================

export interface Position {
  x: number;
  y: number;
}

export interface ClickConfig {
  /** Delay after cursor arrives before click (frames) */
  delay?: number;
  /** Ripple effect color */
  rippleColor?: string;
  /** Number of click animations */
  clickCount?: number;
}

export interface HighlightConfig {
  /** Width of highlight area */
  width: number;
  /** Height of highlight area */
  height: number;
  /** Type of highlight effect */
  type?: HighlightType;
  /** Highlight color */
  color?: string;
  /** Optional label text */
  label?: string;
  /** Label position */
  labelPosition?: LabelPosition;
  /** Number of pulses */
  pulseCount?: number;
  /** Offset from cursor position */
  offset?: Position;
}

export interface ScrollConfig {
  /** Starting scroll Y position */
  fromY: number;
  /** Ending scroll Y position */
  toY: number;
  /** Duration of scroll animation (frames) */
  duration: number;
  /** Delay before scroll starts (frames) */
  delay?: number;
}

export interface UIStep {
  /** Target cursor position */
  cursorTo: Position;
  /** Duration to move cursor to target (frames) */
  cursorDuration: number;
  /** Click configuration (optional) */
  click?: ClickConfig;
  /** Highlight configuration (optional) */
  highlight?: HighlightConfig;
  /** Scroll configuration (optional) */
  scroll?: ScrollConfig;
  /** Cursor variant during this step */
  cursorVariant?: CursorVariant;
  /** Total duration of this step (frames) */
  duration: number;
  /** Pause at start of step (frames) */
  pauseBefore?: number;
}

export interface UIWalkthroughProps {
  /** Array of walkthrough steps */
  steps: UIStep[];
  /** Frame to start the walkthrough */
  startFrame?: number;
  /** Default cursor color */
  cursorColor?: string;
  /** Default highlight color */
  highlightColor?: string;
  /** Callback for scroll position (to sync with ScrollContainer) */
  onScrollY?: (scrollY: number) => void;
  /** Spring config for cursor movement */
  cursorSpring?: {
    damping?: number;
    stiffness?: number;
  };
}

// ============================================
// Helper Functions
// ============================================

interface StepTiming {
  startFrame: number;
  endFrame: number;
  step: UIStep;
  index: number;
}

function calculateStepTimings(steps: UIStep[], startFrame: number): StepTiming[] {
  const timings: StepTiming[] = [];
  let currentFrame = startFrame;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepStart = currentFrame + (step.pauseBefore || 0);
    timings.push({
      startFrame: stepStart,
      endFrame: stepStart + step.duration,
      step,
      index: i,
    });
    currentFrame = stepStart + step.duration;
  }

  return timings;
}

function findCurrentStep(timings: StepTiming[], frame: number): StepTiming | null {
  for (const timing of timings) {
    if (frame >= timing.startFrame && frame < timing.endFrame) {
      return timing;
    }
  }
  // Return last step if past all steps
  if (timings.length > 0 && frame >= timings[timings.length - 1].endFrame) {
    return timings[timings.length - 1];
  }
  return null;
}

// ============================================
// Click Ripple Effect
// ============================================

interface ClickRippleProps {
  x: number;
  y: number;
  progress: number;
  color: string;
}

const ClickRipple: React.FC<ClickRippleProps> = ({ x, y, progress, color }) => {
  const scale = progress * 2;
  const opacity = 1 - progress;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - 20,
        top: y - 20,
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: color,
        transform: `scale(${scale})`,
        opacity: opacity * 0.5,
        pointerEvents: 'none',
      }}
    />
  );
};

// ============================================
// Main Component
// ============================================

export const UIWalkthrough: React.FC<UIWalkthroughProps> = ({
  steps,
  startFrame = 0,
  cursorColor = '#000000',
  highlightColor = '#6366F1',
  onScrollY,
  cursorSpring = { damping: 15, stiffness: 150 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate step timings once
  const stepTimings = useMemo(
    () => calculateStepTimings(steps, startFrame),
    [steps, startFrame]
  );

  // Find current step
  const currentStepTiming = findCurrentStep(stepTimings, frame);

  // Calculate cursor position
  const getCursorPosition = (): Position => {
    if (!currentStepTiming) {
      return steps[0]?.cursorTo || { x: 0, y: 0 };
    }

    const { step, startFrame: stepStart, index } = currentStepTiming;
    const localFrame = frame - stepStart;

    // Get previous position (or current if first step)
    const prevPosition = index > 0
      ? steps[index - 1].cursorTo
      : step.cursorTo;

    // Calculate movement progress
    const moveProgress = spring({
      frame: localFrame,
      fps,
      durationInFrames: step.cursorDuration,
      config: cursorSpring,
    });

    return {
      x: prevPosition.x + (step.cursorTo.x - prevPosition.x) * moveProgress,
      y: prevPosition.y + (step.cursorTo.y - prevPosition.y) * moveProgress,
    };
  };

  // Calculate scroll position
  const getScrollY = (): number => {
    const scroll = currentStepTiming?.step.scroll;
    if (!currentStepTiming || !scroll) {
      return 0;
    }

    const { step, startFrame: stepStart } = currentStepTiming;
    const scrollDelay = scroll.delay ?? step.cursorDuration;
    const scrollFrame = frame - stepStart - scrollDelay;

    if (scrollFrame < 0) return scroll.fromY;

    const scrollProgress = spring({
      frame: scrollFrame,
      fps,
      durationInFrames: scroll.duration,
      config: { damping: 20, stiffness: 100 },
    });

    return scroll.fromY + (scroll.toY - scroll.fromY) * scrollProgress;
  };

  // Calculate click animation
  const getClickProgress = (): number => {
    const click = currentStepTiming?.step.click;
    if (!currentStepTiming || !click) {
      return 0;
    }

    const { step, startFrame: stepStart } = currentStepTiming;
    const clickDelay = step.cursorDuration + (click.delay ?? 5);
    const clickFrame = frame - stepStart - clickDelay;

    if (clickFrame < 0 || clickFrame > 15) return 0;

    return interpolate(clickFrame, [0, 15], [0, 1], {
      extrapolateRight: 'clamp',
    });
  };

  // Check if cursor should be in clicking state
  const isClicking = (): boolean => {
    const click = currentStepTiming?.step.click;
    if (!currentStepTiming || !click) {
      return false;
    }

    const { step, startFrame: stepStart } = currentStepTiming;
    const clickDelay = step.cursorDuration + (click.delay ?? 5);
    const clickFrame = frame - stepStart - clickDelay;

    return clickFrame >= 0 && clickFrame <= 10;
  };

  const cursorPosition = getCursorPosition();
  const scrollY = getScrollY();
  const clickProgress = getClickProgress();
  const clicking = isClicking();

  // Call scroll callback if provided
  React.useEffect(() => {
    if (onScrollY) {
      onScrollY(scrollY);
    }
  }, [scrollY, onScrollY]);

  // Don't render before start
  if (frame < startFrame) return null;

  return (
    <>
      {/* Render highlights for current step */}
      {currentStepTiming?.step.highlight && (
        <UIHighlight
          x={currentStepTiming.step.cursorTo.x + (currentStepTiming.step.highlight.offset?.x || 0)}
          y={currentStepTiming.step.cursorTo.y + (currentStepTiming.step.highlight.offset?.y || 0)}
          width={currentStepTiming.step.highlight.width}
          height={currentStepTiming.step.highlight.height}
          type={currentStepTiming.step.highlight.type}
          color={currentStepTiming.step.highlight.color || highlightColor}
          label={currentStepTiming.step.highlight.label}
          labelPosition={currentStepTiming.step.highlight.labelPosition}
          pulseCount={currentStepTiming.step.highlight.pulseCount}
          delay={0}
        />
      )}

      {/* Click ripple effect */}
      {clickProgress > 0 && currentStepTiming?.step.click && (
        <ClickRipple
          x={cursorPosition.x}
          y={cursorPosition.y}
          progress={clickProgress}
          color={currentStepTiming.step.click.rippleColor || highlightColor}
        />
      )}

      {/* Cursor */}
      <DynamicCursor
        x={cursorPosition.x}
        y={cursorPosition.y}
        variant={currentStepTiming?.step.cursorVariant || 'arrow'}
        color={cursorColor}
        isClicking={clicking}
      />
    </>
  );
};

export default UIWalkthrough;
