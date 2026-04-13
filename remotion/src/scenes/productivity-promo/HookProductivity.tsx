import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

const CONTAINER_STYLE: React.CSSProperties = {
  backgroundColor: '#1A1A1A',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  fontFamily,
};

const VoiceSphere: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 25,
    fps,
    config: { damping: 200 },
  });

  const pulse = Math.sin(frame / 10) * 0.1 + 1;
  const opacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });
  const scale = entrance * pulse;

  return (
    <div
      style={{
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(64, 150, 255, 0.8) 0%, rgba(135, 90, 255, 0.4) 100%)',
        boxShadow: '0 0 40px rgba(64, 150, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        opacity,
        transform: `scale(${scale})`,
        position: 'absolute',
        zIndex: 1,
      }}
    />
  );
};

const WordReveal: React.FC<{ text: string; startFrame: number; yOffset: number; fontSize: number; fontWeight: string }> = ({ 
  text, 
  startFrame, 
  yOffset, 
  fontSize, 
  fontWeight 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <div style={{ 
      position: 'absolute', 
      transform: `translateY(${yOffset}px)`, 
      display: 'flex', 
      gap: '12px',
      zIndex: 2 
    }}>
      {words.map((word, i) => {
        const wordStart = startFrame + i * 5;
        const opacity = interpolate(frame, [wordStart, wordStart + 15], [0, 1], {
          extrapolateRight: 'clamp',
        });
        const translateY = interpolate(frame, [wordStart, wordStart + 15], [20, 0], {
          easing: Easing.out(Easing.quad),
          extrapolateRight: 'clamp',
        });

        return (
          <span
            key={i}
            style={{
              fontSize,
              fontWeight,
              opacity,
              transform: `translateY(${translateY}px)`,
              display: 'inline-block',
              textShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {word === 'VoiceOS' ? (
              <span style={{ color: '#4096ff' }}>{word}</span>
            ) : (
              word
            )}
          </span>
        );
      })}
    </div>
  );
};

export const HookProductivity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Entrance/Exit Animations
  const exitFrame = 105;
  const globalExit = interpolate(frame, [exitFrame, exitFrame + 15], [1, 0], {
    extrapolateRight: 'clamp',
  });
  const globalScaleExit = interpolate(frame, [exitFrame, exitFrame + 15], [1, 0.9], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ 
      ...CONTAINER_STYLE, 
      opacity: globalExit,
      transform: `scale(${globalScaleExit})`,
      background: `radial-gradient(circle at center, #333333 0%, #1A1A1A 100%)`
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at center, rgba(64, 150, 255, 0.05) 0%, transparent 70%)',
      }} />

      {/* Main Title */}
      <WordReveal 
        text="Unlock Your Potential" 
        startFrame={10} 
        yOffset={-140} 
        fontSize={72} 
        fontWeight="800" 
      />

      {/* AI Sphere */}
      <VoiceSphere frame={frame} fps={fps} />

      {/* Sub Title */}
      <WordReveal 
        text="With VoiceOS" 
        startFrame={40} 
        yOffset={140} 
        fontSize={36} 
        fontWeight="400" 
      />

      {/* Overlay Fade for Scene Transition */}
      <AbsoluteFill style={{
        backgroundColor: 'black',
        opacity: interpolate(frame, [0, 15], [1, 0], { extrapolateRight: 'clamp' }),
        pointerEvents: 'none',
      }} />
    </AbsoluteFill>
  );
};