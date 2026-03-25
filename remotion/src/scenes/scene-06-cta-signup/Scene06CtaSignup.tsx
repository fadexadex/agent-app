import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

// Logo component that fades in at bottom-left
const FlowPilotLogoSmall: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Fade in starting at frame 50
  const opacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 40,
      left: 40,
      opacity,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'white',
      fontFamily: 'sans-serif',
      fontWeight: 700,
      fontSize: '24px'
    }}>
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M12 2L2 22l10-4 10 4L12 2z" />
      </svg>
      FlowPilot
    </div>
  );
};

// Prominent emerald green CTA button with scale-in and double-pulse animation
const CallToActionButton: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Scale in entrance starting at frame 40
  const entranceScale = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12, stiffness: 150 }
  });
  
  // Subtle double pulse effect between frames 60 and 90
  // Maps 30 frames to 2 full sine waves (4 PI)
  const pulsePhase = interpolate(frame, [60, 90], [0, Math.PI * 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  
  // Only use the positive humps of the sine wave for a "heartbeat" expansion
  const pulseMultiplier = 1 + (Math.max(0, Math.sin(pulsePhase)) * 0.08);
  
  const finalScale = entranceScale * pulseMultiplier;
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) scale(${finalScale})`,
      marginTop: '100px', // Push down below the text layers
      backgroundColor: '#10B981', // Emerald green
      color: 'white',
      padding: '16px 40px',
      borderRadius: '50px',
      fontSize: '24px',
      fontWeight: 600,
      fontFamily: 'sans-serif',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer' // Invites interaction visually
    }}>
      Sign Up Now
    </div>
  );
};

export const Scene06CtaSignup: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#007BFF' }}>
      <Background layers={[{ type: 'solid', color: '#007BFF' }]} />
      
      {/* Main Headline */}
      <AnimatedText 
        text="Ready to streamline your projects?"
        preset="typewriter"
        startFrame={0}
        anchor="center"
        offsetY={-100}
        fontSize={56}
        fontWeight={700}
        color="#FFFFFF"
      />
      
      {/* Subtext */}
      <AnimatedText 
        text="Start your free trial today."
        preset="typewriter"
        startFrame={20}
        anchor="center"
        offsetY={-20}
        fontSize={36}
        fontWeight={400}
        color="#E0F2FE"
      />
      
      {/* Animated Call to Action Button */}
      <CallToActionButton />
      
      {/* Small Logo (Bottom Left) */}
      <FlowPilotLogoSmall />
      
      {/* Website URL (Bottom Right) */}
      <AnimatedText 
        text="flowpilot.com"
        preset="fadeBlurIn"
        startFrame={50}
        anchor="bottom-right"
        offsetX={-40}
        offsetY={-40}
        fontSize={24}
        fontWeight={500}
        color="#E0F2FE"
      />
      
    </AbsoluteFill>
  );
};
