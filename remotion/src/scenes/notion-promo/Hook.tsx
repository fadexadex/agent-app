import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, interpolateColors, Sequence } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

const WordReveal: React.FC<{ text: string; startFrame: number; style?: React.CSSProperties }> = ({ text, startFrame, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4em', justifyContent: 'center', ...style }}>
      {words.map((word, i) => {
        const delay = startFrame + i * 5; // 5 frame stagger
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 200 } // smooth reveal
        });

        const translateY = interpolate(progress, [0, 1], [40, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        return (
          <div key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
            <div style={{ transform: `translateY(${translateY}px)`, opacity }}>
              {word}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit animation at frame 75 (15 frames before end of 3s)
  const exitProgress = spring({
    frame: frame - 75,
    fps,
    config: { damping: 200 }
  });

  const exitTranslateY = interpolate(exitProgress, [0, 1], [0, -60]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#F7F7F5', fontFamily, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', transform: `translateY(${exitTranslateY}px)`, opacity: exitOpacity }}>
        <WordReveal 
          text="Your wiki, docs, & projects." 
          startFrame={15} 
          style={{ 
            fontSize: '64px', 
            fontWeight: 600, 
            color: '#37352F', 
            letterSpacing: '-0.02em',
            marginBottom: '24px'
          }} 
        />
        <WordReveal 
          text="Together at last." 
          startFrame={45} 
          style={{ 
            fontSize: '48px', 
            fontWeight: 400, 
            color: '#9CA3AF', // Lighter gray
            letterSpacing: '-0.01em'
          }} 
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
