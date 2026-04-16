import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

const CallToActionButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Snappy but smooth button entrance
  const entrance = spring({
    frame: frame - 40,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Pulse effect to draw attention
  const pulse = Math.sin(frame / 10) * 0.03;
  const scale = entrance + (entrance > 0.9 ? pulse : 0);

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity: entrance,
        backgroundColor: '#8BC34A',
        padding: '18px 50px',
        borderRadius: '16px', // Modern slightly rounded corners
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        marginTop: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <span
        style={{
          color: 'white',
          fontSize: '32px',
          fontWeight: 700,
          fontFamily,
          letterSpacing: '-0.5px',
        }}
      >
        Get Started Free
      </span>
    </div>
  );
};

export const CtaGetStarted: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background entrance
  const bgScale = interpolate(frame, [0, 100], [1.1, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: 'clamp',
  });

  // Hero Text Animation (Smoother slide + fade)
  const textEntrance = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20 },
  });
  
  const textSlide = interpolate(textEntrance, [0, 1], [30, 0]);
  const textOpacity = interpolate(textEntrance, [0, 1], [0, 1]);

  // URL Animation (Staggered)
  const urlEntrance = spring({
    frame: frame - 25,
    fps,
    config: { damping: 20 },
  });
  
  const urlSlide = interpolate(urlEntrance, [0, 1], [20, 0]);
  const urlOpacity = interpolate(urlEntrance, [0, 1], [0, 1]);

  // Floating background elements for depth
  const floatY = Math.sin(frame / 30) * 15;

  return (
    <AbsoluteFill 
      style={{ 
        backgroundColor: '#09090B', // Sleek dark mode background
        fontFamily,
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Background */}
      <div
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          top: '-10%',
          left: '-10%',
          background: 'radial-gradient(circle at center, #1E293B 0%, #09090B 70%)',
          transform: `scale(${bgScale})`,
          opacity: 0.6,
        }}
      />
      
      {/* Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'rgba(139, 195, 74, 0.1)',
        filter: 'blur(100px)',
        top: '10%',
        left: '60%',
        transform: `translateY(${floatY}px)`,
      }} />

      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(48, 63, 159, 0.2)',
        filter: 'blur(80px)',
        bottom: '10%',
        right: '70%',
        transform: `translateY(${-floatY}px)`,
      }} />

      {/* Main Content Layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          zIndex: 10,
        }}
      >
        {/* Top Headline with Mask Reveal effect (simulated via slide + opacity) */}
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textSlide}px)`,
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '32px',
              fontWeight: 500,
              textAlign: 'center',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Join the future
          </div>
          <div
            style={{
              color: 'white',
              fontSize: '72px',
              fontWeight: 800,
              textAlign: 'center',
              letterSpacing: '-2px',
              marginTop: '10px',
              lineHeight: 1,
            }}
          >
            VoiceOS Assistant
          </div>
        </div>

        {/* Staggered Divider */}
        <div style={{
            width: interpolate(frame - 20, [0, 30], [0, 100], { extrapolateRight: 'clamp' }) + 'px',
            height: '4px',
            background: '#8BC34A',
            margin: '40px 0',
            borderRadius: '2px'
        }} />

        {/* Website URL */}
        <div
          style={{
            opacity: urlOpacity,
            transform: `translateY(${urlSlide}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: '48px',
              fontWeight: 300,
              fontFamily: 'monospace',
              opacity: 0.9,
            }}
          >
            www.voiceos.com
          </div>
          
          <CallToActionButton frame={frame} fps={fps} />
        </div>
      </div>

      {/* Footer Branding */}
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          width: '100%',
          textAlign: 'center',
          opacity: interpolate(frame, [60, 80], [0, 0.5], { extrapolateRight: 'clamp' }),
          color: 'white',
          fontSize: '18px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
        }}
      >
        Productivity Unleashed
      </div>
    </AbsoluteFill>
  );
};
