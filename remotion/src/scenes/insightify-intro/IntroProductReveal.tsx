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

const CONTAINER_STYLE: React.CSSProperties = {
  backgroundColor: '#1A237E',
  background: 'radial-gradient(circle, #5C6BC0 0%, #1A237E 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontFamily,
};

const MOCKUP_WIDTH = 800;
const MOCKUP_HEIGHT = 450;

export const IntroProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();

  // Timing constants
  const headlineStart = 10;
  const mockupStart = 40;
  const exitStart = 105;
  const exitDuration = 15;

  // Headline Animations
  const headlineSpring = spring({
    frame: frame - headlineStart,
    fps,
    config: { damping: 200 },
  });
  
  const headlineOpacity = interpolate(headlineSpring, [0, 1], [0, 1]);
  const headlineY = interpolate(headlineSpring, [0, 1], [-180, -150]);

  // Mockup Animations
  const mockupSpring = spring({
    frame: frame - mockupStart,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const mockupTranslateY = interpolate(mockupSpring, [0, 1], [150, 50]);
  const mockupOpacity = interpolate(mockupSpring, [0, 1], [0, 1]);
  const mockupScale = interpolate(mockupSpring, [0, 1], [0.8, 1]);

  // Exit Animation (Slide Right)
  const exitProgress = interpolate(
    frame,
    [exitStart, exitStart + exitDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const exitX = interpolate(exitProgress, [0, 1], [0, width]);

  return (
    <AbsoluteFill style={{ ...CONTAINER_STYLE, transform: `translateX(${exitX}px)` }}>
      {/* Headline */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          transform: `translateY(${headlineY}px)`,
          opacity: headlineOpacity,
          fontSize: '48px',
          fontWeight: 800,
          textAlign: 'center',
          width: '100%',
          padding: '0 40px',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        Introducing Insightify: Your Growth Engine
      </div>

      {/* Browser Mockup */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: MOCKUP_WIDTH,
          height: MOCKUP_HEIGHT,
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          opacity: mockupOpacity,
          transform: `translate(-50%, calc(-50% + ${mockupTranslateY}px)) scale(${mockupScale}) rotateX(2deg)`,
          perspective: '1000px',
        }}
      >
        {/* Browser Header */}
        <div style={{
          height: '40px',
          backgroundColor: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          padding: '0 15px',
          gap: '8px'
        }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
          <div style={{ 
            marginLeft: '20px', 
            height: '24px', 
            width: '400px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '10px'
          }}>
            insightify.app/dashboard
          </div>
        </div>

        {/* Dashboard Content Mockup */}
        <div style={{ flex: 1, padding: '25px', color: '#1f2937' }}>
          <div style={{ height: '20px', width: '150px', backgroundColor: '#d1d5db', marginBottom: '25px', borderRadius: '4px' }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '80px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px' }}>
                <div style={{ height: '10px', width: '50px', backgroundColor: '#e5e7eb', marginBottom: '10px', borderRadius: '2px' }} />
                <div style={{ height: '20px', width: '80px', backgroundColor: '#3b82f6', borderRadius: '4px' }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
             <div style={{ flex: 2, height: '150px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px' }}>
                <div style={{ height: '10px', width: '100px', backgroundColor: '#e5e7eb', marginBottom: '15px' }} />
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '100px' }}>
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <div key={i} style={{ flex: 1, backgroundColor: '#818cf8', height: `${h}%`, borderRadius: '2px' }} />
                  ))}
                </div>
             </div>
             <div style={{ flex: 1, height: '150px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px' }}>
                <div style={{ height: '10px', width: '60px', backgroundColor: '#e5e7eb', marginBottom: '15px' }} />
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '8px solid #3b82f6', margin: '0 auto' }} />
             </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
