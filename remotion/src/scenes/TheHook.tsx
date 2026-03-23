import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AnimatedText, LayoutGrid } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';

export const TheHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Gentle floating and scaling effect for the background browser
  const mockupScale = interpolate(frame, [0, 120], [0.95, 1.05], { extrapolateRight: 'clamp' });
  const mockupOpacity = interpolate(
    frame,
    [0, 20, 100, 120],
    [0, 0.25, 0.25, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill>
      {/* Dynamic Background */}
      <Background preset="deepPurpleAurora" animated animationSpeed={0.5} />

      {/* Abstract background browser element for depth */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${mockupScale}) translateY(-30px)`,
          opacity: mockupOpacity,
          filter: 'blur(8px)',
        }}
      >
        <MockupFrame
          type="browser"
          theme="dark"
          width={width * 0.8}
          height={height * 0.6}
          glass={{ blur: 15, opacity: 0.1 }}
        >
          {/* Subtle inner texture for the browser */}
          <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.02)' }} />
        </MockupFrame>
      </AbsoluteFill>

      {/* Typography Layout */}
      <LayoutGrid anchor="center" direction="column" gap={30}>
        {/* Main Headline */}
        <div style={{ maxWidth: width * 0.85, display: 'flex', justifyContent: 'center' }}>
          <AnimatedText
            text="What if you could 10x your workflow?"
            preset="slideInUp"
            animationUnit="word"
            stagger={3}
            startFrame={10}
            fontSize={76}
            fontWeight={800}
            color="#FFFFFF"
            exit={{
              startFrame: 100,
              opacity: { from: 1, to: 0, duration: 15 },
              blur: { from: 0, to: 12, duration: 15 },
              scale: { from: 1, to: 1.05, duration: 15 },
            }}
          />
        </div>

        {/* Subtext */}
        <div style={{ maxWidth: width * 0.75, display: 'flex', justifyContent: 'center' }}>
          <AnimatedText
            text="Every day, thousands of professionals waste hours on repetitive tasks. Your product changes that forever."
            preset="fadeBlurIn"
            animationUnit="word"
            stagger={2}
            startFrame={35}
            fontSize={32}
            fontWeight={400}
            color="rgba(255, 255, 255, 0.75)"
            exit={{
              startFrame: 95,
              opacity: { from: 1, to: 0, duration: 15 },
              blur: { from: 0, to: 10, duration: 15 },
              position: { fromY: 0, toY: -20 },
            }}
          />
        </div>
      </LayoutGrid>
    </AbsoluteFill>
  );
};
