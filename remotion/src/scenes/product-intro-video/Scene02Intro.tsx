import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Background } from '@/components/Global';
import { AnimatedText } from '@/components/AnimatedText';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

export const Scene02Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#533AFD' }}>
      <Background layers={[{ type: 'solid', color: '#533AFD' }]} />

      <AnimatedText
        text="Introducing Stripe Analytics:"
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={10}
        anchor="center"
        offsetY={-80}
        fontSize={64}
        fontWeight={700}
        color="#FFFFFF"
      />

      <AnimatedText
        text="Your Growth Engine for Shopify."
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={30}
        anchor="center"
        offsetY={0}
        fontSize={40}
        fontWeight={500}
        color="#FFFFFF"
      />

      <MotionContainer
        initial="scale-zero"
        delay={0}
        duration={30}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) translateY(80px)', // Centered, then offset below subtitle
        }}
      >
        <div
          style={{
            fontSize: 150,
            lineHeight: 1,
            color: 'white',
            textAlign: 'center',
            display: 'flex', // Use flex to center the emoji itself within the div
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          📊
        </div>
      </MotionContainer>
    </AbsoluteFill>
  );
};