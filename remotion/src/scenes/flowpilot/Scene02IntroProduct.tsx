import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Background } from '@/components/Global';
import { AnimatedText } from '@/components/AnimatedText';
import { MockupFrame } from '@/components/MockupFrame';

interface FlowPilotLogoProps {
  style?: React.CSSProperties;
}

const FlowPilotLogo: React.FC<FlowPilotLogoProps> = ({ style }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
      padding: '24px 48px',
      borderRadius: '32px',
      boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
      ...style
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12L2 22L12 12L2 2L22 12Z" fill="#38bdf8" />
        <path d="M12 12L22 12L12 2L12 12Z" fill="#7dd3fc" />
      </svg>
      <span style={{ color: 'white', fontSize: 40, fontWeight: 800, fontFamily: 'sans-serif', letterSpacing: '-0.02em' }}>
        FlowPilot
      </span>
    </div>
  );
};

export const Scene02IntroProduct: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // EXITS (Exit order: Mockup (86), Headline (93), Logo (100) - all slide downwards)
  const mockupExitProgress = spring({ frame: frame - 86, fps, config: { damping: 200 } });
  const headlineExitProgress = spring({ frame: frame - 93, fps, config: { damping: 200 } });
  const logoExitProgress = spring({ frame: frame - 100, fps, config: { damping: 200 } });

  // ENTRANCES
  // Logo scales in with a slight bounce
  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  
  // Mockup slides in from bottom-right and rotates
  const mockupEntranceProgress = spring({ frame: frame - 30, fps, config: { damping: 16, stiffness: 120 } });

  // Calculate Mockup Transformations
  const mockupTargetX = 200;
  const mockupTargetY = -100;
  const mockupStartX = 1200;
  const mockupStartY = 800;

  // Entrance interpolation
  const mockupEnterX = interpolate(mockupEntranceProgress, [0, 1], [mockupStartX, mockupTargetX]);
  const mockupEnterY = interpolate(mockupEntranceProgress, [0, 1], [mockupStartY, mockupTargetY]);
  
  const mockupRotateX = interpolate(mockupEntranceProgress, [0, 1], [45, 10]);
  const mockupRotateY = interpolate(mockupEntranceProgress, [0, 1], [-45, -15]);

  // Exit interpolation combined
  const mockupExitY = interpolate(mockupExitProgress, [0, 1], [0, 1200], { extrapolateRight: 'clamp' });
  
  const mockupFinalX = mockupEnterX;
  const mockupFinalY = mockupEnterY + mockupExitY;

  // Calculate Logo & Headline Exits
  const logoExitY = interpolate(logoExitProgress, [0, 1], [0, 1200], { extrapolateRight: 'clamp' });
  const headlineExitY = interpolate(headlineExitProgress, [0, 1], [0, 1200], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'solid', color: '#E0F7FA' }]} />

      {/* Browser Mockup (Backmost Layer) */}
      <AbsoluteFill style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          transform: `translate(${mockupFinalX}px, ${mockupFinalY}px) rotateX(${mockupRotateX}deg) rotateY(${mockupRotateY}deg)`,
          width: 800,
        }}>
          <MockupFrame
            type="browser"
            browserConfig={{ title: 'FlowPilot - Dashboard' }}
            theme="light"
          >
            <div style={{ width: '100%', height: 450, backgroundColor: '#ffffff' }} />
          </MockupFrame>
        </div>
      </AbsoluteFill>

      {/* Logo (Middle Layer) */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <FlowPilotLogo style={{ 
          transform: `translateY(${logoExitY}px) scale(${logoScale})` 
        }} />
      </AbsoluteFill>

      {/* Headline (Frontmost Layer) */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        transform: `translateY(${headlineExitY}px)` 
      }}>
        <AnimatedText
          text="Meet FlowPilot: Your AI Project Co-Pilot"
          preset="typewriter"
          startFrame={20}
          anchor="center"
          offsetY={120}
          fontSize={48}
          fontWeight={800}
          color="#0f172a"
        />
      </div>

    </AbsoluteFill>
  );
};
