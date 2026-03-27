import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

interface Scene1HookProblemProps {}

export const Scene1HookProblem: React.FC<Scene1HookProblemProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background
  const backgroundLayers = [
    {
      type: "linear",
      colors: ["#FF6B6B", "#FFD93D"],
      angle: 135, // Diagonal angle for top-left to bottom-right
    },
  ];

  // Headline Text animation
  const headlineStartFrame = 10;

  // Icon Grid animation
  const icons = ["🛠️", "⏳", "🐛", "🔄"];
  const iconStartFrame = 40;
  const iconStagger = 8; // frames between each icon's appearance
  const iconSpringDuration = 20; // Estimate frames for spring to settle

  // Calculate total width needed for icons to center them properly
  const iconFontSize = 80;
  const iconSpacing = 30; // Space between icons
  
  return (
    <AbsoluteFill>
      <Background layers={backgroundLayers} />

      {/* Headline Text */}
      <AnimatedText
        text="Design-to-Code Handoff Headaches?"
        preset="typewriter"
        animationUnit="character"
        stagger={2} // Small stagger for typewriter speed
        startFrame={headlineStartFrame}
        anchor="center"
        offsetY={-60}
        fontSize={68}
        fontWeight={700}
        color="#FFFFFF"
        style={{
          lineHeight: 1.2,
          textAlign: 'center',
          maxWidth: width * 0.8, // Prevent text from going too wide
        }}
      />

      {/* Icon Grid */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, ${80}px)`, // Centered horizontally, 80px below center
          display: 'flex',
          gap: `${iconSpacing}px`,
        }}
      >
        {icons.map((icon, index) => {
          const delay = iconStartFrame + index * iconStagger;

          // Spring for icon entrance
          const iconVisibility = spring({
            frame: frame - delay,
            fps,
            config: { damping: 200, stiffness: 100 },
          });

          // Frame count after entrance completes (approx. when spring settles)
          const postEntranceFrame = frame - (delay + iconSpringDuration);

          // Subtle continuous scale oscillation *after* entrance
          const scaleFactor = postEntranceFrame > 0
            ? interpolate(Math.sin(postEntranceFrame / 15 + index), [-1, 1], [1, 1.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 1; // No oscillation before entrance completes

          // Subtle continuous opacity flicker *after* entrance
          const opacityFactor = postEntranceFrame > 0
            ? interpolate(Math.sin(postEntranceFrame / 10 + index * 0.5), [-1, 1], [0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            : 1; // No flicker before entrance completes
          
          // Combine entrance visibility with post-entrance animation
          const finalRenderScale = interpolate(iconVisibility, [0, 1], [0, 1], { extrapolateRight: 'clamp' }) * scaleFactor;
          const finalRenderOpacity = interpolate(iconVisibility, [0, 1], [0, 1], { extrapolateRight: 'clamp' }) * opacityFactor;

          return (
            <span
              key={icon + index}
              style={{
                fontSize: iconFontSize,
                display: 'inline-block', // Important for transform
                transform: `scale(${finalRenderScale})`,
                opacity: finalRenderOpacity,
                // Ensure icons are not visible before their entrance
                visibility: frame < delay ? 'hidden' : 'visible',
              }}
            >
              {icon}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
