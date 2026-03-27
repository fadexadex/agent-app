
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, random } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

interface ScatteredWorkIconsProps {
  startFrame: number;
  exitStartFrame: number;
  exitDuration: number;
}

const iconList = [
  '📅', '💬', '📁', '📄', '📧', '⏰', '🧑‍💻', '📈', '🔧', '☕'
];

const ScatteredWorkIcons: React.FC<ScatteredWorkIconsProps> = ({ startFrame, exitStartFrame, exitDuration }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animation for the icons
  const iconAnimations = iconList.map((_, index) => {
    const seed = index * 0.1 + 0.1; // Unique seed for each icon for random properties
    const delay = index * 3; // Stagger icon entrances

    const entranceProgress = spring({
      frame: frame - startFrame - delay,
      fps,
      config: { damping: 10, stiffness: 100 },
    });

    const chaoticMoveProgress = spring({
      frame: frame - startFrame - delay - 10, // Start chaotic movement slightly after initial entrance
      fps,
      config: { damping: 15, stiffness: 80 },
    });

    // Initial position (clustered center)
    const initialX = width / 2;
    const initialY = height / 2;
    const initialScale = 0;
    const initialRotate = 0;

    // Random scattered positions and rotations
    const endX = interpolate(random(seed + 0.1), [0, 1], [width * 0.1, width * 0.9]);
    const endY = interpolate(random(seed + 0.2), [0, 1], [height * 0.1, height * 0.9]);
    const endScale = interpolate(random(seed + 0.3), [0, 1], [0.8, 1.2]);
    const endRotate = interpolate(random(seed + 0.4), [0, 1], [-45, 45]);

    const translateX = interpolate(chaoticMoveProgress, [0, 1], [0, endX - initialX], { extrapolateRight: 'clamp' });
    const translateY = interpolate(chaoticMoveProgress, [0, 1], [0, endY - initialY], { extrapolateRight: 'clamp' });
    const scale = interpolate(entranceProgress, [0, 1], [initialScale, endScale], { extrapolateRight: 'clamp' });
    const rotate = interpolate(chaoticMoveProgress, [0, 1], [initialRotate, endRotate], { extrapolateRight: 'clamp' });

    // Exit animation for icons
    const exitOpacity = interpolate(
      frame,
      [exitStartFrame, exitStartFrame + exitDuration],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const exitBlur = interpolate(
      frame,
      [exitStartFrame, exitStartFrame + exitDuration],
      [0, 12],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return {
      translateX,
      translateY,
      scale,
      rotate,
      opacity: exitOpacity,
      filter: `blur(${exitBlur}px)`,
    };
  });

  return (
    <>
      {iconList.map((icon, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: width / 2, // Start at center
            top: height / 2, // Start at center
            transform: `translate(-50%, -50%) translateX(${iconAnimations[index].translateX}px) translateY(${iconAnimations[index].translateY}px) scale(${iconAnimations[index].scale}) rotate(${iconAnimations[index].rotate}deg)`,
            opacity: iconAnimations[index].opacity,
            filter: iconAnimations[index].filter,
            fontSize: 80,
            lineHeight: 1,
            zIndex: 5, // Above background, below text
            pointerEvents: 'none',
          }}
        >
          {icon}
        </div>
      ))}
    </>
  );
};

export const Scene01HookChallenge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const durationFrames = 120; // 4 seconds at 30fps

  // Exit animation timings
  const subTextExitStart = 90;
  const mainTextExitStart = 95;
  const iconsExitStart = 100;
  const exitDuration = 20;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0A' }}>
      <Background
        layers={[
          { type: 'solid', color: '#1A1A1A' },
          { type: 'noise', opacity: 0.05 },
          { type: 'vignette', intensity: 0.5 },
        ]}
        animated
        animationSpeed={0.5}
      />

      <AnimatedText
        text="Overwhelmed by remote work chaos?"
        preset="typewriter"
        startFrame={0}
        anchor="center"
        offsetY={-60}
        fontSize={56}
        fontWeight={600}
        color="#FFFFFF"
        exit={{
          startFrame: mainTextExitStart,
          opacity: { from: 1, to: 0, duration: exitDuration },
          blur: { from: 0, to: 12, duration: exitDuration },
        }}
      />

      <AnimatedText
        text="Tasks piling up? Deadlines slipping?"
        preset="typewriter"
        startFrame={20}
        anchor="center"
        offsetY={10}
        fontSize={32}
        color="#CCCCCC"
        exit={{
          startFrame: subTextExitStart,
          opacity: { from: 1, to: 0, duration: exitDuration },
          blur: { from: 0, to: 12, duration: exitDuration },
        }}
      />

      <ScatteredWorkIcons
        startFrame={0}
        exitStartFrame={iconsExitStart}
        exitDuration={exitDuration}
      />
    </AbsoluteFill>
  );
};
