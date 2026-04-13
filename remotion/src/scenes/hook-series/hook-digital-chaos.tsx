import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

const ChaosToOrderVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Define 12 "chaos" elements (rectangles representing windows/icons)
  const elements = Array.from({ length: 12 }).map((_, i) => {
    const seed = i * 133.7;
    // Chaotic starting positions
    const startX = (Math.sin(seed) * 300);
    const startY = (Math.cos(seed * 0.8) * 200);
    const startRotate = Math.sin(seed * 1.2) * 45;

    // Ordered ending positions (a small grid)
    const endX = (i % 4 - 1.5) * 60;
    const endY = (Math.floor(i / 4) - 1) * 60;
    const endRotate = 0;

    // Progression from chaos to order
    const moveProgress = spring({
      frame: frame - 40,
      fps,
      config: { damping: 200 },
    });

    const x = interpolate(moveProgress, [0, 1], [startX, endX]);
    const y = interpolate(moveProgress, [0, 1], [startY, endY]);
    const rotate = interpolate(moveProgress, [0, 1], [startRotate, endRotate]);
    const opacity = interpolate(frame, [0, 20, 100, 115], [0, 0.4, 0.4, 0]);
    const scale = interpolate(moveProgress, [0, 1], [0.8, 1]);

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 50,
          height: 50,
          backgroundColor: '#000',
          borderRadius: 12,
          opacity,
          transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      />
    );
  });

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {elements}
    </div>
  );
};

export const HookDigitalChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Entrance animations
  const mainTextSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });

  const subTextSpring = spring({
    frame: frame - 50,
    fps,
    config: { damping: 200 },
  });

  // Exit animations (staggered by 3 frames)
  const exitMain = spring({
    frame: frame - 105,
    fps,
    config: { damping: 200 },
  });
  const exitVisual = spring({
    frame: frame - 108,
    fps,
    config: { damping: 200 },
  });
  const exitSub = spring({
    frame: frame - 111,
    fps,
    config: { damping: 200 },
  });

  const mainOpacity = interpolate(mainTextSpring - exitMain, [0, 1], [0, 1]);
  const mainTranslateY = interpolate(mainTextSpring - exitMain, [0, 1], [20, 0]);

  const subOpacity = interpolate(subTextSpring - exitSub, [0, 1], [0, 1]);
  const subTranslateY = interpolate(subTextSpring - exitSub, [0, 1], [10, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#F5F5F5', fontFamily }}>
      {/* Visual background chaos element */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ opacity: 1 - exitVisual }}>
          <ChaosToOrderVisual />
        </div>
      </AbsoluteFill>

      {/* Main Question */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          top: height / 2 - 40,
          textAlign: 'center',
          opacity: mainOpacity,
          transform: `translateY(${mainTranslateY}px)`,
          padding: '0 40px',
        }}
      >
        <h1
          style={{
            fontSize: 84,
            fontWeight: 800,
            color: '#111',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Drowning in Digital Noise?
        </h1>
      </div>

      {/* Sub Question */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          top: height / 2 + 100,
          textAlign: 'center',
          opacity: subOpacity,
          transform: `translateY(${subTranslateY}px)`,
          padding: '0 40px',
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: '#666',
            margin: 0,
          }}
        >
          There's a better way to connect.
        </p>
      </div>
      
      {/* Global Transition Overlay (Fade) */}
      <AbsoluteFill 
        style={{ 
          backgroundColor: 'white', 
          opacity: interpolate(frame, [105, 120], [0, 1], { extrapolateLeft: 'clamp' }),
          pointerEvents: 'none'
        }} 
      />
    </AbsoluteFill>
  );
};
