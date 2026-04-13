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

const AbstractComplexityVisualization: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Create a set of "nodes" and "lines" representing data complexity
  const nodes = Array.from({ length: 15 }).map((_, i) => {
    const angle = (i / 15) * Math.PI * 2;
    const radius = 200 + Math.sin(frame * 0.02 + i) * 50;
    return {
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
    };
  });

  return (
    <AbsoluteFill style={{ opacity: 0.2 }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            {nodes.slice(i + 1).map((target, j) => {
              const distance = Math.sqrt(
                Math.pow(node.x - target.x, 2) + Math.pow(node.y - target.y, 2)
              );
              if (distance > 300) return null;
              return (
                <line
                  key={`${i}-${j}`}
                  x1={node.x}
                  y1={node.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#4A5568"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}
            <circle cx={node.x} cy={node.y} r="4" fill="#3182CE" />
          </React.Fragment>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const HookComplexityChallenge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background Entrance
  const bgOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Text Animations
  const renderTypewriter = (text: string, startFrame: number) => {
    const chars = text.length;
    const progress = Math.floor(
      interpolate(frame, [startFrame, startFrame + chars * 2], [0, chars], {
        extrapolateRight: 'clamp',
      })
    );
    return text.slice(0, progress);
  };

  // Exit animations (starting at frame 105, staggered by 3)
  const exitStart = 105;
  const getExitTransform = (delay: number) => {
    const exitProgress = spring({
      frame: frame - (exitStart + delay),
      fps,
      config: { damping: 200 },
    });
    const opacity = interpolate(exitProgress, [0, 1], [1, 0]);
    const translateY = interpolate(exitProgress, [0, 1], [0, -20]);
    return { opacity, transform: `translateY(${translateY}px)` };
  };

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle, #F0F4F8 0%, #E0E8F0 100%)',
        opacity: bgOpacity,
        fontFamily,
        color: '#2D3748',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <AbstractComplexityVisualization />

      <div
        style={{
          position: 'absolute',
          top: '40%',
          textAlign: 'center',
          width: '100%',
          fontWeight: 800,
          fontSize: '72px',
          ...getExitTransform(0),
        }}
      >
        {renderTypewriter('Drowning in data?', 15)}
      </div>

      <div
        style={{
          position: 'absolute',
          top: '55%',
          textAlign: 'center',
          width: '100%',
          fontWeight: 800,
          fontSize: '72px',
          ...getExitTransform(3),
        }}
      >
        {renderTypewriter('Struggling with insights?', 45)}
      </div>

      {/* Fade out transition at the very end */}
      <AbsoluteFill
        style={{
          backgroundColor: '#F0F4F8',
          opacity: interpolate(frame, [110, 120], [0, 1], {
            extrapolateLeft: 'clamp',
          }),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
