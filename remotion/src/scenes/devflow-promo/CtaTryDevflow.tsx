
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

// Define the custom CTAButton component
const CTAButton: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  return (
    <div
      style={{
        backgroundColor: 'white',
        color: '#1A202C', // Dark blue text
        padding: '20px 40px',
        borderRadius: '12px',
        fontSize: 32,
        fontWeight: 700,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        whiteSpace: 'nowrap', // Prevent text from wrapping
        ...style,
      }}
    >
      {children}
    </div>
  );
};

interface CtaTryDevflowProps {}

export const CtaTryDevflow: React.FC<CtaTryDevflowProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit timings (staggered by 3 frames)
  const urlExitStartFrame = 70; // URL exits first
  const buttonExitStartFrame = urlExitStartFrame + 3; // Button exits 3 frames after URL
  const questionExitStartFrame = buttonExitStartFrame + 3; // Question exits 3 frames after button
  const exitDuration = 14; // All exit animations last 14 frames, ending around frame 84

  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'solid', color: '#3A8DFF' }]} />

      {/* Question Text */}
      <AnimatedText
        text="Ready to revolutionize your workflow?"
        preset="typewriter"
        startFrame={5}
        anchor="center"
        offsetY={-80}
        fontSize={56}
        fontWeight={600}
        color="#FFFFFF"
        exit={{
          startFrame: questionExitStartFrame,
          opacity: { from: 1, to: 0, duration: exitDuration },
        }}
      />

      {/* CTA Button */}
      <MotionContainer
        initial="offscreen-bottom"
        delay={20} // Start button animation 20 frames after scene start
        duration={30} // Duration of the entrance animation for the button
        exit="slide-down"
        exitStartFrame={buttonExitStartFrame}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)', // Center the MotionContainer
        }}
      >
        <CTAButton>Try DevFlow AI Now</CTAButton>
      </MotionContainer>

      {/* Website URL */}
      <AnimatedText
        text="devflow.ai/get-started"
        preset="typewriter"
        startFrame={50}
        anchor="center"
        offsetY={80}
        fontSize={32}
        fontWeight={600}
        color="#FFFFFF"
        exit={{
          startFrame: urlExitStartFrame,
          opacity: { from: 1, to: 0, duration: exitDuration },
        }}
      />
    </AbsoluteFill>
  );
};
