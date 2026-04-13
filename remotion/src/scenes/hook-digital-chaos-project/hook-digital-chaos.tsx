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

  const icons = ['📱', '✉️', '💬', '🔔', '📅', '📂', '📷', '🌐'];

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {icons.map((icon, i) => {
        const angle = (i / icons.length) * Math.PI * 2;
        const startDelay = i * 2;
        
        // Initial spread (chaos)
        const entrance = spring({
          frame: frame - startDelay,
          fps,
          config: { damping: 20, stiffness: 100 },
        });

        // Convergence to order (happens around frame 60)
        const convergence = spring({
          frame: frame - 60 - i * 2,
          fps,
          config: { damping: 200 },
        });

        const radius = interpolate(convergence, [0, 1], [300, 40]);
        const opacity = interpolate(entrance, [0, 1], [0, 0.6]);
        const scale = interpolate(entrance, [0, 1], [0, 1]) * interpolate(convergence, [0, 1], [1, 0.8]);
        
        const x = Math.cos(angle + frame * 0.02) * radius;
        const y = Math.sin(angle + frame * 0.02) * radius;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              fontSize: 40,
              opacity,
              transform: `translate(${x}px, ${y}px) scale(${scale})`,
              filter: `blur(${interpolate(convergence, [0, 1], [2, 0])}px)`,
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
  const { fps, width, height } = useVideoConfig();

  // Entrance animations
  const mainTextStart = 10;
  const subTextStart = 50;

  const mainSpring = spring({
    frame: frame - mainTextStart,
    fps,
    config: { damping: 200 },
  });

  const subSpring = spring({
    frame: frame - subTextStart,
    fps,
    config: { damping: 200 },
  });

  // Exit animations (staggered by 3 frames)
  const exitStart = 105;
  const mainExit = spring({ frame: frame - exitStart, fps, config: { damping: 200 } });
  const subExit = spring({ frame: frame - (exitStart + 3), fps, config: { damping: 200 } });
  const chaosExit = spring({ frame: frame - (exitStart + 6), fps, config: { damping: 200 } });

  // Fade transition (final 15 frames)
  const sceneFade = interpolate(frame, [105, 120], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#F5F5F5', fontFamily }}>
      <AbsoluteFill style={{ opacity: 1 - chaosExit }}>
        <ChaosToOrderVisual />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
          top: height / 2 - 40,
          fontSize: 80,
          fontWeight: 800,
          color: '#09090B',
          opacity: mainSpring - mainExit,
          transform: `translateY(${interpolate(mainSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        Drowning in Digital Noise?
      </div>

      <div
        style={{
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
          top: height / 2 + 60,
          fontSize: 40,
          fontWeight: 500,
          color: '#4B5563',
          opacity: subSpring - subExit,
          transform: `translateY(${interpolate(subSpring, [0, 1], [15, 0])}px)`,
        }}
      >
        There's a better way to connect.
      </div>

      {/* Global Scene Transition */}
      <AbsoluteFill 
        style={{ 
          backgroundColor: '#F5F5F5', 
          opacity: 1 - sceneFade,
          pointerEvents: 'none'
        }} 
      />
    </AbsoluteFill>
  );
};
