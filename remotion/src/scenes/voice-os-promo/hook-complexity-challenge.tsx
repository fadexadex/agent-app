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

const AbstractComplexityVisualization: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Create a set of "nodes" and "lines" representing data complexity
  const nodes = Array.from({ length: 15 }).map((_, i) => {
    const angle = (i / 15) * Math.PI * 2;
    const radius = 220 + Math.sin(frame * 0.02 + i) * 60;
    return {
      x: width / 2 + Math.cos(angle) * radius,
      y: height / 2 + Math.sin(angle) * radius,
    };
  });

  return (
    <AbsoluteFill style={{ opacity: 0.25 }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            {nodes.slice(i + 1).map((target, j) => {
              const distance = Math.sqrt(
                Math.pow(node.x - target.x, 2) + Math.pow(node.y - target.y, 2)
              );
              if (distance > 350) return null;
              return (
                <line
                  key={`${i}-${j}`}
                  x1={node.x}
                  y1={node.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#4A5568"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                />
              );
            })}
            <circle cx={node.x} cy={node.y} r="5" fill="#3182CE" />
          </React.Fragment>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const AnimatedText: React.FC<{ 
  text: string; 
  startFrame: number; 
  fontSize: string;
  top: string;
  exitStart: number;
  exitDelay: number;
}> = ({ text, startFrame, fontSize, top, exitStart, exitDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Reveal Animation (Smooth slide up + fade)
  const revealProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(revealProgress, [0, 1], [0, 1]);
  const translateY = interpolate(revealProgress, [0, 1], [40, 0]);
  const blur = interpolate(revealProgress, [0, 1], [10, 0]);

  // Exit Animation
  const exitProgress = spring({
    frame: frame - (exitStart + exitDelay),
    fps,
    config: { damping: 200 },
  });

  const finalOpacity = interpolate(exitProgress, [0, 1], [opacity, 0]);
  const finalTranslateY = interpolate(exitProgress, [0, 1], [translateY, -60]);
  const finalBlur = interpolate(exitProgress, [0, 1], [blur, 15]);

  return (
    <div
      style={{
        position: 'absolute',
        top,
        textAlign: 'center',
        width: '100%',
        fontWeight: 800,
        fontSize,
        opacity: finalOpacity,
        transform: `translateY(${finalTranslateY}px) scale(${interpolate(exitProgress, [0, 1], [1, 0.95])})`,
        filter: `blur(${finalBlur}px)`,
        padding: '0 40px',
        lineHeight: 1.2,
      }}
    >
      {text}
    </div>
  );
};

export const HookComplexityChallenge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Global background entrance
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });

  const exitStart = 105;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at center, #F8FAFC 0%, #E2E8F0 100%)',
        opacity: bgOpacity,
        fontFamily,
        color: '#1E293B',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <AbstractComplexityVisualization />

      <AnimatedText 
        text="Drowning in data?" 
        startFrame={15} 
        fontSize="84px"
        top="35%"
        exitStart={exitStart}
        exitDelay={0}
      />

      <AnimatedText 
        text="Struggling with insights?" 
        startFrame={40} 
        fontSize="84px"
        top="52%"
        exitStart={exitStart}
        exitDelay={5}
      />

      {/* Connection transition mask */}
      <AbsoluteFill
        style={{
          backgroundColor: '#09090B', // Transitioning to a dark theme or keeping clean
          opacity: interpolate(frame, [exitStart + 5, exitStart + 15], [0, 1], {
            extrapolateLeft: 'clamp',
          }),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
