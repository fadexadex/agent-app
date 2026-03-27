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

const AnimatedLineGraph: React.FC<{ progress: number }> = ({ progress }) => {
  const points = [
    { x: 0, y: 50 },
    { x: 20, y: 40 },
    { x: 40, y: 60 },
    { x: 60, y: 80 },
    { x: 80, y: 120 },
    { x: 100, y: 150 },
  ];

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 4} ${p.y}`)
    .join(' ');

  const strokeDasharray = 1000;
  const strokeDashoffset = interpolate(progress, [0, 1], [strokeDasharray, 0], {
    extrapolateRight: 'clamp',
  });

  const color = interpolate(progress, [0, 1], [0, 1]);
  const strokeColor = `rgb(${interpolate(color, [0, 1], [34, 220])}, ${interpolate(
    color,
    [0, 1],
    [197, 38]
  )}, ${interpolate(color, [0, 1], [94, 38])})`;

  return (
    <svg
      width="400"
      height="200"
      viewBox="0 0 400 200"
      style={{ overflow: 'visible' }}
    >
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />
    </svg>
  );
};

export const GrowthStruggleHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Exit Animation (starts at frame 90 for 15 frames)
  const exitProgress = spring({
    frame: frame - 90,
    fps,
    config: { damping: 200 },
    durationInFrames: 15,
  });
  const opacity = interpolate(exitProgress, [0, 1], [1, 0]);

  // Main Question Animation
  const questionStart = 10;
  const questionText = "Struggling to grow your Shopify store?";
  const questionCharCount = Math.floor(
    interpolate(frame - questionStart, [0, 30], [0, questionText.length], {
      extrapolateRight: 'clamp',
    })
  );

  // Graph Animation
  const graphStart = 40;
  const graphProgress = spring({
    frame: frame - graphStart,
    fps,
    config: { damping: 100 },
    durationInFrames: 45,
  });

  // Hint Solution Animation
  const hintStart = 60;
  const hintText = "What if there was a clearer path?";
  const hintCharCount = Math.floor(
    interpolate(frame - hintStart, [0, 30], [0, hintText.length], {
      extrapolateRight: 'clamp',
    })
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
        opacity,
      }}
    >
      {/* Main Question */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          fontSize: '64px',
          fontWeight: 800,
          color: '#1E293B',
          textAlign: 'center',
          padding: '0 40px',
          lineHeight: 1.2,
        }}
      >
        {questionText.slice(0, questionCharCount)}
      </div>

      {/* Animated Graph */}
      <div
        style={{
          transform: `scale(${interpolate(graphProgress, [0, 1], [0.8, 1])})`,
          opacity: graphProgress,
          marginTop: '60px',
        }}
      >
        <AnimatedLineGraph progress={graphProgress} />
      </div>

      {/* Hint Text */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          fontSize: '32px',
          fontStyle: 'italic',
          color: '#64748B',
          opacity: interpolate(frame - hintStart, [0, 15], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {hintText.slice(0, hintCharCount)}
      </div>
    </AbsoluteFill>
  );
};
