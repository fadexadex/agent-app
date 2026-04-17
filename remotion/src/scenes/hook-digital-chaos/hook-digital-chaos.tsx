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

// --- Components ---

const ChaosSphere: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const icons = ['✉️', '💬', '📅', '📄', '📁', '🔔', '📧', '📎'];
  const count = 24;

  const entrance = spring({
    frame: frame - 15,
    fps,
    config: { damping: 200 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '60%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${entrance})`,
        width: 400,
        height: 400,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {new Array(count).fill(0).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + (frame * 0.02);
        const radius = 120 + Math.sin(frame * 0.05 + i) * 30;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const glitchX = Math.random() > 0.95 ? (Math.random() - 0.5) * 10 : 0;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              fontSize: 40,
              opacity: 0.6,
              transform: `translate(${x + glitchX}px, ${y}px) rotate(${frame * (i % 2 === 0 ? 1 : -1)}deg)`,
              filter: 'grayscale(0.5) blur(1px)',
            }}
          >
            {icons[i % icons.length]}
          </div>
        );
      })}
    </div>
  );
};

const GlitchOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Periodic glitch every 45 frames
  const isGlitching = (frame % 45) > 40;
  if (!isGlitching) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: Math.random() * 100 + '%',
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: Math.random() * 100 + '%',
          width: 1,
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />
    </AbsoluteFill>
  );
};

export const DigitalChaosHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Entrance animations
  const textEntrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });

  // Typewriter effect
  const text = "Tired of the Digital Chaos?";
  const charCount = Math.floor(
    interpolate(frame, [10, 45], [0, text.length], {
      extrapolateRight: 'clamp',
    })
  );
  const displayText = text.slice(0, charCount);

  // Exit animations (staggered)
  const exitFrame = 85;
  const exitText = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  
  const exitSphere = spring({
    frame: frame - (exitFrame + 3),
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1A1A1A',
        background: 'radial-gradient(circle, #333333 0%, #1A1A1A 100%)',
        fontFamily,
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Elements */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          width: '100%',
          textAlign: 'center',
          fontSize: 72,
          fontWeight: 800,
          transform: `translateY(${-80}px) scale(${textEntrance - exitText})`,
          opacity: interpolate(textEntrance - exitText, [0, 1], [0, 1]),
          textShadow: '0 0 20px rgba(255,255,255,0.2)',
        }}
      >
        {displayText}
      </div>

      <div style={{ opacity: 1 - exitSphere }}>
        <ChaosSphere />
      </div>

      <GlitchOverlay />

      {/* Swipe Transition Overlay (End) */}
      {frame > 85 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            transform: `translateX(${interpolate(
              frame,
              [85, 105],
              [width, 0],
              { extrapolateRight: 'clamp' }
            )}px)`,
            zIndex: 100,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
