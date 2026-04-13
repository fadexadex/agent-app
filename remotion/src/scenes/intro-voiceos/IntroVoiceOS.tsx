import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

const VoiceIndicatorPill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - 60,
    fps,
    config: { damping: 12 },
  });

  const exit = spring({
    frame: frame - 105,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(frame, [60, 70, 105, 115], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  const scale = entrance - exit;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        width: 180,
        height: 50,
        backgroundColor: '#2C3E50',
        borderRadius: 25,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      }}
    >
      {/* Mic Icon Placeholder */}
      <div
        style={{
          width: 12,
          height: 20,
          borderRadius: 6,
          border: '2px solid white',
          position: 'relative',
          marginRight: 15,
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 2,
            background: 'white',
          }}
        />
      </div>

      {/* Animated Bars */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2, 3].map((i) => {
          const barHeight = interpolate(
            Math.sin(frame * 0.2 + i * 1.5),
            [-1, 1],
            [8, 24]
          );
          return (
            <div
              key={i}
              style={{
                width: 4,
                height: barHeight,
                backgroundColor: 'white',
                borderRadius: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const AnimatedText: React.FC<{ text: string; startFrame: number; exitFrame: number }> = ({
  text,
  startFrame,
  exitFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(' ');

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      {words.map((word, i) => {
        const wordStart = startFrame + i * 3;
        const opacity = interpolate(
          frame,
          [wordStart, wordStart + 10, exitFrame, exitFrame + 10],
          [0, 1, 1, 0],
          { extrapolateRight: 'clamp' }
        );
        const translateY = interpolate(
          frame,
          [wordStart, wordStart + 10],
          [10, 0],
          { extrapolateRight: 'clamp' }
        );

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.25em',
              opacity,
              transform: `translateY(${translateY}px)`,
              color: '#7F8C8D',
              fontSize: 48,
              fontFamily,
              fontWeight: 400,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const IntroVoiceOS: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Logo Animation
  const logoEntrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  
  const logoExit = spring({
    frame: frame - 100,
    fps,
    config: { damping: 200 },
  });

  const logoOpacity = interpolate(frame, [0, 15, 100, 115], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF', alignItems: 'center', fontFamily }}>
      {/* Logo Section */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          opacity: logoOpacity,
          transform: `translateY(${interpolate(logoEntrance, [0, 1], [-20, 0])}px)`,
          fontSize: 96,
          fontWeight: 800,
          color: '#2C3E50',
          letterSpacing: '-2px',
        }}
      >
        VoiceOS
      </div>

      {/* Tagline Section */}
      <div style={{ position: 'absolute', top: 250, width: '100%', textAlign: 'center' }}>
        <AnimatedText 
          text="Your AI Assistant for Every Task" 
          startFrame={30} 
          exitFrame={103}
        />
      </div>

      {/* Mic Indicator Section */}
      <div style={{ position: 'absolute', bottom: 150 }}>
        <VoiceIndicatorPill />
      </div>

      {/* Subtle background element */}
      <div 
        style={{
          position: 'absolute',
          bottom: -100,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(44, 62, 80, 0.03) 0%, rgba(255, 255, 255, 0) 70%)',
          zIndex: -1,
        }}
      />
    </AbsoluteFill>
  );
};
