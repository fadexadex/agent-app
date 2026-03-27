
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import React from 'react';

// Custom component for the animated 'X' indicator
const ProblemXIndicator: React.FC<{ startFrame: number; exitStartFrame: number; }> = ({ startFrame, exitStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scale animation for entrance
  const scaleIn = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 10, stiffness: 200 }, // Snappy entrance
  });

  // Opacity animation for both entrance and exit
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 15, exitStartFrame, exitStartFrame + 20], // Fade in over 15 frames, hold, fade out over 20 frames
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(${scaleIn})`, // Apply scale from spring
        opacity: opacity,
        fontSize: '150px',
        color: '#EF4444', // Red color
        fontWeight: 'bold',
        zIndex: 10,
        // Apply blur only during exit phase for the indicator
        filter: `blur(${interpolate(frame, [exitStartFrame, exitStartFrame + 20], [0, 5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`
      }}
    >
      &times;
    </div>
  );
};

interface HookDesignDisconnectProps {}

export const HookDesignDisconnect: React.FC<HookDesignDisconnectProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Scene-wide blur for the transition out
  const sceneBlur = interpolate(
    frame,
    [120 - 15, 120], // Last 15 frames
    [0, 10], // Blur from 0 to 10px
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1A1A', filter: `blur(${sceneBlur}px)` }}>
      {/* Background */}
      <Background layers={[{ type: 'solid', color: '#1A1A1A' }]} />

      {/* Text Element */}
      <Sequence from={0} durationInFrames={120}>
        <AnimatedText
          text="Designs trapped in pixels? Not anymore."
          preset="typewriter"
          animationUnit="character"
          stagger={0.7} // ~1 / 1.5 = 0.666, so 0.7 frames per character
          startFrame={0}
          anchor="center"
          offsetY={-150}
          fontSize={72}
          fontWeight={700}
          color="#FFFFFF"
          exit={{
            startFrame: 100, // Exits last
            opacity: { from: 1, to: 0, duration: 20 },
            blur: { from: 0, to: 10, duration: 20 },
          }}
        />
      </Sequence>

      {/* Figma Mockup */}
      <Sequence from={30} durationInFrames={90} name="FigmaMockupSequence"> {/* Starts at 30, ends at 120 */}
        <MockupFrame
          type="browser"
          children={<div style={{ width: '100%', height: '100%', backgroundColor: '#F0F0F0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', color: '#333' }}>Figma UI Placeholder</div>}
          preset="slideInLeft"
          startFrame={0} // Relative to Sequence start (global frame 30)
          anchor="center"
          offsetX={-250}
          offsetY={50}
          width={600}
          height={400}
          glass={{ blur: 5, opacity: 0.1 }}
          glare
          exit={{
            startFrame: 60, // Relative to Sequence start (global frame 90)
            opacity: { from: 1, to: 0, duration: 20 },
            position: { fromX: -250, toX: -width / 2 - 100, fromY: 50, toY: 50, duration: 20 }, // Slide out left
          }}
        />
      </Sequence>

      {/* Code Editor Mockup */}
      <Sequence from={30} durationInFrames={90} name="CodeEditorMockupSequence">
        <MockupFrame
          type="card"
          children={<div style={{ width: '100%', height: '100%', backgroundColor: '#2D2D2D', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', color: '#FFF' }}>Messy Code Placeholder</div>}
          preset="slideInRight"
          startFrame={0} // Relative to Sequence start (global frame 30)
          anchor="center"
          offsetX={250}
          offsetY={50}
          width={600}
          height={400}
          glass={{ blur: 5, opacity: 0.1 }}
          glare
          exit={{
            startFrame: 60, // Relative to Sequence start (global frame 90)
            opacity: { from: 1, to: 0, duration: 20 },
            position: { fromX: 250, toX: width / 2 + 100, fromY: 50, toY: 50, duration: 20 }, // Slide out right
          }}
        />
      </Sequence>

      {/* Problem Indicator */}
      <Sequence from={60} durationInFrames={60} name="ProblemIndicatorSequence"> {/* Starts at global frame 60 */}
        <ProblemXIndicator startFrame={0} exitStartFrame={35} /> {/* startFrame=0 means at global 60, exitStartFrame=35 means at global 95 */}
      </Sequence>
    </AbsoluteFill>
  );
};
