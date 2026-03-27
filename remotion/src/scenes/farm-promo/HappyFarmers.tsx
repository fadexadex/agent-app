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

export const HappyFarmers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background fade and subtle scale
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const bgScale = interpolate(frame, [0, 120], [1.05, 1], { extrapolateRight: 'clamp' });

  // Main title animation (word by word)
  const titleWords = ["Happy", "Customers,", "Happy", "Farmers."];
  
  // Animation for the "vibe" orbs
  const renderOrb = (index: number, color: string, size: number, x: number, y: number) => {
    const orbit = (frame / fps) * 0.5 + index;
    const offsetX = Math.cos(orbit) * 30;
    const offsetY = Math.sin(orbit) * 30;
    const scale = spring({
      frame: frame - index * 10,
      fps,
      config: { damping: 100 },
    });

    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.4 * bgOpacity,
          left: x + offsetX,
          top: y + offsetY,
          transform: `scale(${scale})`,
        }}
      />
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#09090B', fontFamily, overflow: 'hidden' }}>
      {/* Cinematic Background Orbs */}
      {renderOrb(0, '#22C55E', 400, width * 0.1, height * 0.2)}
      {renderOrb(1, '#10B981', 500, width * 0.6, height * 0.5)}
      {renderOrb(2, '#34D399', 300, width * 0.3, height * 0.7)}

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 100px',
        zIndex: 10,
        transform: `scale(${bgScale})`,
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px',
        }}>
          {titleWords.map((word, i) => {
            const wordSpring = spring({
              frame: frame - (20 + i * 8),
              fps,
              config: { damping: 20, stiffness: 100 },
            });

            const translateY = interpolate(wordSpring, [0, 1], [40, 0]);
            const opacity = interpolate(wordSpring, [0, 1], [0, 1]);
            const blur = interpolate(wordSpring, [0, 1], [10, 0]);

            return (
              <div
                key={i}
                style={{
                  fontSize: '110px',
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.04em',
                  opacity,
                  transform: `translateY(${translateY}px)`,
                  filter: `blur(${blur}px)`,
                  textShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
              >
                {word}
              </div>
            );
          })}
        </div>

        {/* Decorative Divider Line */}
        <div style={{
          marginTop: '40px',
          height: '2px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          width: interpolate(frame, [40, 80], [0, 300], { extrapolateRight: 'clamp' }),
          borderRadius: '1px',
        }} />

        {/* Subtext Reveal */}
        <div style={{
          marginTop: '40px',
          fontSize: '28px',
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 400,
          opacity: interpolate(frame, [70, 100], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateY(${interpolate(frame, [70, 100], [20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}>
          Connecting the table to the source.
        </div>
      </div>

      {/* Glassmorphism Border Overlay */}
      <AbsoluteFill style={{
        border: '20px solid rgba(255,255,255,0.03)',
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};
