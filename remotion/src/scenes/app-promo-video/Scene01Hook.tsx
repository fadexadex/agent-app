
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

interface Scene01HookProps {}

export const Scene01Hook: React.FC<Scene01HookProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Background
        layers={[
          {
            type: "radial",
            colors: ["#533AFD", "#7E6BFD", "#A99DFE", "transparent"],
            centerX: 50,
            centerY: 50,
            radius: 80,
            animateGradient: true,
          },
        ]}
        animated
        animationSpeed={0.8}
      />

      {/* Large Question Mark Graphic (appears behind main text) */}
      <AnimatedText
        text="?"
        preset="scaleUp" // Scales up from zero
        startFrame={0} // Appears at the beginning
        anchor="center"
        fontSize={300}
        fontWeight={900}
        color="#FFFFFF"
        style={{ zIndex: 1 }} // Explicitly setting zIndex to ensure it's behind
      />

      {/* Main hook question */}
      <AnimatedText
        text="Struggling to scale your Shopify store?"
        preset="typewriter"
        animationUnit="word"
        stagger={3}
        startFrame={15}
        anchor="center"
        offsetY={-40}
        fontSize={64}
        fontWeight={700}
        color="#FFFFFF"
        style={{ zIndex: 2 }} // Ensure it's above the question mark
      />

      {/* Pain point icon (emoji text) */}
      <AnimatedText
        text="📈 📉 😟"
        preset="scaleUp"
        startFrame={50} // Appears after main text starts
        anchor="center"
        offsetY={50}
        fontSize={60}
        color="#FFFFFF"
        style={{ zIndex: 2 }} // Ensure it's above the question mark
      />
    </AbsoluteFill>
  );
};
