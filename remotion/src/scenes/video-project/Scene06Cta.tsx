
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

export const Scene06Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation for the button background's scale-up to mimic entrance
  const buttonScale = spring({
    frame: frame - 50, // Start button animation at frame 50
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const buttonOpacity = interpolate(frame, [50, 60], [0, 1], { extrapolateRight: 'clamp' });


  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'solid', color: '#533AFD' }]} />

      {/* Stripe Analytics Logo - simulated with AnimatedText */}
      <AnimatedText
        text="Stripe Analytics"
        preset="scaleUp"
        startFrame={0}
        animationUnit="full"
        anchor="center"
        offsetY={-180}
        fontSize={60}
        fontWeight={700}
        color="#FFFFFF"
      />

      {/* Main CTA Text */}
      <AnimatedText
        text="Ready to grow smarter?"
        preset="fadeBlurIn"
        startFrame={10}
        animationUnit="full"
        anchor="center"
        offsetY={-80}
        fontSize={80}
        fontWeight={700}
        color="#FFFFFF"
      />

      {/* CTA Button - simulated with MotionContainer and AnimatedText */}
      <MotionContainer
        initial="offscreen-bottom"
        delay={50} // Button animation starts at frame 50
        duration={20} // Duration for slide-up
        style={{
          position: 'absolute',
          bottom: '10%', // Position it below the center
          left: '50%',
          transform: `translateX(-50%)`,
          backgroundColor: '#7E6BFD',
          borderRadius: 40,
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0px 10px 20px rgba(0,0,0,0.2)',
          opacity: buttonOpacity,
        }}
      >
        <AnimatedText
          text="Start Your Free Trial"
          startFrame={0} // Text inside MotionContainer can start immediately relative to MotionContainer's entrance
          animationUnit="full"
          fontSize={40}
          fontWeight={600}
          color="#1A1A1A" // Dark color for contrast on vibrant button
          anchor="center"
          offsetY={0} // Centered within the button container
        />
      </MotionContainer>
    </AbsoluteFill>
  );
};
