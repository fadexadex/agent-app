import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

export const ClarityProductivityBenefit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Placeholder for ProjectCompletionGraph
  const graphEntrance = spring({
    frame: frame - 0, // Appears immediately
    fps,
    config: { damping: 200 },
  });

  const graphOpacity = interpolate(
    frame,
    [99, 119], // Exit starts at 99, duration 20 frames
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill>
      <Background
        layers={[
          { type: "linear", colors: ["#BBDEFB", "#C8E6C9"], angle: 90 }
        ]}
      />

      <AnimatedText
        text="Achieve clarity."
        preset="typewriter"
        startFrame={10}
        anchor="center"
        offsetY={-100}
        fontSize={64}
        fontWeight={700}
        color="#000000"
        exit={{
          startFrame: 90,
          opacity: { from: 1, to: 0, duration: 20 },
          blur: { from: 0, to: 10, duration: 20 },
        }}
      />

      <AnimatedText
        text="Boost productivity."
        preset="typewriter"
        startFrame={30}
        anchor="center"
        offsetY={0}
        fontSize={64}
        fontWeight={700}
        color="#000000"
        exit={{
          startFrame: 93, // Staggered exit
          opacity: { from: 1, to: 0, duration: 20 },
          blur: { from: 0, to: 10, duration: 20 },
        }}
      />

      <AnimatedText
        text="Deliver projects on time."
        preset="typewriter"
        startFrame={50}
        anchor="center"
        offsetY={100}
        fontSize={64}
        fontWeight={700}
        color="#000000"
        exit={{
          startFrame: 96, // Staggered exit
          opacity: { from: 1, to: 0, duration: 20 },
          blur: { from: 0, to: 10, duration: 20 },
        }}
      />

      {/* Project Completion Graph Placeholder */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${graphEntrance})`,
          opacity: graphOpacity,
          marginTop: 200, // Below the text
          fontSize: 32,
          color: '#555',
          fontFamily: 'sans-serif',
          zIndex: -1, // Behind the text, but still visible
        }}
      >
        Project Completion Graph Placeholder
      </div>
    </AbsoluteFill>
  );
};