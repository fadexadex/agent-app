import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

const AbstractComplexityVisualization: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const nodes = Array.from({ length: 20 }).map((_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const radius = 200 + Math.sin(frame * 0.02 + i) * 50;
    return {
      x: width / 2 + Math.cos(angle + frame * 0.01) * radius,
      y: height / 2 + Math.sin(angle + frame * 0.01) * radius,
      size: 4 + Math.sin(frame * 0.05 + i) * 2,
    };
  });

  return (
    <AbsoluteFill style={{ opacity: 0.2 }}>
      <svg width={width} height={height}>
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            <circle cx={node.x} cy={node.y} r={node.size} fill="#4A90E2" />
            {nodes.slice(i + 1, i + 4).map((target, j) => (
              <line
                key={j}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke="#4A90E2"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            ))}
          </React.Fragment>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const QuestionText: React.FC<{
  text: string;
  y: number;
  startFrame: number;
  exitFrame: number;
}> = ({ text, y, startFrame, exitFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: Word by word reveal
  const words = text.split(' ');
  
  // Exit: Fade and slide
  const exitProgress = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitTranslateY = interpolate(exitProgress, [0, 1], [0, -20]);

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        top: `calc(50% + ${y}px)`,
        textAlign: 'center',
        fontFamily,
        fontSize: 80,
        fontWeight: 800,
        color: '#2D3748',
        opacity: exitOpacity,
        transform: `translateY(${exitTranslateY}px)`,
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * 5;
        const wordSpring = spring({
          frame: frame - wordStart,
          fps,
          config: { damping: 200 },
        });
        
        const opacity = interpolate(wordSpring, [0, 1], [0, 1]);
        const translateY = interpolate(wordSpring, [0, 1], [20, 0]);

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity,
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
  const { fps, durationInFrames } = useVideoConfig();

  // Background Gradient
  const backgroundStyle: React.CSSProperties = {
    background: 'radial-gradient(circle, #F0F4F8 0%, #E0E8F0 100%)',
  };

  // Scene Fade Out
  const sceneFade = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ ...backgroundStyle, opacity: sceneFade }}>
      <AbstractComplexityVisualization />
      
      <QuestionText
        text="Drowning in data?"
        y={-80}
        startFrame={10}
        exitFrame={100}
      />
      
      <QuestionText
        text="Struggling with insights?"
        y={40}
        startFrame={40}
        exitFrame={103} // Staggered by 3 frames
      />
    </AbsoluteFill>
  );
};
