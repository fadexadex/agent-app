import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

// --- Components ---

const Background = () => {
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0D47A1 0%, #4A148C 100%)',
      }}
    />
  );
};

const GrowthCurve = ({ frame }: { frame: number }) => {
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 100 },
  });

  const pathLength = 500;
  const dashOffset = interpolate(progress, [0, 1], [pathLength, 0]);
  const opacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{ 
      position: 'absolute', 
      top: '55%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      opacity 
    }}>
      <svg width="600" height="300" viewBox="0 0 600 300" fill="none">
        <path
          d="M50 250 Q 150 230, 250 150 T 550 50"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={dashOffset}
          style={{
            filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))'
          }}
        />
        {/* Particles / Dots */}
        {[0.2, 0.5, 0.8, 1].map((p, i) => {
          const pointOpacity = interpolate(progress, [p - 0.1, p], [0, 1], { extrapolateRight: 'clamp' });
          return (
            <circle
              key={i}
              cx={50 + p * 500}
              cy={250 - p * 200 * (p + 0.2)}
              r="6"
              fill="white"
              style={{ opacity: pointOpacity, filter: 'blur(1px)' }}
            />
          );
        })}
      </svg>
    </div>
  );
};

const IconGrid = ({ frame }: { frame: number }) => {
  const { fps } = useVideoConfig();
  const icons = [
    { label: 'More Sales', icon: '💰' },
    { label: 'Better ROI', icon: '📈' },
    { label: 'Happy Customers', icon: '😊' },
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '15%',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '60px',
    }}>
      {icons.map((item, i) => {
        const startFrame = 80 + i * 10;
        const entrance = spring({
          frame: frame - startFrame,
          fps,
          config: { damping: 12 },
        });
        
        const opacity = interpolate(frame, [startFrame, startFrame + 10], [0, 1], { extrapolateRight: 'clamp' });
        const translateY = interpolate(entrance, [0, 1], [20, 0]);

        return (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity,
            transform: `translateY(${translateY}px)`,
          }}>
            <div style={{
              fontSize: '60px',
              marginBottom: '10px',
              filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))'
            }}>
              {item.icon}
            </div>
            <div style={{
              color: 'white',
              fontFamily,
              fontSize: '24px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const BenefitActionableGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance for Headline
  const headlineStart = 10;
  const headlineText = "Turn raw data into powerful growth strategies";
  const charCount = Math.floor(interpolate(frame, [headlineStart, headlineStart + 40], [0, headlineText.length], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad)
  }));

  const headlineOpacity = interpolate(frame, [headlineStart, headlineStart + 15], [0, 1], { extrapolateRight: 'clamp' });

  // Scene-wide Exit Animation (Unified Blur and Scale)
  const exitStart = durationInFrames - 15;
  const exitProgress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const sceneScale = interpolate(exitProgress, [0, 1], [1, 0.95]);
  const sceneBlur = interpolate(exitProgress, [0, 1], [0, 20]);
  const sceneOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#000',
      overflow: 'hidden'
    }}>
      <div style={{
        flex: 1,
        width: '100%',
        height: '100%',
        opacity: sceneOpacity,
        filter: `blur(${sceneBlur}px)`,
        transform: `scale(${sceneScale})`,
      }}>
        <Background />
        
        {/* Headline */}
        <div style={{
          position: 'absolute',
          top: '20%',
          width: '100%',
          textAlign: 'center',
          padding: '0 100px',
          boxSizing: 'border-box',
          opacity: headlineOpacity,
        }}>
          <h1 style={{
            fontFamily,
            color: 'white',
            fontSize: '64px',
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
            textShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
          }}>
            {headlineText.slice(0, charCount)}
          </h1>
        </div>

        {/* Growth Curve Component */}
        <GrowthCurve frame={frame} />

        {/* Icons Grid */}
        <IconGrid frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
