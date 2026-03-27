import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const UnlockGrowthHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeInDuration = 15; // The transition duration as per spec

  // Calculate opacity for the fade-out transition
  const opacity = interpolate(
    frame,
    [durationInFrames - fadeInDuration, durationInFrames],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', opacity: opacity }}>
      {/* Background */}
      <Background
        layers={[
          {
            type: 'linear',
            colors: ['#8BC6EC', '#9599E2'],
            angle: 90, // Default for linear gradient, can be adjusted
          },
        ]}
      />

      {/* Headline Text */}
      <AnimatedText
        text="Unlock Your E-commerce Growth."
        preset="typewriter"
        animationUnit="character" // Typewriter works character by character
        stagger={1.5} // Corresponds to the "speed" of 1.5
        startFrame={10}
        anchor="center"
        offsetY={-40}
        fontSize={72}
        fontWeight={700}
        color="#FFFFFF"
      />

      {/* Subheadline Text */}
      <AnimatedText
        text="Insights that drive sales."
        preset="typewriter"
        animationUnit="character" // Typewriter works character by character
        stagger={2} // Corresponds to the "speed" of 2
        startFrame={30}
        anchor="center"
        offsetY={40}
        fontSize={48}
        fontWeight={500}
        color="#FFFFFF"
      />
    </AbsoluteFill>
  );
};
