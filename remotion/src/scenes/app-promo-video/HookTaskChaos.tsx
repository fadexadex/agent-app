import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

// Helper component for individual icons within the cluster
const JumbledIcon: React.FC<{
  iconText: string;
  enterStartFrame: number;
  exitStartFrame: number;
  initial: { x: number; y: number; rotate: number; scale: number; opacity: number; blur: number };
  final: { x: number; y: number; rotate: number; scale: number };
}> = ({ iconText, enterStartFrame, exitStartFrame, initial, final }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const enterDuration = 30; // frames for icon to enter and settle
  const exitDuration = 15; // frames for icon to exit

  const entryProgress = spring({
    frame: frame - enterStartFrame,
    fps,
    config: { damping: 20, stiffness: 200 }, // Snappy
  });

  const x = interpolate(entryProgress, [0, 1], [initial.x * width, final.x * width], { extrapolateRight: 'clamp' });
  const y = interpolate(entryProgress, [0, 1], [initial.y * height, final.y * height], { extrapolateRight: 'clamp' });
  const rotate = interpolate(entryProgress, [0, 1], [initial.rotate, final.rotate], { extrapolateRight: 'clamp' });
  const scale = interpolate(entryProgress, [0, 1], [initial.scale, final.scale], { extrapolateRight: 'clamp' });

  const opacity = interpolate(
    frame,
    [enterStartFrame, enterStartFrame + enterDuration, exitStartFrame, exitStartFrame + exitDuration],
    [initial.opacity, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  const blur = interpolate(
    frame,
    [enterStartFrame, enterStartFrame + enterDuration, exitStartFrame, exitStartFrame + exitDuration],
    [initial.blur, 0, 0, 10], // Blur out with a higher value
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        fontSize: 60,
        lineHeight: 1,
        zIndex: Math.round(scale * 10 + (Math.random() * 5)), // slightly random zIndex for overlapping look
        color: '#FFFFFF', // Icons color
      }}
    >
      {iconText}
    </div>
  );
};

// Main JumbledIconCluster component
const JumbledIconCluster: React.FC<{
  overallStartFrame: number;
  overallExitStartFrame: number;
}> = ({ overallStartFrame, overallExitStartFrame }) => {
  return (
    <>
      <JumbledIcon
        iconText="📧"
        enterStartFrame={overallStartFrame + 0} // Staggered start frames
        exitStartFrame={overallExitStartFrame}
        initial={{ x: 0.1, y: 0.2, rotate: 180, scale: 0.5, opacity: 0, blur: 5 }}
        final={{ x: 0.45, y: 0.4, rotate: 10, scale: 0.9 }}
      />
      <JumbledIcon
        iconText="💬"
        enterStartFrame={overallStartFrame + 10}
        exitStartFrame={overallExitStartFrame}
        initial={{ x: 0.9, y: 0.8, rotate: -180, scale: 0.7, opacity: 0, blur: 7 }}
        final={{ x: 0.55, y: 0.5, rotate: -15, scale: 1.1 }}
      />
      <JumbledIcon
        iconText="📄"
        enterStartFrame={overallStartFrame + 5}
        exitStartFrame={overallExitStartFrame}
        initial={{ x: 0.3, y: 0.9, rotate: 90, scale: 0.6, opacity: 0, blur: 6 }}
        final={{ x: 0.35, y: 0.55, rotate: 5, scale: 1.0 }}
      />
      <JumbledIcon
        iconText="📅"
        enterStartFrame={overallStartFrame + 15}
        exitStartFrame={overallExitStartFrame}
        initial={{ x: 0.7, y: 0.1, rotate: 270, scale: 0.8, opacity: 0, blur: 8 }}
        final={{ x: 0.65, y: 0.45, rotate: -5, scale: 1.05 }}
      />
      <JumbledIcon
        iconText="⏰"
        enterStartFrame={overallStartFrame + 20}
        exitStartFrame={overallExitStartFrame}
        initial={{ x: 0.05, y: 0.6, rotate: -90, scale: 0.4, opacity: 0, blur: 4 }}
        final={{ x: 0.5, y: 0.65, rotate: 20, scale: 0.85 }}
      />
    </>
  );
};

export const HookTaskChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const sceneDurationFrames = 120;
  const exitTransitionDuration = 15;
  const exitStartFrame = sceneDurationFrames - exitTransitionDuration;

  return (
    <AbsoluteFill>
      <Background type="solid" color="#1A1A1A" />

      <JumbledIconCluster
        overallStartFrame={0}
        overallExitStartFrame={exitStartFrame}
      />

      <AnimatedText
        text="Drowning in Tasks?"
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={10}
        anchor="center"
        offsetY={-80}
        fontSize={80}
        fontWeight={700}
        color="#FFFFFF"
        exit={{
          startFrame: exitStartFrame,
          opacity: { from: 1, to: 0, duration: exitTransitionDuration },
          blur: { from: 0, to: 10, duration: exitTransitionDuration },
        }}
      />

      <AnimatedText
        text="Stop the Chaos. Start Achieving."
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={30}
        anchor="center"
        offsetY={80}
        fontSize={48}
        fontWeight={500}
        color="#FFFFFF"
        exit={{
          startFrame: exitStartFrame,
          opacity: { from: 1, to: 0, duration: exitTransitionDuration },
          blur: { from: 0, to: 10, duration: exitTransitionDuration },
        }}
      />
    </AbsoluteFill>
  );
};
