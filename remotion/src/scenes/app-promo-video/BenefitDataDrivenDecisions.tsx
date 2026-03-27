import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const BenefitDataDrivenDecisions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // The 'rainbow' preset for Background handles the colors directly
  // from its internal configuration. Providing additional 'layers' or 'meshColors'
  // might override or conflict, so I'll rely on the preset.

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Background preset="rainbow" />
      
      <AnimatedText
        text="Stop Guessing. Start Growing."
        preset="typewriter"
        animationUnit="character"
        startFrame={10}
        anchor="center"
        offsetY={-60}
        fontSize={72} // Large for a headline
        fontWeight={700}
        color="#FFFFFF"
      />

      {/* The 'benefit-icons' element was a placeholder in the JSON and will be omitted */}
      
      <AnimatedText
        text="Boost Profitability. Improve Retention."
        preset="typewriter"
        animationUnit="character"
        startFrame={50}
        anchor="center"
        offsetY={80}
        fontSize={40} // Smaller than headline, but still prominent
        fontWeight={500}
        color="#FFFFFF"
      />
    </AbsoluteFill>
  );
};
