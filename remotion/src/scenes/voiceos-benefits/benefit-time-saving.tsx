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

// --- Sub-components ---

const ClockIcon = ({ progress }: { progress: number }) => {
  const rotation = interpolate(progress, [0, 1], [0, 360]);
  return (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '12px 12px' }} />
    </svg>
  );
};

const FocusIcon = ({ progress }: { progress: number }) => {
  const scale = interpolate(progress, [0, 1], [0.8, 1.2]);
  return (
    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `scale(${scale})` }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    </svg>
  );
};

const GrowthIcon = ({ progress }: { progress: number }) => {
  const yMove = interpolate(progress, [0, 1], [5, -5]);
  return (
    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#00BCD4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `translateY(${yMove}px)` }}>
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  );
};

const Background = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Cfilter id='noiseFilter'%3%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />
    </AbsoluteFill>
  );
};

// --- Main Scene ---

export const BenefitTimeSaving: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timing constants
  const START_HEADLINE = 10;
  const START_METER = 25;
  const START_ICONS = 40;
  const EXIT_START = 105;
  const STAGGER = 3;

  // Global Scene Entrance/Exit Fade
  const sceneOpacity = interpolate(
    frame,
    [0, 15, 105, 120],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  // Headline Animation
  const headlineSpring = spring({
    frame: frame - START_HEADLINE,
    fps,
    config: { damping: 200 },
  });
  const headlineExit = interpolate(
    frame,
    [EXIT_START, EXIT_START + 10],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // Meter Animation (Clock spinning)
  const meterSpring = spring({
    frame: frame - START_METER,
    fps,
    config: { damping: 20, stiffness: 100 },
  });
  const meterPulse = Math.sin(frame * 0.1) * 0.05 + 1;
  const meterExit = interpolate(
    frame,
    [EXIT_START + STAGGER, EXIT_START + STAGGER + 10],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  // Icons Animation
  const iconEntrance = (delay: number) => spring({
    frame: frame - (START_ICONS + delay),
    fps,
    config: { damping: 12, stiffness: 150 },
  });
  const iconExit = (delay: number) => interpolate(
    frame,
    [EXIT_START + delay, EXIT_START + delay + 10],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, fontFamily }}>
      <Background />
      
      {/* Headline */}
      <div style={{
        position: 'absolute',
        width: '100%',
        top: height / 2 - 120,
        textAlign: 'center',
        padding: '0 80px',
        opacity: headlineSpring * headlineExit,
        transform: `translateY(${interpolate(headlineSpring, [0, 1], [20, 0])}px)`,
      }}>
        <h1 style={{
          fontSize: 64,
          fontWeight: 800,
          color: '#1F2937',
          margin: 0,
          lineHeight: 1.1,
        }}>
          Save Hours, Focus on What Matters.
        </h1>
      </div>

      {/* Time Saved Meter (Analog Clock style) */}
      <div style={{
        position: 'absolute',
        left: width / 2 - 60,
        top: height / 2 + 20,
        opacity: meterSpring * meterExit,
        transform: `scale(${meterSpring * meterPulse})`,
      }}>
        <ClockIcon progress={frame / 30} />
      </div>

      {/* Icon Grid */}
      <div style={{
        position: 'absolute',
        width: '100%',
        bottom: 120,
        display: 'flex',
        justifyContent: 'center',
        gap: 80,
      }}>
        {[
          { comp: <FocusIcon progress={Math.sin(frame * 0.1)} />, delay: 0 },
          { comp: <GrowthIcon progress={Math.sin(frame * 0.08)} />, delay: 10 },
        ].map((item, i) => {
          const entrance = iconEntrance(item.delay);
          const exit = iconExit(STAGGER * 2 + i * STAGGER);
          return (
            <div key={i} style={{
              opacity: entrance * exit,
              transform: `scale(${entrance}) translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
            }}>
              {item.comp}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
