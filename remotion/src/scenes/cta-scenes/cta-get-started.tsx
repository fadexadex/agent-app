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

const Background: React.FC<{ color: string }> = ({ color }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        zIndex: -1,
      }}
    />
  );
};

const ButtonCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const exit = spring({
    frame: frame - 103,
    fps,
    config: { damping: 200 },
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]) - exit * 0.1;
  const opacity = entrance - exit;
  const translateY = interpolate(entrance, [0, 1], [50, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        backgroundColor: 'white',
        padding: '40px 80px',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          color: '#1A73E8',
          fontSize: '48px',
          fontWeight: 800,
          fontFamily,
        }}
      >
        Start Your Free Trial
      </span>
      <span
        style={{
          color: '#5F6368',
          fontSize: '24px',
          fontWeight: 500,
          fontFamily,
        }}
      >
        No credit card required.
      </span>
    </div>
  );
};

export const CTAGetStarted: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Scene level fade in/out
  const sceneOpacity = interpolate(
    frame,
    [0, 15, 105, 120],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  // Main text reveal (Word by word)
  const mainText = "Ready to transform your workflow?";
  const words = mainText.split(' ');
  
  const renderMainText = () => {
    return words.map((word, i) => {
      const wordStart = 10 + i * 5;
      const wordSpring = spring({
        frame: frame - wordStart,
        fps,
        config: { damping: 200 },
      });
      
      const wordExit = spring({
        frame: frame - 100,
        fps,
        config: { damping: 200 },
      });

      const opacity = wordSpring - wordExit;
      const translateY = interpolate(wordSpring, [0, 1], [20, 0]);

      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity,
            transform: `translateY(${translateY}px)`,
            marginRight: '15px',
          }}
        >
          {word}
        </span>
      );
    });
  };

  // URL Reveal
  const urlText = "testing212.com";
  const urlProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 },
  });
  const urlExit = spring({
    frame: frame - 106,
    fps,
    config: { damping: 200 },
  });
  const urlOpacity = urlProgress - urlExit;

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#6DD5ED', 
      fontFamily, 
      opacity: sceneOpacity,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      <Background color="#6DD5ED" />
      
      {/* Main Headline */}
      <div style={{
        position: 'absolute',
        top: '25%',
        width: '100%',
        textAlign: 'center',
        fontSize: '80px',
        fontWeight: 900,
        color: 'white',
        padding: '0 100px',
        lineHeight: 1.1,
      }}>
        {renderMainText()}
      </div>

      {/* CTA Button Mockup */}
      <ButtonCard frame={frame} fps={fps} />

      {/* Website URL */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        fontSize: '32px',
        fontWeight: 600,
        color: 'rgba(255, 255, 255, 0.9)',
        opacity: urlOpacity,
        letterSpacing: '1px',
      }}>
        {urlText}
      </div>
    </AbsoluteFill>
  );
};
