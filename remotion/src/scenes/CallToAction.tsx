import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { CursorPath } from '@/components/DynamicCursor';

export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Button entrance animation
  const buttonPop = spring({
    frame: frame - 50,
    fps,
    config: { damping: 14, stiffness: 200 },
  });

  // Subtle continuous pulse effect after the button pops in
  const pulse = interpolate(
    Math.sin((frame - 50) / 8),
    [-1, 1],
    [1, 1.03],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Shrink the button when clicked by the cursor at frame 100
  const clickScale = interpolate(
    frame, 
    [98, 100, 105, 110], 
    [1, 0.92, 0.92, 1], 
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Combine scaling effects
  const baseScale = frame > 70 ? buttonPop * pulse : buttonPop;
  const buttonScale = baseScale * clickScale;

  return (
    <AbsoluteFill>
      {/* Dynamic bold background suitable for a CTA */}
      <Background preset="neonDream" animated animationSpeed={0.6} />

      {/* Main Headline */}
      <AnimatedText
        text="Start free today"
        preset="slideInUp"
        animationUnit="word"
        stagger={4}
        startFrame={10}
        anchor="center"
        offsetY={-160}
        fontSize={104}
        fontWeight={800}
        color="#FFFFFF"
      />

      {/* Primary Subtext */}
      <AnimatedText
        text="Join thousands of teams already using Your product."
        preset="fadeBlurIn"
        startFrame={30}
        anchor="center"
        offsetY={-20}
        fontSize={36}
        fontWeight={500}
        color="rgba(255, 255, 255, 0.95)"
      />

      {/* Secondary Subtext */}
      <AnimatedText
        text="No credit card required. Get started in 30 seconds."
        preset="fadeBlurIn"
        startFrame={40}
        anchor="center"
        offsetY={40}
        fontSize={32}
        fontWeight={400}
        color="rgba(255, 255, 255, 0.6)"
      />

      {/* CTA Button Wrapper */}
      <div
        style={{
          position: 'absolute',
          top: '72%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${buttonScale})`,
          opacity: buttonPop,
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            color: '#000000',
            padding: '24px 56px',
            borderRadius: '100px',
            fontSize: 36,
            fontWeight: 800,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 80px rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          Get Started
          {/* Animated Arrow Icon */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: `translateX(${interpolate(
                Math.sin((frame - 50) / 5),
                [-1, 1],
                [0, 6],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              )}px)`
            }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Simulated User Interaction */}
      <CursorPath
        path={[
          { x: 1500, y: 1200, frame: 50 },
          { x: 1050, y: 850, frame: 80 },
          { x: 960, y: 780, frame: 100, action: 'click' },
          { x: 960, y: 780, frame: 120 }, // Hold after click
        ]}
        showTrail={false}
        variant="pointer"
      />
    </AbsoluteFill>
  );
};