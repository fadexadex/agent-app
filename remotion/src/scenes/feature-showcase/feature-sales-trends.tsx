import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// --- Sub-components ---

const HighlightBox: React.FC<{
  text: string;
  x: number;
  y: number;
  startFrame: number;
  exitFrame: number;
}> = ({ text, x, y, startFrame, exitFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const exit = interpolate(
    frame,
    [exitFrame, exitFrame + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = entrance - exit;
  const scale = entrance;
  const blur = interpolate(exit, [0, 1], [0, 20]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '2px solid #3B82F6',
        borderRadius: 12,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
      }}
    >
      <span
        style={{
          fontFamily,
          color: '#1E40AF',
          fontWeight: 700,
          fontSize: 20,
        }}
      >
        {text}
      </span>
    </div>
  );
};

const SalesChartMockup: React.FC<{ startFrame: number; exitFrame: number }> = ({
  startFrame,
  exitFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20 },
  });

  const exit = interpolate(
    frame,
    [exitFrame, exitFrame + 15],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(entrance, [0, 1], [height, 0]);
  const opacity = 1 - exit;
  const blur = interpolate(exit, [0, 1], [0, 40]);

  // Generate chart points
  const points = [
    { x: 0, y: 70 },
    { x: 10, y: 65 },
    { x: 20, y: 80 },
    { x: 30, y: 30 }, // Peak 1
    { x: 40, y: 55 },
    { x: 50, y: 45 },
    { x: 60, y: 85 }, // Dip
    { x: 70, y: 60 },
    { x: 80, y: 20 }, // Peak 2
    { x: 90, y: 40 },
    { x: 100, y: 35 },
  ];

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.x * 800) / 100} ${p.y * 4}`)
    .join(' ');

  return (
    <div
      style={{
        position: 'absolute',
        width: 900,
        height: 600,
        left: (width - 900) / 2,
        top: (height - 600) / 2 - 40,
        backgroundColor: 'white',
        borderRadius: 16,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        transform: `translateY(${translateY}px)`,
        opacity,
        filter: `blur(${blur}px)`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Browser Header */}
      <div
        style={{
          height: 40,
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 8,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27C93F' }} />
        <div
          style={{
            marginLeft: 20,
            height: 20,
            width: 400,
            backgroundColor: 'white',
            borderRadius: 4,
            border: '1px solid #E5E7EB',
          }}
        />
      </div>

      {/* Chart Area */}
      <div style={{ flex: 1, padding: 40, position: 'relative' }}>
        <h2 style={{ fontFamily, margin: 0, color: '#111827', fontSize: 24 }}>Revenue Analysis</h2>
        <div style={{ marginTop: 40, width: '100%', height: 350, borderLeft: '2px solid #E5E7EB', borderBottom: '2px solid #E5E7EB', position: 'relative' }}>
            <svg width="800" height="350" viewBox="0 0 800 400">
                <path
                    d={pathD}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Grid lines */}
                {[0, 1, 2, 3].map(i => (
                    <line key={i} x1="0" y1={i * 100} x2="800" y2={i * 100} stroke="#F3F4F6" strokeWidth="1" />
                ))}
            </svg>
        </div>
      </div>
    </div>
  );
};

export const SalesTrendsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const EXIT_START = 120;

  // Caption Animation
  const captionStart = 90;
  const captionEntrance = spring({
    frame: frame - captionStart,
    fps,
    config: { damping: 200 },
  });
  const captionExit = interpolate(frame, [EXIT_START, EXIT_START + 15], [0, 1], { extrapolateRight: 'clamp' });
  const captionOpacity = captionEntrance - captionExit;
  const captionBlur = interpolate(captionExit, [0, 1], [0, 20]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
      {/* Main Mockup */}
      <SalesChartMockup startFrame={0} exitFrame={EXIT_START} />

      {/* Peak Highlight */}
      <HighlightBox
        text="Peak Sales"
        x={width / 2 - 180}
        y={height / 2 - 180}
        startFrame={30}
        exitFrame={EXIT_START}
      />

      {/* Dip Highlight */}
      <HighlightBox
        text="Identify Dips"
        x={width / 2 + 80}
        y={height / 2 + 100}
        startFrame={70}
        exitFrame={EXIT_START}
      />

      {/* Caption */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          width: '100%',
          textAlign: 'center',
          opacity: captionOpacity,
          filter: `blur(${captionBlur}px)`,
          transform: `translateY(${interpolate(captionEntrance, [0, 1], [20, 0])}px)`,
        }}
      >
        <p
          style={{
            fontFamily,
            fontSize: 32,
            color: '#374151',
            fontWeight: 500,
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          Spot high-performing products & seasonal patterns.
        </p>
      </div>
      
      {/* Dissolve Transition In (Simulated) */}
      {frame < 15 && (
          <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'white',
              opacity: interpolate(frame, [0, 15], [1, 0])
          }} />
      )}
    </AbsoluteFill>
  );
};
