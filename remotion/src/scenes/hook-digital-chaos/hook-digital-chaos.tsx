import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

const ChaosToOrderVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const icons = ['📱', '✉️', '💬', '🔔', '📁', '📊', '🔗', '☁️'];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {icons.map((icon, i) => {
        const startDelay = i * 2;
        const progress = spring({
          frame: frame - startDelay,
          fps,
          config: { damping: 100 },
        });

        // Scatter logic
        const initialX = Math.cos(i * 45) * 400;
        const initialY = Math.sin(i * 45) * 400;

        // Convergence logic starting at frame 60
        const convergeProgress = spring({
          frame: frame - 60 - startDelay,
          fps,
          config: { damping: 20 },
        });

        const x = interpolate(convergeProgress, [0, 1], [initialX, 0]);
        const y = interpolate(convergeProgress, [0, 1], [initialY, 0]);
        const opacity = interpolate(progress, [0, 0.2], [0, 0.6], { extrapolateRight: 'clamp' });
        const finalOpacity = interpolate(convergeProgress, [0, 1], [0.6, 0]);
        const scale = interpolate(progress, [0, 1], [0.5, 1.2]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              fontSize: 60,
              transform: `translate(${x}px, ${y}px) scale(${scale})`,
              opacity: opacity * (1 - finalOpacity),
              filter: 'blur(2px)',
            }}
          >
            {icon}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const HookDigitalChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Main Question Animation
  const mainText = "Drowning in Digital Noise?";
  const mainCharCount = Math.floor(
    interpolate(frame - 10, [0, 30], [0, mainText.length], {
      extrapolateRight: 'clamp',
    })
  );

  // Sub Question Animation
  const subText = "There's a better way to connect.";
  const subCharCount = Math.floor(
    interpolate(frame - 50, [0, 30], [0, subText.length], {
      extrapolateRight: 'clamp',
    })
  );

  // Exit animations (starting at frame 100 with 3-frame stagger)
  const exitMain = spring({
    frame: frame - 100,
    fps,
    config: { damping: 200 },
  });
  const exitSub = spring({
    frame: frame - 103,
    fps,
    config: { damping: 200 },
  });

  // Scene-wide fade-out transition
  const sceneFade = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#F5F5F5', opacity: sceneFade, fontFamily }}>
      <ChaosToOrderVisual />

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {/* Main Question */}
        <div
          style={{
            transform: `translateY(-40px) scale(${1 - exitMain * 0.1})`,
            opacity: 1 - exitMain,
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          <h1
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: '#1A1A1A',
              margin: 0,
              letterSpacing: '-2px',
            }}
          >
            {mainText.slice(0, mainCharCount)}
          </h1>
        </div>

        {/* Sub Question */}
        <div
          style={{
            transform: `translateY(60px) scale(${1 - exitSub * 0.1})`,
            opacity: 1 - exitSub,
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          <p
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: '#666',
              margin: 0,
            }}
          >
            {subText.slice(0, subCharCount)}
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
