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

const ProductLogo: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [-20, 0]);

  // Exit animation (starts at frame 105)
  const exitProgress = spring({
    frame: frame - 105,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        opacity: opacity * exitOpacity,
        transform: `translateY(${translateY}px)`,
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          backgroundColor: '#3B82F6',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'white',
          fontSize: 20,
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        }}
      >
        212
      </div>
      <span
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: 'white',
          letterSpacing: '-1px',
          fontFamily,
        }}
      >
        testing <span style={{ color: '#3B82F6' }}>212</span>
      </span>
    </div>
  );
};

const Tagline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const text = "Simplify Complexity. Amplify Insights.";
  const startFrame = 30;
  
  const charsShown = Math.floor(
    interpolate(frame, [startFrame, startFrame + 40], [0, text.length], {
      extrapolateRight: 'clamp',
    })
  );

  // Exit animation (starts at frame 108, staggered by 3)
  const exitProgress = spring({
    frame: frame - 108,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 10]);

  return (
    <div
      style={{
        fontSize: 42,
        fontWeight: 600,
        color: 'white',
        textAlign: 'center',
        fontFamily,
        textShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
        opacity: exitOpacity,
        filter: `blur(${exitBlur}px)`,
        marginTop: 20,
      }}
    >
      {text.slice(0, charsShown)}
      <span
        style={{
          opacity: (frame / 10) % 2 < 1 ? 1 : 0,
          borderRight: '3px solid #3B82F6',
          marginLeft: 4,
        }}
      />
    </div>
  );
};

const UIPreview: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 50,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const rotateX = interpolate(entrance, [0, 1], [15, 5]);

  // Exit animation (starts at frame 111, staggered by 3)
  const exitProgress = spring({
    frame: frame - 111,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.9]);

  return (
    <div
      style={{
        width: '800px',
        height: '450px',
        background: '#09090B',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        transform: `perspective(1000px) rotateX(${rotateX}deg) scale(${scale * exitScale})`,
        opacity: opacity * exitOpacity,
        marginTop: 40,
      }}
    >
      {/* Browser Top Bar */}
      <div style={{ height: 32, background: '#18181B', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F56' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFBD2E' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27C93F' }} />
      </div>
      
      {/* UI Content */}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Pass Rate', value: '98%', color: '#10B981' },
            { label: 'Coverage', value: '95%', color: '#3B82F6' },
            { label: 'Duration', value: '2.4s', color: '#6366F1' },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, background: '#1A1A1A', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 4, fontFamily }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: stat.color, fontFamily }}>{stat.value}</div>
            </div>
          ))}
        </div>
        
        <div style={{ flex: 1, background: '#1A1A1A', borderRadius: 8, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 14, color: '#F4F4F5', marginBottom: 12, fontFamily, fontWeight: 600 }}>Latest Test Runs</div>
          {[1, 2, 3].map((_, i) => (
            <div key={i} style={{ height: 40, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              <div style={{ height: 8, width: 120, background: '#27272A', borderRadius: 4 }} />
              <div style={{ marginLeft: 'auto', height: 8, width: 60, background: '#27272A', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const IntroTesting212: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1A1A1A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ProductLogo frame={frame} fps={fps} />
      <Tagline frame={frame} fps={fps} />
      <UIPreview frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
