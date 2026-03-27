
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

interface IconProps {
  children: React.ReactNode;
  delay: number;
  exitStartFrame: number;
  exitDuration: number;
  x: number;
  y: number;
}

const Icon: React.FC<IconProps> = ({ children, delay, exitStartFrame, exitDuration, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 8 }, // Bouncy spring
  });

  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200 }, // Smooth exit
  });

  const scale = interpolate(entranceProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      left: `${x}%`,
      top: `${y}%`,
      width: '0px', // Positioning reference
      height: '0px', // Positioning reference
    }}>
      <div
        style={{
          fontSize: 64,
          transform: `scale(${scale})`,
          opacity: opacity,
          position: 'absolute',
          transformOrigin: 'center',
          color: 'white' // Icons are white for contrast
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};


export const BenefitAcademicSuccess: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Entrance animations for title and subtitle are handled by AnimatedText
  // Exit animations for title and subtitle are handled by AnimatedText

  return (
    <AbsoluteFill style={{ backgroundColor: '#FDD835' }}>
      <Background
        layers={[
          {
            type: "radial",
            colors: ["#FDD835", "#FFB300"],
            centerX: 50,
            centerY: 50,
            radius: 100,
            opacity: 1
          },
        ]}
      />

      <AnimatedText
        text="Achieve Academic Success"
        preset="slideInUp"
        animationUnit="full"
        startFrame={0}
        anchor="center"
        offsetY={-80}
        fontSize={72}
        fontWeight={700}
        color="#FFFFFF"
        exit={{
          startFrame: 90,
          opacity: { from: 1, to: 0, duration: 15 },
        }}
      />

      {/* Icon Grid */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', top: 80 }}>
        {/* Row 1 */}
        <Icon delay={20} exitStartFrame={95} exitDuration={10} x={-15} y={-50}>🏆</Icon>
        <Icon delay={20 + 5} exitStartFrame={95} exitDuration={10} x={0} y={-50}>🎓</Icon>
        <Icon delay={20 + 10} exitStartFrame={95} exitDuration={10} x={15} y={-50}>✅</Icon>
        {/* Row 2 */}
        <Icon delay={20 + 15} exitStartFrame={95} exitDuration={10} x={-15} y={50}>😊</Icon>
        <Icon delay={20 + 20} exitStartFrame={95} exitDuration={10} x={0} y={50}>⏰</Icon>
        <Icon delay={20 + 25} exitStartFrame={95} exitDuration={10} x={15} y={50}>🧠</Icon>
      </AbsoluteFill>

      <AnimatedText
        text="Boost grades, master subjects, unlock your potential"
        preset="fadeBlurIn" // Using fadeBlurIn for "fade in with slight scale up" approximation
        animationUnit="full"
        startFrame={40}
        anchor="center"
        offsetY={180}
        fontSize={36}
        fontWeight={500}
        color="#FFFFFF"
        exit={{
          startFrame: 100,
          opacity: { from: 1, to: 0, duration: 10 },
        }}
      />
    </AbsoluteFill>
  );
};
