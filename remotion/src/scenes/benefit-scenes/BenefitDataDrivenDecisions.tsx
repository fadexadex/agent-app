import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '@/components/Global';
import { AnimatedText } from '@/components/AnimatedText';
import { MotionContainer } from '@/components/Layout';

interface BenefitDataDrivenDecisionsProps {}

export const BenefitDataDrivenDecisions: React.FC<BenefitDataDrivenDecisionsProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        layers={[
          {
            type: "linear",
            colors: ["#1A2A6C", "#B21F1F", "#FDBB2D"],
            angle: 90, // Horizontal rainbow gradient
          }
        ]}
        animated
        animationSpeed={0.5}
      />

      {/* Benefit Headline */}
      <AnimatedText
        text="Stop Guessing. Start Growing."
        preset="typewriter"
        startFrame={10}
        animationUnit="character"
        stagger={1.2}
        anchor="center"
        offsetY={-60}
        fontSize={72}
        fontWeight={700}
        color="#FFFFFF"
        exit={{
          startFrame: 90,
          opacity: { from: 1, to: 0, duration: 20 },
          blur: { from: 0, to: 10, duration: 20 },
          position: { fromY: -60, toY: -100, duration: 20 }
        }}
      />

      {/* Benefit Icons */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)', // Center the row
        display: 'flex',
        gap: 40,
        marginTop: 20 // Position below the headline
      }}>
        {['📈', '💰', '⚙️', '🤝', '📊'].map((icon, index) => (
          <MotionContainer
            key={icon}
            initial="offscreen-bottom"
            delay={30 + index * 5} // Staggered entrance
            duration={20}
            exit="slide-down"
            exitStartFrame={93 + index * 3} // Staggered exit
            style={{
              fontSize: 48,
              color: '#FFFFFF'
            }}
          >
            {icon}
          </MotionContainer>
        ))}
      </div>

      {/* CTA Sub-Text */}
      <AnimatedText
        text="Boost Profitability. Improve Retention."
        preset="typewriter"
        startFrame={50}
        animationUnit="character"
        stagger={1.5}
        anchor="center"
        offsetY={80}
        fontSize={40}
        fontWeight={500}
        color="#FFFFFF"
        exit={{
          startFrame: 96,
          opacity: { from: 1, to: 0, duration: 20 },
          blur: { from: 0, to: 10, duration: 20 },
          position: { fromY: 80, toY: 120, duration: 20 }
        }}
      />
    </AbsoluteFill>
  );
};
