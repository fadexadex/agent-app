
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { AnimatedText } from '@/components/AnimatedText';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

export const FeatureFocusMode: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // MockupFrame entrance animation (slideInLeft with 3D rotation)
  const mockupEntryProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 200 }, // Snappy spring
    durationInFrames: 40,
  });

  const mockupTranslateX = interpolate(
    mockupEntryProgress,
    [0, 1],
    [-width * 0.5, 0], // Start off-screen left, end at center
    { extrapolateRight: 'clamp' }
  );

  const mockupRotateX = interpolate(
    mockupEntryProgress,
    [0, 1],
    [10, 0],
    { extrapolateRight: 'clamp' }
  );

  const mockupRotateY = interpolate(
    mockupEntryProgress,
    [0, 1],
    [0, 0],
    { extrapolateRight: 'clamp' }
  );

  // Position calculations for pills
  const voiceIndicatorTop = height / 2 - 250;
  const concentrationPillTop = height / 2 + 280;

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A202C' }}>
      <Background layers={[{ type: 'solid', color: '#1A202C' }]} />

      {/* Mockup Frame */}
      <MockupFrame
        type="iphone15"
        theme="dark"
        width={width * 0.4}
        height={height * 0.8}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${mockupTranslateX}px), calc(-50% - 20px))`,
        }}
        rotate={{
          startAngle: { x: 10, y: 0 },
          endAngle: { x: 0, y: 0 },
          startFrame: 0,
          endFrame: 40,
        }}
        exit={{
          startFrame: 120,
          position: { fromX: 0, toX: -width * 0.5 - (width * 0.4 / 2), duration: 20 }, // Slide out left
        }}
      >
        {/* Mockup Content: Focus Mode Screen */}
        <AbsoluteFill style={{ padding: 20, backgroundColor: '#0A0A0F', borderRadius: 50 }}>
          {/* Subtle Glow around timer */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '50%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(124,58,237,0) 70%)',
              filter: 'blur(30px)',
              zIndex: 0,
            }}
          />
          {/* Timer */}
          <AnimatedText
            text="25:00"
            preset="fadeBlurIn"
            startFrame={15}
            animationUnit="full"
            anchor="center"
            fontSize={72}
            fontWeight={700}
            color="#E0E0E0"
            offsetY={-50}
          />
          {/* Studying Text */}
          <AnimatedText
            text="Currently studying: Algebra"
            preset="fadeBlurIn"
            startFrame={30}
            animationUnit="full"
            anchor="center"
            fontSize={24}
            color="#A0A0A0"
            offsetY={30}
          />
          {/* Pause Button */}
          <Sequence from={40} durationInFrames={30}>
            <MotionContainer
              initial="scale-zero"
              delay={0}
              duration={20}
              exit="fade-out"
              exitStartFrame={100} // This exit is internal to mockup
              style={{
                position: 'absolute',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#7C3AED',
                color: 'white',
                padding: '12px 30px',
                borderRadius: 30,
                fontSize: 20,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Pause
            </MotionContainer>
          </Sequence>
        </AbsoluteFill>
      </MockupFrame>

      {/* Focus Voice Indicator Pill */}
      <MotionContainer
        initial="scale-zero"
        delay={30} // Start at frame 30
        duration={25} // Duration 25 frames
        exit="fade-out" // Fade out exit
        exitStartFrame={125} // Exit starts at frame 125
        style={{
          position: 'absolute',
          left: '50%',
          top: voiceIndicatorTop,
          transform: 'translateX(-50%)',
          backgroundColor: '#333A4A',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 25,
          fontSize: 22,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>🔔</span> Focus Mode Active
      </MotionContainer>

      {/* Concentration Pill */}
      <MotionContainer
        initial="blur" // Fade in with slight blur
        delay={50} // Start at frame 50
        duration={30} // Duration 30 frames
        exit="fade-out" // Fade out exit
        exitStartFrame={130} // Exit starts at frame 130
        style={{
          position: 'absolute',
          left: '50%',
          top: concentrationPillTop,
          transform: 'translateX(-50%)',
          backgroundColor: '#28A745', // Green pill
          color: 'white',
          padding: '10px 20px',
          borderRadius: 25,
          fontSize: 22,
          fontWeight: 500,
          zIndex: 10,
        }}
      >
        Deep Concentration
      </MotionContainer>
    </AbsoluteFill>
  );
};
