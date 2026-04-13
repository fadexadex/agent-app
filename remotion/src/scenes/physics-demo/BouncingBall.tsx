import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const BouncingBall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 1. Smooth entrance from the top
  const entrance = spring({
    frame,
    fps,
    config: { damping: 20 },
    durationInFrames: 30,
  });

  // 2. Continuous bounce logic
  // We use a sine wave to create a repeating bounce effect
  const bounceHeight = 200;
  const bounceSpeed = 0.15;
  const rawBounce = Math.abs(Math.sin(frame * bounceSpeed));
  
  // 3. Squash and stretch effect
  // When rawBounce is near 0 (the floor), we squash it
  const squash = interpolate(rawBounce, [0, 0.1, 1], [0.7, 1, 1]);
  const stretch = interpolate(rawBounce, [0, 0.1, 1], [1.3, 1, 1]);

  // 4. Position calculations
  const translateY = interpolate(entrance, [0, 1], [-200, 0]) + (1 - rawBounce) * bounceHeight;
  
  // 5. Shadow animation
  const shadowOpacity = interpolate(rawBounce, [0, 1], [0.4, 0.1]);
  const shadowScale = interpolate(rawBounce, [0, 1], [1, 0.5]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
      {/* Shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: height / 2 - 60,
          width: 120,
          height: 20,
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '50%',
          filter: 'blur(8px)',
          opacity: shadowOpacity,
          transform: `scale(${shadowScale})`,
        }}
      />

      {/* The Ball */}
      <div
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#3B82F6',
          borderRadius: '50%',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), inset 0 -10px 20px rgba(0,0,0,0.1)',
          transform: `translateY(${translateY}px) scaleX(${stretch}) scaleY(${squash})`,
          border: '4px solid white',
        }}
      />
      
      {/* Floor Line */}
      <div style={{
        position: 'absolute',
        bottom: height / 2 - 60,
        width: 400,
        height: 2,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 2
      }} />
    </AbsoluteFill>
  );
};
