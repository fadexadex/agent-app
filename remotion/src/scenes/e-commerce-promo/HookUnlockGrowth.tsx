import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const HookUnlockGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit start frames, allowing for a 15-frame scene transition at the end
  const headlineExitStart = 75; // 105 (duration) - 15 (transition) - 15 (buffer)
  const subheadlineExitStart = headlineExitStart + 3; // Staggered exit

  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'linear', colors: ["#8BC6EC", "#9599E2"], angle: 90 }]} />
      
      <AnimatedText
        text="Unlock Your E-commerce Growth."
        preset="typewriter"
        animationUnit="character"
        stagger={2} // Corresponds to speed 1.5
        startFrame={10}
        anchor="center"
        offsetY={-40}
        fontSize={72}
        fontWeight={700}
        color="#FFFFFF"
        exit={{
          startFrame: headlineExitStart,
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 10, duration: 15 },
        }}
      />

      <AnimatedText
        text="Insights that drive sales."
        preset="typewriter"
        animationUnit="character"
        stagger={1} // Corresponds to speed 2
        startFrame={30}
        anchor="center"
        offsetY={40}
        fontSize={48}
        fontWeight={500}
        color="#FFFFFF"
        exit={{
          startFrame: subheadlineExitStart,
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 10, duration: 15 },
        }}
      />
    </AbsoluteFill>
  );
};
