import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

// --- Components ---

const AbstractComplexityVisualization: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Create a set of "nodes"
  const nodes = Array.from({ length: 15 }).map((_, i) => {
    const angle = (i / 15) * Math.PI * 2;
    const x = width / 2 + Math.cos(angle + frame * 0.01) * (200 + i * 10);
    const y = height / 2 + Math.sin(angle + frame * 0.015) * (150 + i * 5);
    return { x, y };
  });

  return (
    <AbsoluteFill style={{ opacity: 0.3 }}>
      <svg width={width} height={height}>
        {nodes.map((node, i) =>
          nodes.slice(i + 1).map((other, j) => {
            const dist = Math.sqrt(
              Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
            );
            if (dist > 300) return null;
            const opacity = interpolate(dist, [0, 300], [0.5, 0]);
            return (
              <line
                key={`${i}-${j}`}
                x1={node.x}
                y1={node.y}
                x2={other.x}
                y2={other.y}
                stroke="#4A5568"
                strokeWidth="1"
                strokeOpacity={opacity}
              />
            );
          })
        )}
        {nodes.map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r="4"
            fill="#3182CE"
            fillOpacity="0.6"
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle, #F0F4F8 0%, #E0E8F0 100%)`,
      }}
    />
  );
};

const AnimatedText: React.FC<{
  text: string;
  y: number;
  startFrame: number;
  exitFrame: number;
}> = ({ text, y, startFrame, exitFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: Word-by-word reveal with translateY
  const words = text.split(' ');
  
  // Exit: Fade and slight blur
  const exitProgress = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const opacity = interpolate(frame, [exitFrame, exitFrame + 10], [1, 0], {
    extrapolateRight: 'clamp',
  });
  const blur = interpolate(exitProgress, [0, 1], [0, 10]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        textAlign: 'center',
        transform: `translateY(${y}px)`,
        fontFamily,
        fontSize: '80px',
        fontWeight: 800,
        color: '#2D3748',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * 5;
        const wordSpring = spring({
          frame: frame - wordStart,
          fps,
          config: { damping: 200 },
        });

        const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1]);
        const translateY = interpolate(wordSpring, [0, 1], [20, 0]);

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: wordOpacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const HookComplexityChallenge: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Overall scene fade-in/out
  const sceneOpacity = interpolate(
    frame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, backgroundColor: '#F0F4F8' }}>
      <Background />
      <AbstractComplexityVisualization />
      
      {/* Question 1: Drowning in data? */}
      <AnimatedText
        text="Drowning in data?"
        y={-80}
        startFrame={10}
        exitFrame={90}
      />

      {/* Question 2: Struggling with insights? */}
      <AnimatedText
        text="Struggling with insights?"
        y={40}
        startFrame={40}
        exitFrame={93} // Staggered by 3 frames
      />
    </AbsoluteFill>
  );
};
