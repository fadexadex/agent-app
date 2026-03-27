
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

export const Scene02Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#533AFD' }}>
      {/* Background */}
      <Background layers={[{ type: 'solid', color: '#533AFD' }]} />

      {/* Intro Title */}
      <AnimatedText
        text="Introducing Stripe Analytics:"
        preset="typewriter"
        startFrame={10}
        anchor="center"
        offsetY={-80}
        fontSize={64}
        fontWeight={700}
        color="#FFFFFF"
      />

      {/* Intro Subtitle */}
      <AnimatedText
        text="Your Growth Engine for Shopify."
        preset="typewriter"
        startFrame={30}
        anchor="center"
        offsetY={0}
        fontSize={48}
        fontWeight={500}
        color="#FFFFFF"
      />

      {/* Dashboard Icon */}
      <MotionContainer initial="scale-zero" delay={0} duration={30}>
        <AbsoluteFill style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          top: 80, // Position below subtitle
        }}>
          <div style={{ fontSize: 150, color: '#FFFFFF' }}>
            📊
          </div>
        </AbsoluteFill>
      </MotionContainer>
    </AbsoluteFill>
  );
};
