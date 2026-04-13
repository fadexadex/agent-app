import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// --- Components ---

const BenefitIcons: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  // Entrance animation for icons
  const entrance = spring({
    frame: frame - 70,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const yOffset = interpolate(entrance, [0, 1], [20, 0]);

  // Floating animation
  const float = Math.sin(frame / 15) * 5;

  return (
    <div style={{
      display: 'flex',
      gap: '60px',
      opacity,
      transform: `scale(${scale}) translateY(${yOffset + float}px)`,
      marginTop: '120px',
    }}>
      {/* Clock Icon */}
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      
      {/* Meditating/Stress-free Icon */}
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
        <path d="M12 3v2" />
        <path d="M12 19v2" />
        <path d="M3 12h2" />
        <path d="M19 12h2" />
        <path d="m5.8 5.8 1.4 1.4" />
        <path d="m16.8 16.8 1.4 1.4" />
        <path d="m5.8 18.2 1.4-1.4" />
        <path d="m16.8 7.2 1.4-1.4" />
      </svg>
    </div>
  );
};

export const BenefitTimeStress: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Global Entrance/Exit
  const sceneEntrance = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const sceneExit = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], { extrapolateRight: 'clamp' });

  // Headline Animation (Word-by-word reveal)
  const headlineStart = 10;
  const headlineWords = "Reclaim Your Day".split(" ");
  
  // Tagline Animation
  const taglineStart = 40;
  const taglineText = "VoiceOS handles the mundane, so you focus on what matters.";

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#007AFF',
      background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
      fontFamily,
      color: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      opacity: sceneEntrance * sceneExit,
    }}>
      {/* Headline */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        transform: `translateY(-60px)`,
      }}>
        {headlineWords.map((word, i) => {
          const wordSpring = spring({
            frame: frame - (headlineStart + i * 5),
            fps,
            config: { damping: 200 },
          });
          const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1]);
          const wordY = interpolate(wordSpring, [0, 1], [20, 0]);

          return (
            <span key={i} style={{ 
              display: 'inline-block', 
              fontSize: '80px', 
              fontWeight: 800, 
              marginRight: '20px',
              opacity: wordOpacity,
              transform: `translateY(${wordY}px)`,
            }}>
              {word}
            </span>
          );
        })}
      </div>

      {/* Tagline */}
      <div style={{
        maxWidth: '800px',
        textAlign: 'center',
        fontSize: '32px',
        fontWeight: 400,
        lineHeight: 1.4,
        transform: `translateY(20px)`,
      }}>
        {taglineText.split(" ").map((word, i) => {
          const wordSpring = spring({
            frame: frame - (taglineStart + i * 3),
            fps,
            config: { damping: 200 },
          });
          const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1]);
          
          return (
            <span key={i} style={{ 
              display: 'inline-block', 
              marginRight: '8px',
              opacity: wordOpacity,
            }}>
              {word}
            </span>
          );
        })}
      </div>

      {/* Icons */}
      <BenefitIcons frame={frame} />

      {/* Subtle Background Glow */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: -1,
      }} />
    </AbsoluteFill>
  );
};
