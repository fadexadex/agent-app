import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

const Background: React.FC<{ color: string }> = ({ color }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        zIndex: -1,
      }}
    />
  );
};

const FeaturePill: React.FC<{ text: string; frame: number; startFrame: number }> = ({ text, frame, startFrame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [-20, 0]);

  // Exit animation (staggered)
  const exitFrame = 130;
  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: `translate(-50%, -50%) translateY(${translateY}px)`,
        backgroundColor: '#673AB7',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '100px',
        fontSize: '24px',
        fontWeight: 600,
        fontFamily,
        opacity: opacity * exitOpacity,
        boxShadow: '0 10px 30px rgba(103, 58, 183, 0.3)',
        zIndex: 10,
      }}
    >
      {text}
    </div>
  );
};

const TranscriptCard: React.FC<{ frame: number; startFrame: number }> = ({ frame, startFrame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Exit animation (staggered)
  const exitFrame = 133;
  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitScale = interpolate(exit, [0, 1], [1, 0.9]);
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale * exitScale})`,
        width: '700px',
        height: '350px',
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        opacity: opacity * exitOpacity,
        fontFamily,
        border: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      <div style={{ color: '#666', fontSize: '18px', marginBottom: '20px', fontWeight: 600 }}>Meeting Transcript:</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '16px',
              width: `${Math.random() * 40 + 60}%`,
              backgroundColor: '#F3F4F6',
              borderRadius: '4px',
              opacity: interpolate(frame - startFrame, [20 + i * 5, 40 + i * 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ frame: number; startFrame: number }> = ({ frame, startFrame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const translateY = interpolate(entrance, [0, 1], [100, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Exit animation (staggered)
  const exitFrame = 136;
  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '75%',
        left: '50%',
        transform: `translate(-50%, -50%) translateY(${translateY}px)`,
        width: '600px',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 30px 60px rgba(103, 58, 183, 0.15)',
        opacity: opacity * exitOpacity,
        fontFamily,
        border: '2px solid #E1BEE7',
      }}
    >
      <div style={{ color: '#673AB7', fontSize: '16px', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        AI Summary
      </div>
      <div style={{ color: '#333', fontSize: '20px', lineHeight: '1.5', fontWeight: 500 }}>
        Key decisions made, action items assigned to relevant team members.
      </div>
    </div>
  );
};

export const SmartMeetingSummaries: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Intro Slide Transition
  const introSlide = spring({
    frame,
    fps: 30,
    durationInFrames: 15,
    config: { damping: 200 },
  });
  const introOffset = interpolate(introSlide, [0, 1], [width, 0]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', transform: `translateX(${introOffset}px)` }}>
        <Background color="#f3e5f5" />
        
        {/* Sequence elements */}
        <TranscriptCard frame={frame} startFrame={10} />
        <FeaturePill text="Generating Summary..." frame={frame} startFrame={40} />
        <SummaryCard frame={frame} startFrame={75} />
      </div>
    </AbsoluteFill>
  );
};
