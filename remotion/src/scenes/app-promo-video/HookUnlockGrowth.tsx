import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const HookUnlockGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate stagger for typewriter effect
  // speed (chars/frame) -> stagger (frames/char) = 1 / speed
  const headlineStagger = 1 / 1.5; // For "Unlock Your E-commerce Growth."
  const subheadlineStagger = 1 / 2; // For "Insights that drive sales."

  // Exit timing
  const sceneDuration = 105;
  const exitTransitionDuration = 15; // From scene.transition.duration
  const exitStartTime = sceneDuration - exitTransitionDuration; // 105 - 15 = 90

  const headlineExitStart = exitStartTime; // Frame 90
  const subheadlineExitStart = exitStartTime + 3; // Frame 93 (staggered by 3 frames)
  const exitAnimationDuration = exitTransitionDuration; // Each element fades out over 15 frames

  return (
    <AbsoluteFill>
      <Background
        layers={[
          {
            type: 'linear',
            colors: ['#8BC6EC', '#9599E2'],
            angle: 90, // Default for linear gradients, can be adjusted
          },
        ]}
      />

      {/* Headline Text */}
      <AnimatedText
        text="Unlock Your E-commerce Growth."
        preset="typewriter"
        animationUnit="character"
        stagger={headlineStagger}
        startFrame={10} // From typewriter.start
        anchor="center"
        offsetY={-40}
        fontSize={72} // Adjusted for better visibility and impact
        fontWeight={700}
        color="#FFFFFF"
        exit={{
          startFrame: headlineExitStart,
          opacity: { from: 1, to: 0, duration: exitAnimationDuration },
        }}
      />

      {/* Subheadline Text */}
      <AnimatedText
        text="Insights that drive sales."
        preset="typewriter"
        animationUnit="character"
        stagger={subheadlineStagger}
        startFrame={30} // From typewriter.start
        anchor="center"
        offsetY={40}
        fontSize={40} // Adjusted for better visibility
        fontWeight={500}
        color="#FFFFFF"
        exit={{
          startFrame: subheadlineExitStart,
          opacity: { from: 1, to: 0, duration: exitAnimationDuration },
        }}
      />
    </AbsoluteFill>
  );
};