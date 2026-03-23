import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

export const TheProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations for scattered problem cards
  const card1Spring = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const card2Spring = spring({ frame: frame - 35, fps, config: { damping: 14 } });
  const card3Spring = spring({ frame: frame - 50, fps, config: { damping: 12 } });

  // Interpret floating positions to create a chaotic, scattered look
  const card1Rot = interpolate(card1Spring, [0, 1], [-45, -12]);
  const card2Rot = interpolate(card2Spring, [0, 1], [45, 18]);
  const card3Rot = interpolate(card3Spring, [0, 1], [0, -6]);

  const card1Y = interpolate(card1Spring, [0, 1], [200, -60]);
  const card2Y = interpolate(card2Spring, [0, 1], [200, 20]);
  const card3Y = interpolate(card3Spring, [0, 1], [200, 80]);

  // Shared base style for the problem cards
  const cardBaseStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    backgroundColor: 'rgba(20, 10, 15, 0.75)',
    border: '2px solid rgba(239, 68, 68, 0.3)',
    padding: '30px 48px',
    borderRadius: '16px',
    color: '#f87171',
    fontSize: 36,
    fontWeight: 700,
    boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(239, 68, 68, 0.1)',
    backdropFilter: 'blur(12px)',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  return (
    <AbsoluteFill>
      <Background 
        layers={[
          { type: 'solid', color: '#09090b' },
          { type: 'glow', color: '#ef4444', x: 20, y: 30, radius: 70, intensity: 0.15 },
          { type: 'glow', color: '#991b1b', x: 80, y: 70, radius: 60, intensity: 0.2 },
          { type: 'noise', opacity: 0.04 },
          { type: 'vignette', intensity: 0.9, radius: 45 }
        ]}
      />

      {/* Main Headline */}
      <AnimatedText
        text="The old way is broken"
        preset="glitchReveal"
        fontSize={84}
        fontWeight={800}
        color="#ffffff"
        anchor="top-center"
        offsetY={120}
      />

      {/* Scattered Cards Container */}
      <AbsoluteFill>
        {/* Card 1 */}
        <div style={{
          ...cardBaseStyle,
          marginLeft: -400,
          transform: `translate(-50%, -50%) translateY(${card1Y}px) rotate(${card1Rot}deg) scale(${card1Spring})`,
          opacity: card1Spring,
        }}>
          Manual Processes
        </div>

        {/* Card 2 */}
        <div style={{
          ...cardBaseStyle,
          marginLeft: 400,
          transform: `translate(-50%, -50%) translateY(${card2Y}px) rotate(${card2Rot}deg) scale(${card2Spring})`,
          opacity: card2Spring,
        }}>
          Scattered Tools
        </div>

        {/* Card 3 (Center, highest z-index) */}
        <div style={{
          ...cardBaseStyle,
          marginLeft: 0,
          transform: `translate(-50%, -50%) translateY(${card3Y}px) rotate(${card3Rot}deg) scale(${card3Spring})`,
          opacity: card3Spring,
          zIndex: 10,
          backgroundColor: 'rgba(30, 10, 15, 0.9)',
          border: '2px solid rgba(239, 68, 68, 0.7)',
          color: '#fca5a5',
        }}>
          Endless Context Switching
        </div>
      </AbsoluteFill>

      {/* Subtext */}
      <AnimatedText
        text="It's costing you time and money every single day."
        preset="fadeBlurIn"
        startFrame={75}
        fontSize={42}
        fontWeight={500}
        color="#a1a1aa"
        anchor="bottom-center"
        offsetY={-120}
        animationUnit="word"
        stagger={3}
      />
    </AbsoluteFill>
  );
};
