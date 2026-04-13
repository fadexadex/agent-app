import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';

const { fontFamily } = loadFont();

// --- Components ---

const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle, #333333 0%, #1A1A1A 100%)',
      }}
    />
  );
};

const VoiceSphere: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance
  const entrance = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Pulsing & Morphing
  const scale = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.95, 1.05]
  ) * entrance;

  const borderRadius = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [40, 60]
  );

  return (
    <div
      style={{
        width: 200,
        height: 200,
        borderRadius: `${borderRadius}%`,
        background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
        boxShadow: '0 0 40px rgba(79, 70, 229, 0.6), 0 0 80px rgba(147, 51, 234, 0.3)',
        transform: `scale(${scale})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'blur(1px)',
      }}
    />
  );
};

const WordReveal: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {words.map((word, i) => {
        const wordDelay = startFrame + i * 5;
        const opacity = spring({
          frame: frame - wordDelay,
          fps,
          config: { damping: 200 },
        });
        const translateY = interpolate(opacity, [0, 1], [20, 0]);

        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              display: 'inline-block',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// --- Main Scene ---

export const HookProductivity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Global Exit Animation (last 15 frames)
  const exitStart = durationInFrames - 15;
  const exitProgress = spring({
    frame: frame - exitStart,
    fps,
    config: { damping: 200 },
  });
  
  const globalOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const globalScale = interpolate(exitProgress, [0, 1], [1, 0.95]);

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#1A1A1A', 
      fontFamily, 
      color: 'white',
      opacity: globalOpacity,
      transform: `scale(${globalScale})`,
    }}>
      <Background />

      {/* Voice Sphere in the center */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <VoiceSphere />
      </AbsoluteFill>

      {/* Main Title - Above Sphere */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center',
        top: -140 // Offset to be above sphere
      }}>
        <div style={{ 
          fontSize: '64px', 
          fontWeight: '900',
          textAlign: 'center',
          letterSpacing: '-1px'
        }}>
          <WordReveal text="Unlock Your Potential" startFrame={10} />
        </div>
      </AbsoluteFill>

      {/* Sub Title - Below Sphere */}
      <AbsoluteFill style={{ 
        justifyContent: 'center', 
        alignItems: 'center',
        top: 140 // Offset to be below sphere
      }}>
        <div style={{ 
          fontSize: '32px', 
          fontWeight: '400',
          color: 'rgba(255,255,255,0.8)'
        }}>
          <Sequence from={40} layout="none">
            <div style={{ display: 'flex', gap: '8px' }}>
              <span>With</span>
              <span style={{ 
                color: '#818CF8', 
                fontWeight: '700',
                textShadow: '0 0 20px rgba(129, 140, 248, 0.4)'
              }}>
                VoiceOS
              </span>
            </div>
          </Sequence>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
