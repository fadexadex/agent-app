import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';

const CampusMapContent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Route drawing animation starts slightly after the mockup enters
  const drawProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 100, mass: 2, stiffness: 40 },
  });

  // Calculate rough path length based on segments:
  // M 90 450 -> 90 280 (170)
  // L 250 280 (160)
  // L 250 200 (80)
  // Total approx: 410
  const pathLength = 410;

  return (
    <AbsoluteFill style={{ backgroundColor: '#F9FAFB' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 20 }}>
        
        {/* Decorative Grid Background to feel like a map */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.5
        }} />

        {/* Generic Building Blocks */}
        <div style={{ position: 'absolute', top: 60, left: 40, width: 120, height: 160, backgroundColor: '#E5E7EB', borderRadius: 12 }} />
        <div style={{ position: 'absolute', top: 320, left: 30, width: 140, height: 110, backgroundColor: '#E5E7EB', borderRadius: 12 }} />
        <div style={{ position: 'absolute', top: 460, left: 160, width: 120, height: 100, backgroundColor: '#E5E7EB', borderRadius: 12 }} />

        {/* Engineering Building A (Destination) */}
        <div style={{ 
          position: 'absolute', 
          top: 100, 
          left: 180, 
          width: 130, 
          height: 160, 
          backgroundColor: '#D1FAE5', 
          borderRadius: 12, 
          border: '2px solid #10B981', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexDirection: 'column' 
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46', textAlign: 'center', lineHeight: 1.2 }}>
            Engineering<br/>Bldg A
          </span>
        </div>

        {/* SVG Route */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Dashed background path */}
          <path
            d="M 90 450 L 90 280 L 250 280 L 250 200"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth={6}
            strokeDasharray="8 8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Animated active path */}
          <path
            d="M 90 450 L 90 280 L 250 280 L 250 200"
            fill="none"
            stroke="#3B82F6"
            strokeWidth={6}
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - drawProgress * pathLength}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Current Location Dot */}
        <div style={{
          position: 'absolute',
          top: 450 - 10,
          left: 90 - 10,
          width: 20,
          height: 20,
          backgroundColor: '#3B82F6',
          borderRadius: '50%',
          border: '4px solid white',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
          transform: `scale(${spring({ frame: frame - 15, fps, config: { damping: 12 } })})`
        }} />

        {/* Destination Pin */}
        <div style={{
          position: 'absolute',
          top: 200 - 24,
          left: 250 - 12,
          transform: `scale(${spring({ frame: frame - 45, fps, config: { damping: 12 } })})`,
          transformOrigin: 'bottom center'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21C16 16.8 19 12.8 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.8 8 16.8 12 21Z" fill="#EF4444" stroke="white" strokeWidth="2"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const FeatureCampusMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // STAGGER DELAY & EXIT TIMINGS
  const pillStart = 0;
  const mockupStart = 5;
  const pillExitStart = 105;
  const mockupExitStart = 110;

  // 1. Feature Pill Animations
  const pillEnter = spring({ 
    frame: frame - pillStart, 
    fps, 
    config: { damping: 15, stiffness: 200 } 
  });
  const pillExitProgress = interpolate(frame, [pillExitStart, pillExitStart + 15], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  
  const pillY = interpolate(pillEnter, [0, 1], [-50, 0], { extrapolateRight: 'clamp' });
  const pillScale = interpolate(pillEnter, [0, 1], [0.8, 1], { extrapolateRight: 'clamp' });
  const pillOpacity = interpolate(pillExitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });

  // 2. Mockup Animations
  const mockupEnter = spring({ 
    frame: frame - mockupStart, 
    fps, 
    config: { damping: 16, stiffness: 180 } 
  });
  const mockupExitProgress = interpolate(frame, [mockupExitStart, mockupExitStart + 15], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  // Mockup slides up from below, then scales down and blurs out
  const mockupY = interpolate(mockupEnter, [0, 1], [height + 200, 0], { extrapolateRight: 'clamp' });
  const mockupScale = interpolate(mockupExitProgress, [0, 1], [1, 0.85], { extrapolateRight: 'clamp' });
  const mockupBlur = interpolate(mockupExitProgress, [0, 1], [0, 12], { extrapolateRight: 'clamp' });
  const mockupOpacity = interpolate(mockupExitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'solid', color: '#FFFFFF' }]} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Feature Pill Layer */}
        <div style={{
          position: 'absolute',
          top: 80,
          backgroundColor: '#1A1A1A',
          width: 280,
          height: 48,
          borderRadius: 9999,
          opacity: pillOpacity,
          transform: `translateY(${pillY}px) scale(${pillScale})`,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          <span style={{ 
            color: '#FFFFFF', 
            fontSize: 20, 
            fontWeight: 600, 
            letterSpacing: '-0.02em',
            fontFamily: 'system-ui, sans-serif'
          }}>
            Never get lost again
          </span>
        </div>

        {/* Mockup Layer */}
        <div style={{
          position: 'absolute',
          top: 160,
          transform: `translateY(${mockupY}px) scale(${mockupScale})`,
          filter: `blur(${mockupBlur}px)`,
          opacity: mockupOpacity,
          width: 340,
          height: 700,
          zIndex: 5
        }}>
          <MockupFrame type="iphone15" theme="light" preset="plain">
            <CampusMapContent />
          </MockupFrame>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
