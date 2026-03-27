import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

// Custom FeaturePill component
const FeaturePill: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        backgroundColor: '#E0F2F7', // Light blue
        padding: '12px 24px',
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        color: '#212529', // Dark text
        fontSize: 28,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {children}
    </div>
  );
};

export const FeatureSmartSchedule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Mockup entrance animation
  const mockupEntryProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 200 }, // Snappy spring
    delay: 0,
  });

  // Mockup 3D rotation
  const rotateX = interpolate(
    frame,
    [0, 40],
    [-10, 0],
    { extrapolateRight: 'clamp' }
  );
  const rotateY = interpolate(
    frame,
    [0, 40],
    [0, 0], // Only X rotation specified
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#F8F9FA' }}>
      <Background layers={[{ type: 'solid', color: '#F8F9FA' }]} />

      {/* Mockup Frame */}
      <MotionContainer
        initial="offscreen-right"
        delay={0}
        duration={40} // Using MotionContainer for entrance animation
        exit="slide-right" // Using 'slide-right' for exit preset
        exitStartFrame={120}
        style={{
          transform: `scale(${mockupEntryProgress}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transformOrigin: 'center',
          translateX: '-50%',
          translateY: '-20px',
        }}
      >
        <MockupFrame
          type="iphone15"
          width={300} // Adjust size as needed
          height={600}
        >
          {/* Placeholder for mockup screen content */}
          <AbsoluteFill style={{ backgroundColor: '#ffffff', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ color: '#ccc', fontSize: 20 }}>StudyFlow App</p>
          </AbsoluteFill>
        </MockupFrame>
      </MotionContainer>

      {/* Feature Pill Text */}
      <MotionContainer
        initial="scale-zero"
        delay={30}
        duration={25} // Smooth spring
        exit="fade-out"
        exitStartFrame={125}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateX(-50%) translateY(-250px)',
        }}
      >
        <FeaturePill>Effortless Scheduling</FeaturePill>
      </MotionContainer>

      {/* Explainer Text */}
      <AnimatedText
        text="Let AI optimize your study time."
        preset="fadeBlurIn"
        startFrame={50}
        animationUnit="full"
        anchor="center"
        offsetY={280}
        fontSize={24}
        fontWeight={400}
        color="#343A40"
        exit={{
          startFrame: 130,
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 5, duration: 15 },
        }}
      />

      {/* Typewriter Text on Mockup */}
      <AnimatedText
        text="Calculus Homework, Due Friday"
        preset="typewriter"
        startFrame={60}
        stagger={1.5}
        animationUnit="character"
        anchor="top-left"
        offsetX={width / 2 - 300 / 2 + 50} // Adjust to be inside phone screen (width / 2 - mockupWidth / 2 + padding)
        offsetY={height / 2 - 600 / 2 + 150} // Adjust to be inside phone screen (height / 2 - mockupHeight / 2 + padding)
        fontSize={22}
        fontWeight={500}
        color="#333"
        exit={{
          startFrame: 110,
          opacity: { from: 1, to: 0, duration: 10 },
        }}
      />
    </AbsoluteFill>
  );
};