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

// --- Components ---

const VoiceIndicatorPill: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const exit = spring({
    frame: frame - 120,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  const opacity = entrance - exit;
  const translateY = interpolate(entrance, [0, 1], [-50, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        position: 'absolute',
        top: 60,
        left: '50%',
        translateX: '-50%',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        background: '#1A1A1A',
        padding: '12px 24px',
        borderRadius: '40px',
        color: 'white',
        fontFamily,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        zIndex: 10,
      }}
    >
      <div style={{ width: 24, height: 24, opacity: 0.8 }}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z" />
        </svg>
      </div>
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '20px' }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const barHeight = interpolate(
            Math.sin(frame * 0.3 + i * 0.8),
            [-1, 1],
            [4, 18]
          );
          return (
            <div
              key={i}
              style={{
                width: 3,
                height: barHeight,
                backgroundColor: 'white',
                borderRadius: '2px',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const CalendarMockup: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 80, mass: 1.5 },
  });

  const exit = spring({
    frame: frame - 100,
    fps,
    config: { damping: 200 },
  });

  const eventPop = spring({
    frame: frame - 50,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const opacity = entrance - exit;
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const translateY = interpolate(entrance, [0, 1], [100, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        width: '80%',
        height: '55%',
        top: '50%',
        left: '10%',
        marginTop: '-15%',
        background: '#F9FAFB',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        opacity,
        transform: `perspective(1000px) rotateX(5deg) scale(${scale}) translateY(${translateY}px)`,
        overflow: 'hidden',
        fontFamily,
      }}
    >
      {/* Browser Header */}
      <div
        style={{
          height: '50px',
          background: 'white',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
        </div>
        <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: 500 }}>Google Calendar</div>
        <div style={{ width: 40 }} />
      </div>

      {/* Calendar Grid */}
      <div style={{ padding: '30px', display: 'flex', gap: '20px', height: '100%' }}>
        <div style={{ width: '15%', borderRight: '1px solid #F3F4F6' }}>
          {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((h) => (
            <div key={h} style={{ height: '50px', fontSize: '12px', color: '#9CA3AF' }}>{h} {h >= 9 && h < 12 ? 'AM' : 'PM'}</div>
          ))}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Static existing event */}
          <div style={{ 
            height: '100px', 
            background: '#EEF2FF', 
            borderLeft: '4px solid #4F46E5',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '50px',
            opacity: 0.6
          }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#312E81' }}>Marketing Review</div>
          </div>
          
          {/* New voice-added event */}
          <div style={{ 
            position: 'absolute',
            top: '250px',
            left: 0,
            right: 20,
            height: '60px', 
            background: '#1A1A1A', 
            borderRadius: '8px',
            padding: '12px',
            color: 'white',
            transform: `scale(${eventPop})`,
            opacity: eventPop,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Team Sync</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>2:00 PM - 3:00 PM</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturePill: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 45,
    fps,
    config: { damping: 200 },
  });

  const exit = spring({
    frame: frame - 110,
    fps,
    config: { damping: 200 },
  });

  const opacity = entrance - exit;
  const scale = interpolate(entrance, [0, 1], [0.9, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        translateX: '-50%',
        background: '#1A1A1A',
        color: 'white',
        padding: '12px 32px',
        borderRadius: '30px',
        fontFamily,
        fontSize: '20px',
        fontWeight: 500,
        opacity,
        transform: `scale(${scale})`,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      }}
    >
      Effortless Scheduling
    </div>
  );
};

// --- Main Scene ---

export const FeatureCalendar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Global blur transition
  const blurAmount = interpolate(
    frame,
    [0, 15, 125, 140],
    [10, 0, 0, 10],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF', filter: `blur(${blurAmount}px)` }}>
      <VoiceIndicatorPill frame={frame} fps={fps} />
      <CalendarMockup frame={frame} fps={fps} />
      <FeaturePill frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

export default FeatureCalendar;
