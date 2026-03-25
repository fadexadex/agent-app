import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

interface TimingProps {
  startFrame: number;
  exitFrame: number;
}

const AnimatedCheckmark: React.FC<TimingProps> = ({ startFrame, exitFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Animate path drawing
  const draw = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 30
  });
  
  // Satisfying bounce for the checkmark
  const bounce = spring({
    frame: frame - (startFrame + 15),
    fps,
    config: { damping: 10, stiffness: 200 }
  });
  
  // Fade out animation
  const opacity = interpolate(frame, [exitFrame, exitFrame + 15], [1, 0], { 
    extrapolateLeft: 'clamp', 
    extrapolateRight: 'clamp' 
  });
  
  if (frame < startFrame) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: '48%',
      left: '60%',
      opacity,
      transform: `scale(${interpolate(bounce, [0, 1], [0.5, 1])}) rotate(-5deg)`,
      zIndex: 10
    }}>
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Draw the checkmark from dashoffset 50 down to 0 */}
        <path 
          strokeDasharray="50" 
          strokeDashoffset={interpolate(draw, [0, 1], [50, 0])} 
          d="M20 6L9 17l-5-5" 
        />
      </svg>
    </div>
  );
};

const ProductivityBarChart: React.FC<TimingProps> = ({ startFrame, exitFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Gray bar height animation
  const bar1Height = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 }
  });
  
  // Green bar height animation with slightly different stiffness
  const bar2Height = spring({
    frame: frame - (startFrame + 10),
    fps,
    config: { damping: 15, stiffness: 150 }
  });
  
  // Fade out animation
  const opacity = interpolate(frame, [exitFrame, exitFrame + 15], [1, 0], { 
    extrapolateLeft: 'clamp', 
    extrapolateRight: 'clamp' 
  });
  
  if (frame < startFrame) return null;
  
  return (
    <div style={{
      position: 'absolute',
      bottom: '15%',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '80px',
      alignItems: 'flex-end',
      opacity,
      zIndex: 5
    }}>
      {/* Before Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '100px',
          height: `${interpolate(bar1Height, [0, 1], [0, 180])}px`,
          backgroundColor: '#9CA3AF',
          borderRadius: '12px 12px 0 0',
        }} />
        <span style={{ fontSize: '24px', fontWeight: 600, color: '#4B5563', fontFamily: 'system-ui, sans-serif' }}>Before</span>
      </div>
      
      {/* With FlowPilot Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '100px',
          height: `${interpolate(bar2Height, [0, 1], [0, 280])}px`,
          backgroundColor: '#10B981',
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
        }} />
        <span style={{ fontSize: '24px', fontWeight: 700, color: '#047857', fontFamily: 'system-ui, sans-serif' }}>With FlowPilot</span>
      </div>
    </div>
  );
};

export const Scene05BenefitProductivity: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Overall scene fade-in transition
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, backgroundColor: '#FFFFFF' }}>
      {/* Gradient Background */}
      <Background layers={[{ type: 'linear', colors: ['#D4EDDA', '#C3E6CB'] }]} />
      
      {/* Benefit Headline */}
      <AnimatedText
        text="Focus on what truly matters."
        preset="typewriter"
        startFrame={0}
        anchor="center"
        offsetY={-140}
        fontSize={64}
        fontWeight={800}
        color="#047857"
        exit={{ startFrame: 95, opacity: { from: 1, to: 0, duration: 15 } }}
      />
      
      {/* Productivity Stat */}
      <AnimatedText
        text="Boost your team's productivity by 30%."
        preset="typewriter"
        startFrame={20}
        anchor="center"
        offsetY={-40}
        fontSize={48}
        fontWeight={600}
        color="#059669"
        exit={{ startFrame: 90, opacity: { from: 1, to: 0, duration: 15 } }}
      />
      
      {/* Custom Bar Chart Component */}
      <ProductivityBarChart startFrame={40} exitFrame={100} />
      
      {/* Custom Animated Checkmark Component */}
      <AnimatedCheckmark startFrame={60} exitFrame={105} />
    </AbsoluteFill>
  );
};
