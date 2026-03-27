import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Poppins';

const { fontFamily } = loadFont();

// --- Sub-components ---

const AnalyticLineChart: React.FC<{ opacity: number; x: number; y: number }> = ({ opacity, x, y }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        left: 100,
        width: 400,
        height: 250,
        opacity,
        transform: `translate(${x}px, ${y}px)`,
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: 20,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: 20,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M 0 80 Q 25 20 50 50 T 100 10"
          fill="none"
          stroke="#4A90E2"
          strokeWidth="3"
          strokeDasharray="200"
          strokeDashoffset={interpolate(frame, [20, 60], [200, 0], { extrapolateRight: 'clamp' })}
        />
      </svg>
    </div>
  );
};

const AnalyticBarChart: React.FC<{ opacity: number; x: number; y: number }> = ({ opacity, x, y }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        top: 100,
        right: 100,
        width: 350,
        height: 200,
        opacity,
        transform: `translate(${x}px, ${y}px) rotate(2deg)`,
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: 20,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: 24,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 12,
      }}
    >
      {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => {
        const grow = spring({
          frame: frame - (30 + i * 5),
          fps: 30,
          config: { damping: 12 },
        });
        return (
          <div
            key={i}
            style={{
              flex: 1,
              backgroundColor: '#A78BFA',
              borderRadius: '6px 6px 2px 2px',
              height: `${grow * h * 100}%`,
              opacity: 0.8,
            }}
          />
        );
      })}
    </div>
  );
};

// --- Main Scene ---

export const MetricsQuestionHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timing constants
  const START_FRAME = 10;
  const EXIT_START = 100;

  // Background Entrance
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // Chart 1 (Bottom Left) Animation
  const chart1Entrance = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20 },
  });
  const chart1X = interpolate(chart1Entrance, [0, 1], [-100, 0]);
  const chart1Y = interpolate(chart1Entrance, [0, 1], [100, 0]);
  const chart1Opacity = interpolate(chart1Entrance, [0, 1], [0, 0.6]);

  // Chart 2 (Top Right) Animation
  const chart2Entrance = spring({
    frame: frame - 25,
    fps,
    config: { damping: 20 },
  });
  const chart2X = interpolate(chart2Entrance, [0, 1], [100, 0]);
  const chart2Y = interpolate(chart2Entrance, [0, 1], [-100, 0]);
  const chart2Opacity = interpolate(chart2Entrance, [0, 1], [0, 0.6]);

  // Text Reveal Logic (Word by Word)
  const questionText = "Are you really tracking the right metrics?";
  const words = questionText.split(' ');

  // Exit animations (Staggered by 3 frames)
  const getExitValue = (delay: number) => {
    return spring({
      frame: frame - (EXIT_START + delay),
      fps,
      config: { damping: 200 },
    });
  };

  const chart1Exit = getExitValue(0);
  const chart2Exit = getExitValue(3);
  const textExit = getExitValue(6);
  const sceneFadeOut = interpolate(frame, [110, 120], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#E0F2F7', 
      background: 'radial-gradient(circle, #F3E7F7 0%, #E0F2F7 100%)',
      opacity: sceneFadeOut,
      fontFamily 
    }}>
      {/* Background Elements */}
      <AnalyticLineChart 
        opacity={chart1Opacity * (1 - chart1Exit)} 
        x={chart1X} 
        y={chart1Y + chart1Exit * 50} 
      />
      <AnalyticBarChart 
        opacity={chart2Opacity * (1 - chart2Exit)} 
        x={chart2X} 
        y={chart2Y - chart2Exit * 50} 
      />

      {/* Main Question Text */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 100px',
          textAlign: 'center',
          height: '100%',
          width: '100%',
          color: '#1F2937',
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.2,
          opacity: 1 - textExit,
          transform: `scale(${1 - textExit * 0.05})`,
        }}
      >
        {words.map((word, i) => {
          const wordReveal = spring({
            frame: frame - (START_FRAME + i * 4),
            fps,
            config: { damping: 15, stiffness: 100 },
          });

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.25em',
                opacity: wordReveal,
                transform: `translateY(${interpolate(wordReveal, [0, 1], [20, 0])}px)`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
