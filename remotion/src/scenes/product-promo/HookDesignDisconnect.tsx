import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import React from 'react';

// Custom ProblemXIndicator Component
const ProblemXIndicator: React.FC<{
  centerX: number;
  centerY: number;
  enterStartFrame: number;
  exitStartFrame: number;
  animationDuration: number; // For both entrance and exit
}> = ({ centerX, centerY, enterStartFrame, exitStartFrame, animationDuration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame,
    [enterStartFrame, enterStartFrame + animationDuration, exitStartFrame, exitStartFrame + animationDuration],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  const scale = interpolate(progress, [0, 1], [0.5, 1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(progress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });


  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${centerX}px), calc(-50% + ${centerY}px)) scale(${scale})`,
        opacity: opacity,
        fontSize: 120, // Large X
        fontWeight: 'bold',
        color: 'red',
        zIndex: 10,
        lineHeight: 1, // Prevent extra line height from pushing it
        pointerEvents: 'none', // Ensure it doesn't block interactions if this were interactive
        textShadow: '0 0 20px rgba(255,0,0,0.5)', // Add a subtle glow
      }}
    >
      X
    </div>
  );
};


export const HookDesignDisconnect: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Define timings
  const textEnterStart = 0;
  const mockupsEnterStart = 30; // Mockups start after text begins
  const problemIndicatorEnterStart = 60; // Problem indicator appears after mockups are mostly in

  // Exit timings based on notes:
  // Mockups exit simultaneously: 100
  // Problem indicator 5 frames after mockups: 105
  // Text 5 frames after problem indicator: 110
  const animationDuration = 10; // Duration for fade/scale in/out of the indicator, and for component exits

  const mockupsExitStart = 100;
  const problemIndicatorExitStart = mockupsExitStart + 5;
  const textExitStart = problemIndicatorExitStart + 5;


  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1A1A' }}>
      <Background layers={[{ type: 'solid', color: '#1A1A1A' }]} />

      {/* Figma Mockup */}
      <MockupFrame
        type="browser"
        preset="springIn"
        startFrame={mockupsEnterStart}
        width={700}
        height={400}
        browserConfig={{ url: "figma.com/design" }}
        // Position: anchor: "center", x: -250, y: 50
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + -250px), calc(-50% + 50px))`,
          zIndex: 5,
        }}
        exit={{
          startFrame: mockupsExitStart,
          opacity: { from: 1, to: 0, duration: animationDuration },
          scale: { from: 1, to: 0.9, duration: animationDuration }
        }}
      />

      {/* Code Editor Mockup */}
      <MockupFrame
        type="card"
        preset="springIn"
        startFrame={mockupsEnterStart}
        width={600}
        height={400}
        // Position: anchor: "center", x: 250, y: 50
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + 250px), calc(-50% + 50px))`,
          zIndex: 5,
        }}
        exit={{
          startFrame: mockupsExitStart,
          opacity: { from: 1, to: 0, duration: animationDuration },
          scale: { from: 1, to: 0.9, duration: animationDuration }
        }}
      />

      {/* Problem Indicator - positioned between mockups */}
      <ProblemXIndicator
        centerX={0} // Centered horizontally
        centerY={50} // Vertically centered with mockups
        enterStartFrame={problemIndicatorEnterStart}
        exitStartFrame={problemIndicatorExitStart}
        animationDuration={animationDuration}
      />

      {/* Pain Point Text */}
      <AnimatedText
        text="Designs trapped in pixels? Not anymore."
        preset="typewriter"
        startFrame={textEnterStart}
        anchor="center"
        offsetY={-150}
        fontSize={80}
        fontWeight={800}
        color="#FFFFFF"
        exit={{
          startFrame: textExitStart,
          opacity: { from: 1, to: 0, duration: animationDuration },
          blur: { from: 0, to: 10, duration: animationDuration }
        }}
      />
    </AbsoluteFill>
  );
};