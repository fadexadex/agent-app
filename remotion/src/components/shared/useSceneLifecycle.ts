/**
 * useSceneLifecycle Hook
 *
 * Provides lifecycle state and progress values for scene components.
 * Makes it trivial for scenes to add coordinated entrance/exit animations.
 *
 * @example
 * ```tsx
 * import { useSceneLifecycle } from '@/components/shared';
 *
 * function MyScene({ durationInFrames }: { durationInFrames: number }) {
 *   const {
 *     isEntering,
 *     isExiting,
 *     enterProgress,
 *     exitProgress,
 *     stableProgress,
 *   } = useSceneLifecycle(durationInFrames);
 *
 *   // Fade in during entrance, fade out during exit
 *   const opacity = isExiting
 *     ? 1 - exitProgress
 *     : enterProgress;
 *
 *   return <div style={{ opacity }}>Content</div>;
 * }
 * ```
 */

import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

// ============================================
// Types
// ============================================

export interface SceneLifecycle {
  /** Current frame within the scene (0-based) */
  frame: number;

  /** Total duration of the scene in frames */
  durationInFrames: number;

  /** Frames per second from video config */
  fps: number;

  /** True during the entrance phase (first 15% of scene) */
  isEntering: boolean;

  /** True during the stable phase (middle 70% of scene) */
  isStable: boolean;

  /** True during the exit phase (last 15% of scene) */
  isExiting: boolean;

  /** Progress through entrance phase (0 at start, 1 when entrance complete) */
  enterProgress: number;

  /** Progress through exit phase (0 when exit starts, 1 at scene end) */
  exitProgress: number;

  /** Progress through stable phase (0 at entrance end, 1 at exit start) */
  stableProgress: number;

  /** Overall scene progress (0 at start, 1 at end) */
  sceneProgress: number;

  /** Frame number where exit phase begins */
  exitStartFrame: number;

  /** Frame number where entrance phase ends */
  entranceEndFrame: number;

  /** Spring-based entrance progress (organic motion) */
  springEntrance: number;

  /** Spring-based exit progress (organic motion) */
  springExit: number;
}

export interface SceneLifecycleOptions {
  /** Percentage of scene duration for entrance phase (default: 0.15 = 15%) */
  entrancePercent?: number;

  /** Percentage of scene duration for exit phase (default: 0.15 = 15%) */
  exitPercent?: number;

  /** Spring config for entrance animation */
  entranceSpring?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };

  /** Spring config for exit animation */
  exitSpring?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

// ============================================
// Default Spring Configs
// ============================================

const DEFAULT_ENTRANCE_SPRING = {
  damping: 20,
  stiffness: 200,
  mass: 1,
};

const DEFAULT_EXIT_SPRING = {
  damping: 100,
  stiffness: 100,
  mass: 1,
};

// ============================================
// Hook Implementation
// ============================================

/**
 * Hook that provides scene lifecycle state and progress values.
 *
 * @param durationInFrames - Total duration of the scene in frames
 * @param options - Optional configuration for entrance/exit timing
 * @returns SceneLifecycle object with all lifecycle state and progress values
 */
export function useSceneLifecycle(
  durationInFrames: number,
  options: SceneLifecycleOptions = {}
): SceneLifecycle {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    entrancePercent = 0.15,
    exitPercent = 0.15,
    entranceSpring = DEFAULT_ENTRANCE_SPRING,
    exitSpring = DEFAULT_EXIT_SPRING,
  } = options;

  // Calculate phase boundaries
  const entranceEndFrame = Math.floor(durationInFrames * entrancePercent);
  const exitStartFrame = durationInFrames - Math.floor(durationInFrames * exitPercent);

  // Determine current phase
  const isEntering = frame < entranceEndFrame;
  const isExiting = frame >= exitStartFrame;
  const isStable = !isEntering && !isExiting;

  // Calculate linear progress values
  const enterProgress = Math.min(frame / entranceEndFrame, 1);
  const exitProgress = isExiting
    ? Math.min((frame - exitStartFrame) / (durationInFrames - exitStartFrame), 1)
    : 0;
  const stableProgress = isStable
    ? (frame - entranceEndFrame) / (exitStartFrame - entranceEndFrame)
    : isEntering
    ? 0
    : 1;
  const sceneProgress = frame / durationInFrames;

  // Calculate spring-based progress (organic motion)
  const springEntrance = spring({
    frame,
    fps,
    durationInFrames: entranceEndFrame,
    config: entranceSpring,
  });

  const springExit = isExiting
    ? spring({
        frame: frame - exitStartFrame,
        fps,
        durationInFrames: durationInFrames - exitStartFrame,
        config: exitSpring,
      })
    : 0;

  return {
    frame,
    durationInFrames,
    fps,
    isEntering,
    isStable,
    isExiting,
    enterProgress,
    exitProgress,
    stableProgress,
    sceneProgress,
    exitStartFrame,
    entranceEndFrame,
    springEntrance,
    springExit,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Creates a combined opacity value that fades in during entrance
 * and fades out during exit.
 *
 * @param lifecycle - SceneLifecycle object from useSceneLifecycle
 * @returns Opacity value between 0 and 1
 */
export function getSceneOpacity(lifecycle: SceneLifecycle): number {
  const { springEntrance, springExit } = lifecycle;
  return springEntrance * (1 - springExit);
}

/**
 * Creates a scale value that grows during entrance
 * and shrinks during exit.
 *
 * @param lifecycle - SceneLifecycle object from useSceneLifecycle
 * @param minScale - Minimum scale value (default: 0.9)
 * @param maxScale - Maximum scale value (default: 1)
 * @returns Scale value
 */
export function getSceneScale(
  lifecycle: SceneLifecycle,
  minScale = 0.9,
  maxScale = 1
): number {
  const { springEntrance, springExit } = lifecycle;
  const entranceScale = interpolate(springEntrance, [0, 1], [minScale, maxScale]);
  const exitScale = interpolate(springExit, [0, 1], [maxScale, minScale]);
  return lifecycle.isExiting ? exitScale : entranceScale;
}

/**
 * Creates a Y translation value that slides up during entrance
 * and slides down during exit.
 *
 * @param lifecycle - SceneLifecycle object from useSceneLifecycle
 * @param distance - Distance to slide in pixels (default: 30)
 * @returns translateY value in pixels
 */
export function getSceneTranslateY(
  lifecycle: SceneLifecycle,
  distance = 30
): number {
  const { springEntrance, springExit } = lifecycle;
  const entranceY = interpolate(springEntrance, [0, 1], [distance, 0]);
  const exitY = interpolate(springExit, [0, 1], [0, -distance]);
  return lifecycle.isExiting ? exitY : entranceY;
}

export default useSceneLifecycle;
