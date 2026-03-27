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

const COLORS = {
  background: '#09090B',
  primary: '#3B82F6',
  accent: '#10B981',
  text: '#F3F4F6',
  card: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.1)',
};

export const GrowthInfo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Entrance animations
  const bgOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  
  const headerSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });
  const headerY = interpolate(headerSpring, [0, 1], [20, 0]);

  // Growth Data
  const growthPoints = [
    { label: 'User Acquisition', value: '+124%', delay: 20 },
    { label: 'Retention Rate', value: '89.2%', delay: 25 },
    { label: 'Market Share', value: '12.5k', delay: 30 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.text,
        fontFamily,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: bgOpacity,
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${COLORS.primary}22 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
        }}
      />

      <div style={{ width: '80%', zContext: 1 }}>
        {/* Header */}
        <div
          style={{
            transform: `translateY(${headerY}px)`,
            opacity: headerSpring,
            marginBottom: 60,
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 400, color: COLORS.primary, margin: 0, letterSpacing: 2 }}>
            GROWTH STRATEGY
          </h2>
          <h1 style={{ fontSize: 64, fontWeight: 700, margin: '10px 0' }}>
            Scaling Intelligence
          </h1>
        </div>

        {/* Growth Cards */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-between' }}>
          {growthPoints.map((point, i) => {
            const cardSpring = spring({
              frame: frame - point.delay,
              fps,
              config: { damping: 20, stiffness: 100 },
            });
            const cardY = interpolate(cardSpring, [0, 1], [40, 0]);

            return (
              <div
                key={point.label}
                style={{
                  flex: 1,
                  padding: 30,
                  backgroundColor: COLORS.card,
                  borderRadius: 24,
                  border: `1px solid ${COLORS.border}`,
                  backdropFilter: 'blur(10px)',
                  transform: `translateY(${cardY}px)`,
                  opacity: cardSpring,
                }}
              >
                <div style={{ fontSize: 18, color: COLORS.text + '88', marginBottom: 10 }}>
                  {point.label}
                </div>
                <div style={{ fontSize: 42, fontWeight: 800, color: COLORS.accent }}>
                  {point.value}
                </div>
                
                {/* Mini Graph Decoration */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginTop: 20, height: 40 }}>
                  {[0, 1, 2, 3, 4, 5].map((bar) => {
                    const barGrow = spring({
                      frame: frame - point.delay - (bar * 2),
                      fps,
                      config: { damping: 100 },
                    });
                    const h = interpolate(barGrow, [0, 1], [4, 15 + (bar * 4)]);
                    return (
                      <div
                        key={bar}
                        style={{
                          width: 8,
                          height: `${h}px`,
                          backgroundColor: COLORS.accent,
                          borderRadius: 2,
                          opacity: 0.6,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exit Animation Overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: COLORS.background,
          opacity: interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: 'clamp' }),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
