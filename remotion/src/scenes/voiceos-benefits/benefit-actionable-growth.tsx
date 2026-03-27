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

// --- Sub-components ---

const GrowthCurve: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 100 },
    durationInFrames: 60,
  });

  const pathLength = 500;
  const strokeDashoffset = interpolate(progress, [0, 1], [pathLength, 0]);
  const opacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Points for a smooth upward curve
  const d = "M 50 350 Q 250 350, 450 50";

  return (
    <div style={{ 
      position: 'absolute', 
      top: '55%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      width: 500,
      height: 400,
      opacity 
    }}>
      <svg width="500" height="400" viewBox="0 0 500 400" fill="none">
        <defs>
          <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={d}
          stroke="url(#curveGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
          filter="url(#glow)"
        />
        {/* Particle circles at the end of the curve */}
        {progress > 0.9 && [1, 2, 3].map((i) => {
          const p = spring({ frame: frame - (startFrame + 55 + i * 5), fps, config: { damping: 10 } });
          return (
            <circle 
              key={i}
              cx={450 + (i * 10)} 
              cy={50 - (i * 10)} 
              r={interpolate(p, [0, 1], [0, 4])} 
              fill="white" 
              opacity={interpolate(p, [0, 1], [1, 0])}
            />
          );
        })}
      </svg>
    </div>
  );
};

const IconGrid: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const benefits = [
    { label: 'More Sales', icon: '💰' },
    { label: 'Better ROI', icon: '📈' },
    { label: 'Happy Customers', icon: '😊' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '40px',
      position: 'absolute',
      bottom: '15%',
      left: '50%',
      transform: 'translateX(-50%)',
    }}>
      {benefits.map((benefit, i) => {
        const itemStart = startFrame + i * 8;
        const spr = spring({
          frame: frame - itemStart,
          fps,
          config: { damping: 12, stiffness: 100 },
        });

        return (
          <div
            key={benefit.label}
            style={{
              opacity: spr,
              transform: `scale(${spr}) translateY(${interpolate(spr, [0, 1], [20, 0])}px)`,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '20px 30px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              width: '180px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>{benefit.icon}</div>
            <div style={{ 
              color: 'white', 
              fontFamily, 
              fontWeight: 600,
              fontSize: '18px'
            }}>
              {benefit.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Main Scene ---

export const ActionableGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Entrance animations
  const headlineWords = "Turn raw data into powerful growth strategies".split(" ");
  
  // Exit animation (Blur + Scale Out)
  const exitStart = 135;
  const exitDuration = 15;
  const exitProgress = interpolate(
    frame,
    [exitStart, exitStart + exitDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const sceneScale = interpolate(exitProgress, [0, 1], [1, 0.95]);
  const sceneBlur = interpolate(exitProgress, [0, 1], [0, 20]);
  const sceneOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill style={{ 
      background: 'linear-gradient(135deg, #0D47A1 0%, #4A148C 100%)',
      overflow: 'hidden'
    }}>
      <div style={{
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        filter: `blur(${sceneBlur}px)`,
        opacity: sceneOpacity,
        transform: `scale(${sceneScale})`,
      }}>
        
        {/* Headline */}
        <div style={{
          position: 'absolute',
          top: '20%',
          width: '100%',
          textAlign: 'center',
          padding: '0 100px',
          boxSizing: 'border-box'
        }}>
          <h1 style={{
            fontFamily,
            fontSize: '64px',
            fontWeight: 800,
            color: 'white',
            margin: 0,
            lineHeight: 1.2,
            textShadow: '0 0 20px rgba(255,255,255,0.3)',
          }}>
            {headlineWords.map((word, i) => {
              const wordStart = 10 + (i * 4);
              const opacity = interpolate(frame, [wordStart, wordStart + 10], [0, 1], {
                extrapolateRight: 'clamp',
              });
              const translateY = interpolate(
                spring({ frame: frame - wordStart, fps, config: { damping: 20 } }),
                [0, 1],
                [20, 0]
              );
              return (
                <span key={i} style={{ 
                  display: 'inline-block', 
                  opacity, 
                  transform: `translateY(${translateY}px)`,
                  marginRight: '15px' 
                }}>
                  {word}
                </span>
              );
            })}
          </h1>
        </div>

        {/* Growth Curve */}
        <GrowthCurve startFrame={30} />

        {/* Icon Grid */}
        <IconGrid startFrame={80} />

      </div>
    </AbsoluteFill>
  );
};

export default ActionableGrowth;
