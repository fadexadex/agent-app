
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

interface Scene05BenefitGrowthProps {
  // No custom props needed for now based on spec
}

export const Scene05BenefitGrowth: React.FC<Scene05BenefitGrowthProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // This scene visualizes business growth through data-driven insights.

  // Growth Chart Animation
  const chartEntryProgress = spring({
    frame: frame - 30, // Starts at frame 30
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const chartScale = interpolate(chartEntryProgress, [0, 1], [0.5, 1], { extrapolateRight: 'clamp' });
  const chartOpacity = interpolate(
    frame,
    [20, 40, 90, 120], // Enter from 20-40, Exit from 90-120
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const glowOpacity = interpolate(
    frame,
    [30, 60, 80, 110], // Glow peak between 60-80, fades in and out
    [0, 0.7, 0.7, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Growth chart position (center)
  const chartX = width / 2;
  const chartY = height / 2;

  return (
    <AbsoluteFill>
      {/* Background */}
      <Background layers={[{ type: "linear", colors: ["#533AFD", "#7E6BFD"], angle: 135 }]} />

      {/* Benefit Heading */}
      <AnimatedText
        text="Turn Insights into Unstoppable Growth."
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={10}
        anchor="center"
        offsetY={-60}
        fontSize={72}
        fontWeight={800}
        color="#FFFFFF"
        exit={{
          startFrame: 90,
          opacity: { from: 1, to: 0, duration: 30 },
        }}
      />

      {/* Growth Chart Animation (Custom Placeholder for AnimatedGrowthChart) */}
      <div
        style={{
          position: 'absolute',
          left: chartX,
          top: chartY,
          transform: `translate(-50%, -50%) scale(${chartScale})`,
          opacity: chartOpacity,
          width: 250,
          height: 180,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light semi-transparent white
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `0 0 40px rgba(126, 107, 253, ${glowOpacity}), 0 0 20px rgba(255, 255, 255, ${glowOpacity})`, // Brand purple and white glow
        }}
      >
        {/* Simple upward line chart representation inside the box */}
        <div style={{
          position: 'absolute',
          width: 'calc(100% - 40px)', // Inner content
          height: 'calc(100% - 40px)',
          backgroundColor: 'transparent',
        }}>
          {/* The upward-trending line */}
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '10%',
            width: '80%',
            height: '4px',
            background: 'linear-gradient(to right, white, #7E6BFD)',
            transformOrigin: 'bottom left',
            transform: `rotate(-15deg)`, // Gentle upward slope
            boxShadow: `0 0 15px rgba(255,255,255, ${glowOpacity * 0.8})` // White glow
          }} />
          {/* Sparkles - small circles along the line */}
          <div style={{
            position: 'absolute',
            bottom: '40%',
            left: '30%',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'white',
            boxShadow: `0 0 8px #7E6BFD`, // Purple glow for sparkle
            opacity: glowOpacity // Sparkle with the glow
          }} />
          <div style={{
            position: 'absolute',
            bottom: '60%',
            left: '60%',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'white',
            boxShadow: `0 0 6px #7E6BFD`, // Purple glow for sparkle
            opacity: glowOpacity // Sparkle with the glow
          }} />
        </div>
      </div>

      {/* Benefit Tagline */}
      <AnimatedText
        text="Make data-driven decisions. Grow faster."
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={60}
        anchor="center"
        offsetY={100}
        fontSize={40}
        fontWeight={600}
        color="#FFFFFF"
        exit={{
          startFrame: 90,
          opacity: { from: 1, to: 0, duration: 30 },
        }}
      />
    </AbsoluteFill>
  );
};
