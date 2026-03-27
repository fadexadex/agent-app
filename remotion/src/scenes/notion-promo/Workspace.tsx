import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence, Img } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

const BlockReveal: React.FC<{ startFrame: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ startFrame, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 }
  });

  const translateY = interpolate(progress, [0, 1], [30, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div style={{ transform: `translateY(${translateY}px)`, opacity, marginBottom: '24px', ...style }}>
      {children}
    </div>
  );
};

export const Workspace: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Window Entrance
  const windowEntrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 }
  });

  // Cursor Entrance & Click
  const cursorEntrance = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 }
  });
  
  const cursorClick = spring({
    frame: frame - 80,
    fps,
    config: { damping: 200 }
  });

  // Ripple
  const rippleProgress = spring({
    frame: frame - 80,
    fps,
    config: { damping: 200 }
  });

  // Window Exit
  const exitFrame = 100;
  const windowExit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 }
  });

  const winTranslateZ = interpolate(windowEntrance, [0, 1], [500, 0]) - interpolate(windowExit, [0, 1], [0, 300]);
  const winRotateX = interpolate(windowEntrance, [0, 1], [45, 5]) + interpolate(windowExit, [0, 1], [0, 15]);
  const winRotateY = interpolate(windowEntrance, [0, 1], [-30, -5]) - interpolate(windowExit, [0, 1], [0, 10]);
  const winOpacity = interpolate(windowEntrance, [0, 1], [0, 1]) - interpolate(windowExit, [0, 1], [0, 1]);
  const winBlur = interpolate(windowExit, [0, 1], [0, 10]);
  const winScale = interpolate(windowExit, [0, 1], [1, 0.8]);

  const cursorX = interpolate(cursorEntrance, [0, 1], [1200, 600]);
  const cursorY = interpolate(cursorEntrance, [0, 1], [800, 480]);
  const cursorScale = 1 - interpolate(cursorClick, [0, 0.5, 1], [0, 0.2, 0]) * (frame >= 80 ? 1 : 0);

  return (
    <AbsoluteFill style={{ backgroundColor: '#F7F7F5', fontFamily, display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: 1500 }}>
      
      {/* 3D Window */}
      <div style={{
        width: '800px',
        height: '600px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)',
        transform: `translateZ(${winTranslateZ}px) rotateX(${winRotateX}deg) rotateY(${winRotateY}deg) scale(${winScale})`,
        opacity: winOpacity,
        filter: `blur(${winBlur}px)`,
        padding: '60px 80px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        <BlockReveal startFrame={25}>
          <div style={{ fontSize: '48px', fontWeight: 700, color: '#37352F', letterSpacing: '-0.02em' }}>
            Q3 Roadmap
          </div>
        </BlockReveal>

        <BlockReveal startFrame={32}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
            <div style={{ fontSize: '24px', color: '#37352F', fontWeight: 500 }}>Finalize brand guidelines</div>
          </div>
        </BlockReveal>

        <BlockReveal startFrame={39}>
          <div style={{ 
            marginTop: '20px', 
            border: '1px solid rgba(0,0,0,0.05)', 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', backgroundColor: '#F9F9F8', borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '12px 16px', color: '#9CA3AF', fontSize: '14px', fontWeight: 500 }}>
              <div style={{ flex: 1 }}>Task</div>
              <div style={{ flex: 1 }}>Status</div>
            </div>
            <div style={{ display: 'flex', padding: '16px', backgroundColor: 'white', color: '#37352F', fontSize: '16px' }}>
              <div style={{ flex: 1 }}>Homepage Redesign</div>
              <div style={{ flex: 1 }}><span style={{ backgroundColor: '#E3E2E0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>In Progress</span></div>
            </div>
          </div>
        </BlockReveal>

        {/* Ripple Effect */}
        {frame >= 80 && (
          <div style={{
            position: 'absolute',
            left: '520px', // approximate coordinates of click within the window
            top: '420px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            transform: `scale(${interpolate(rippleProgress, [0, 1], [0, 3])}) translate(-50%, -50%)`,
            opacity: interpolate(rippleProgress, [0, 1], [1, 0]),
            pointerEvents: 'none'
          }} />
        )}
      </div>

      {/* Simulated Cursor */}
      <div style={{
        position: 'absolute',
        left: cursorX,
        top: cursorY,
        transform: `scale(${cursorScale})`,
        opacity: frame >= 50 && frame < exitFrame + 5 ? 1 : 0,
        pointerEvents: 'none',
        zIndex: 100
      }}>
        {/* Simple minimal SVG cursor */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 3.21V20.8C5.5 21.43 6.2 21.8 6.7 21.45L11.41 18.06C11.66 17.88 11.96 17.78 12.27 17.78H18.5C19.14 17.78 19.53 17.07 19.18 16.51L5.5 3.21Z" fill="#37352F" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </div>

    </AbsoluteFill>
  );
};
