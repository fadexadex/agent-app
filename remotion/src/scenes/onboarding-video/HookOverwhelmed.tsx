import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

// Define the spring configs for reusability
const bouncySpringConfig = { damping: 8 };

export const HookOverwhelmed: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Icon grid configuration
  const iconsConfig = [
    { icon: '📚', delay: 0, xOffset: -180, yOffset: -80, animX: -10, animY: -10, size: 70 },
    { icon: '💻', delay: 5, xOffset: 120, yOffset: 50, animX: 10, animY: 5, size: 75 },
    { icon: '⏰', delay: 10, xOffset: -60, yOffset: 120, animX: -5, animY: -15, size: 65 },
    { icon: '☕', delay: 15, xOffset: 180, yOffset: -30, animX: 15, animY: -5, size: 60 },
    { icon: '📅', delay: 20, xOffset: -220, yOffset: 20, animX: -10, animY: 10, size: 70 },
    { icon: '📱', delay: 25, xOffset: 0, yOffset: -150, animX: 5, animY: -10, size: 80 },
  ];

  const centerY = height / 2 + 80; // base y position for icon grid
  const centerX = width / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: '#282C34' }}>
      <Background layers={[{ type: 'solid', color: '#282C34' }]} />

      {/* Hook Title */}
      <AnimatedText
        text="Are you feeling overwhelmed by your studies?"
        preset="slideInDown"
        animationUnit="word"
        stagger={3}
        startFrame={0}
        anchor="center"
        offsetY={-60}
        fontSize={64}
        fontWeight={700}
        color="#FFFFFF"
        exit={{
          startFrame: 90,
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 10, duration: 15 },
        }}
      />

      {/* Student Life Icons */}
      {iconsConfig.map((icon, index) => {
        // Icon entry animation: start at frame 20, duration 40, bouncy spring
        const iconEntryProgress = spring({
          frame: frame - (20 + icon.delay), // Global start 20, plus individual delay
          fps,
          config: bouncySpringConfig,
        });

        const iconScale = interpolate(iconEntryProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
        const iconTranslateX = interpolate(iconEntryProgress, [0, 1], [icon.xOffset * 0.5, icon.xOffset + icon.animX], { extrapolateRight: 'clamp' });
        const iconTranslateY = interpolate(iconEntryProgress, [0, 1], [icon.yOffset * 0.5, icon.yOffset + icon.animY], { extrapolateRight: 'clamp' });

        // Icon exit animation: start at frame 95, duration 10, with slight stagger
        const iconExitOpacity = interpolate(frame, [95 + icon.delay * 0.2, 95 + 10 + icon.delay * 0.2], [1, 0], { extrapolateRight: 'clamp' });
        const iconExitBlur = interpolate(frame, [95 + icon.delay * 0.2, 95 + 10 + icon.delay * 0.2], [0, 8], { extrapolateRight: 'clamp' });

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: centerY,
              left: centerX,
              transform: `translate(-50%, -50%) translate(${iconTranslateX}px, ${iconTranslateY}px) scale(${iconScale})`,
              opacity: iconExitOpacity,
              filter: `blur(${iconExitBlur}px)`,
              fontSize: icon.size,
              color: '#FFF',
              lineHeight: 1, // Prevent extra spacing
              zIndex: 1, // Ensure icons are above background
            }}
          >
            {icon.icon}
          </div>
        );
      })}

      {/* Hook Subtitle */}
      <AnimatedText
        text="Juggling deadlines, lectures, and a social life?"
        preset="scaleUp" // For "Fade in with a slight scale up."
        startFrame={40}
        anchor="center"
        offsetY={160}
        fontSize={32}
        fontWeight={400} // Removed fontStyle as AnimatedText doesn't support it directly
        color="#FFFFFF"
        exit={{
          startFrame: 100,
          opacity: { from: 1, to: 0, duration: 10 },
        }}
      />
    </AbsoluteFill>
  );
};