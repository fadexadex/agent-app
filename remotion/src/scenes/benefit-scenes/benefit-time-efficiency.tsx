import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { LucideProps, Clock, CheckCircle2, Lightbulb } from 'lucide-react';

const { fontFamily } = loadFont();

const BenefitIcon = ({ 
  Icon, 
  label, 
  index, 
  frame, 
  fps 
}: { 
  Icon: React.FC<LucideProps>, 
  label: string, 
  index: number, 
  frame: number, 
  fps: number 
}) => {
  const delay = 40 + index * 10;
  
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const exitDelay = 100 + index * 3;
  const exit = spring({
    frame: frame - exitDelay,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(entrance - exit, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.5, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      opacity,
      transform: `scale(${scale}) translateY(${translateY}px)`,
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={60} color="#1E3A8A" strokeWidth={1.5} />
      </div>
      <span style={{
        fontFamily,
        fontSize: '24px',
        fontWeight: 600,
        color: '#4B5563',
        textAlign: 'center'
      }}>
        {label}
      </span>
    </div>
  );
};

export const BenefitTimeEfficiency: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Heading Animation
  const headingEntrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });

  const headingExit = spring({
    frame: frame - 95,
    fps,
    config: { damping: 200 },
  });

  const headingOpacity = interpolate(headingEntrance - headingExit, [0, 1], [0, 1]);
  const headingBlur = interpolate(headingEntrance, [0, 1], [10, 0]);
  const headingY = interpolate(headingEntrance, [0, 1], [-60, -80]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#E3F2FD', fontFamily }}>
      {/* Background Subtle Gradient Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, transparent 0%, rgba(30, 58, 138, 0.05) 100%)'
      }} />

      {/* Heading */}
      <div style={{
        position: 'absolute',
        width: '100%',
        top: '50%',
        transform: `translateY(${headingY}px)`,
        display: 'flex',
        justifyContent: 'center',
        opacity: headingOpacity,
        filter: `blur(${headingBlur}px)`,
      }}>
        <h1 style={{
          fontSize: '72px',
          fontWeight: 800,
          color: '#1E3A8A',
          margin: 0,
          textAlign: 'center',
          letterSpacing: '-2px'
        }}>
          Save Hours, Gain Clarity.
        </h1>
      </div>

      {/* Icon Grid */}
      <div style={{
        position: 'absolute',
        width: '100%',
        bottom: '25%',
        display: 'flex',
        justifyContent: 'center',
        gap: '80px',
      }}>
        <BenefitIcon 
          Icon={Clock} 
          label="Time Saved" 
          index={0} 
          frame={frame} 
          fps={fps} 
        />
        <BenefitIcon 
          Icon={CheckCircle2} 
          label="Accuracy Boost" 
          index={1} 
          frame={frame} 
          fps={fps} 
        />
        <BenefitIcon 
          Icon={Lightbulb} 
          label="Faster Decisions" 
          index={2} 
          frame={frame} 
          fps={fps} 
        />
      </div>
    </AbsoluteFill>
  );
};