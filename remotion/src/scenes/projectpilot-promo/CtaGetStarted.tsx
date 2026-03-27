import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Background } from '@/components/Global';
import { AnimatedText } from '@/components/AnimatedText';
import React from 'react';

// Custom CallToActionPill component
const CallToActionPill: React.FC<{ text: string; startFrame: number; offsetY: number }> = ({ text, startFrame, offsetY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Button container entrance: spring animation
  const buttonProgress = spring({
    frame: frame - startFrame, // Starts animation at startFrame
    fps,
    config: { damping: 200, stiffness: 150 }, // Smooth pop
  });

  const buttonScale = interpolate(buttonProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  const buttonOpacity = interpolate(buttonProgress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });

  // Text inside button entrance: fade in shortly after button appears
  const textOpacity = interpolate(
    frame,
    [startFrame + 10, startFrame + 20], // Text fades in after button starts its animation
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translateY(${offsetY}px) scale(${buttonScale})`,
        opacity: buttonOpacity,
      }}
    >
      <div
        style={{
          width: 320,
          height: 70,
          backgroundColor: '#FFEB3B',
          borderRadius: 999, // Pill shape
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ color: '#212121', fontSize: 36, fontWeight: 700, opacity: textOpacity }}>
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};


export const CtaGetStarted: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'solid', color: '#1E88E5' }]} />

      <AnimatedText
        text="Ready to Pilot Your Projects?"
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={0}
        anchor="center"
        offsetY={-60}
        fontSize={64}
        fontWeight={700}
        color="white"
      />

      <CallToActionPill
        text="Get Started Free"
        startFrame={20}
        offsetY={40}
      />

      <AnimatedText
        text="projectpilot.com"
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={40}
        anchor="center"
        offsetY={140}
        fontSize={32}
        fontWeight={500}
        color="white"
      />
    </AbsoluteFill>
  );
};