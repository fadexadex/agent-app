import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const CONTAINER_STYLE: React.CSSProperties = {
  backgroundColor: '#1A1A1A',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const AnimatedSphere: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Sphere appearance spring starting at frame 25
  const entrance = spring({
    frame: frame - 25,
    fps,
    config: { damping: 20 },
    durationInFrames: 45,
  });

  // Continuous pulsating effect
  const pulse = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.97, 1.03]
  );

  const opacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Simultaneous exit at frame 105
  const exitScale = interpolate(frame, [105, 120], [1, 0.5], {
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(frame, [105, 120], [1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #4F46E5 0%, #7C3AED 100%)',
        boxShadow: '0 0 60px rgba(79, 70, 229, 0.4)',
        opacity: opacity * exitOpacity,
        transform: `scale(${entrance * pulse * exitScale})`,
        zIndex: 1,
      }}
    />
  );
};

export const HookProductivity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background fade in
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Main Title: "Unlock Your Potential"
  const words = ["Unlock", "Your", "Potential"];
  
  // Shared exit for all text elements
  const exitProgress = interpolate(frame, [105, 120], [1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ ...CONTAINER_STYLE, opacity: bgOpacity }}>
      {/* Background Gradient */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, #333333 0%, #1A1A1A 100%)',
        }}
      />

      {/* Main Title element */}
      <div
        style={{
          position: 'absolute',
          top: height / 2 - 140,
          textAlign: 'center',
          width: '100%',
          opacity: exitProgress,
        }}
      >
        {words.map((word, i) => {
          const wordStart = 10 + i * 6;
          const wordSpring = spring({
            frame: frame - wordStart,
            fps,
            config: { damping: 200 },
          });
          const wordY = interpolate(wordSpring, [0, 1], [20, 0]);
          const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1]);

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontSize: 84,
                fontWeight: 800,
                margin: '0 15px',
                transform: `translateY(${wordY}px)`,
                opacity: wordOpacity,
                textShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Voice Sphere element */}
      <AnimatedSphere frame={frame} fps={fps} />

      {/* Sub Title element */}
      <div
        style={{
          position: 'absolute',
          top: height / 2 + 120,
          textAlign: 'center',
          width: '100%',
          opacity: exitProgress,
        }}
      >
        {(() => {
          const subStart = 45;
          const subSpring = spring({
            frame: frame - subStart,
            fps,
            config: { damping: 200 },
          });
          const subOpacity = interpolate(subSpring, [0, 1], [0, 1]);
          const subTranslateY = interpolate(subSpring, [0, 1], [15, 0]);
          
          return (
            <div style={{ 
              fontSize: 42, 
              opacity: subOpacity, 
              transform: `translateY(${subTranslateY}px)`,
              letterSpacing: '2px',
              fontWeight: 300,
              color: 'rgba(255,255,255,0.9)'
            }}>
              With <span style={{ fontWeight: 700, color: '#A5B4FC' }}>VoiceOS</span>
            </div>
          );
        })()}
      </div>

      {/* Subtle overlay for the exit transition effect */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'black',
          opacity: interpolate(frame, [105, 120], [0, 1], { extrapolateLeft: 'clamp' }),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
