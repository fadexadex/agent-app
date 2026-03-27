import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Using system fonts to ensure render stability and bypass network issues
const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const BrowserMockup: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20 },
    durationInFrames: 30,
  });

  const exitFrame = 145 - 20;
  const exitProgress = interpolate(
    frame,
    [exitFrame, exitFrame + 15],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const translateY = interpolate(entrance, [0, 1], [100, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const blur = interpolate(exitProgress, [0, 1], [0, 20]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <div
      style={{
        width: '80%',
        height: '55%',
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        position: 'absolute',
        top: '22%',
        left: '10%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: `translateY(${translateY}px) scale(${1 - exitProgress * 0.05})`,
        opacity: opacity * exitOpacity,
        filter: `blur(${blur}px)`,
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div style={{
        height: 35,
        backgroundColor: '#f1f3f4',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 6
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#27c93f' }} />
      </div>
      
      <div style={{ flex: 1, padding: 25, display: 'flex', flexDirection: 'column', gap: 15 }}>
        <div style={{ height: 12, width: '30%', backgroundColor: '#f0f0f0', borderRadius: 4 }} />
        <div style={{ display: 'flex', gap: 15 }}>
          <div style={{ flex: 1, height: 100, border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
             <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontFamily }}>Customer LTV</div>
             <div style={{ fontSize: 24, fontWeight: 'bold', color: '#111', fontFamily }}>$4,280</div>
          </div>
          <div style={{ flex: 1, height: 100, border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
             <div style={{ fontSize: 12, color: '#999', marginBottom: 8, fontFamily }}>Churn Rate</div>
             <div style={{ fontSize: 24, fontWeight: 'bold', color: '#27c93f', fontFamily }}>-2.4%</div>
          </div>
        </div>
        <div style={{ flex: 1, border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
           <div style={{ height: 10, width: '50%', backgroundColor: '#f5f5f5', borderRadius: 4, marginBottom: 8 }} />
           <div style={{ height: 10, width: '90%', backgroundColor: '#fafafa', borderRadius: 4, marginBottom: 8 }} />
           <div style={{ height: 10, width: '70%', backgroundColor: '#fafafa', borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
};

const PulsingIndicator: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const startFrame = 40;
  if (frame < startFrame) return null;

  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12 },
  });

  const exitFrame = 145 - 25;
  const exitProgress = interpolate(
    frame,
    [exitFrame, exitFrame + 15],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const pulse = Math.sin((frame - startFrame) / 6) * 0.15 + 1;
  const opacity = interpolate(entrance, [0, 1], [0, 1]) * (1 - exitProgress);
  const blur = interpolate(exitProgress, [0, 1], [0, 10]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '43%',
        left: '26%',
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '3px solid #FBC02D',
        boxShadow: '0 0 15px rgba(251, 192, 45, 0.4)',
        transform: `translate(-50%, -50%) scale(${entrance * pulse})`,
        opacity,
        filter: `blur(${blur}px)`,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: '#FBC02D',
      }} />
    </div>
  );
};

const Headline: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const startFrame = 10;
  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  const exitFrame = 145 - 15;
  const exitProgress = interpolate(
    frame,
    [exitFrame, exitFrame + 15],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const opacity = interpolate(entrance, [0, 1], [0, 1]) * (1 - exitProgress);
  const translateY = interpolate(entrance, [0, 1], [15, 0]);
  const blur = interpolate(exitProgress, [0, 1], [0, 15]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        width: '100%',
        textAlign: 'center',
        fontFamily,
        fontSize: 52,
        fontWeight: 'bold',
        color: '#33691E',
        opacity,
        transform: `translateY(${translateY}px)`,
        filter: `blur(${blur}px)`,
        padding: '0 40px',
      }}
    >
      Understand your most valuable customers
    </div>
  );
};

const Subtext: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const startFrame = 90;
  const text = "Drive repeat purchases with targeted insights";
  
  const charCount = Math.floor(interpolate(frame, [startFrame, startFrame + 25], [0, text.length], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp'
  }));

  const exitFrame = 145 - 30;
  const exitProgress = interpolate(
    frame,
    [exitFrame, exitFrame + 15],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const opacity = (frame >= startFrame ? 1 : 0) * (1 - exitProgress);
  const blur = interpolate(exitProgress, [0, 1], [0, 15]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 70,
        width: '100%',
        textAlign: 'center',
        fontFamily,
        fontSize: 28,
        fontWeight: 'normal',
        color: '#558B2F',
        opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      {text.slice(0, charCount)}
      {charCount < text.length && <span style={{ opacity: Math.sin(frame / 2) > 0 ? 1 : 0 }}>|</span>}
    </div>
  );
};

export const CustomerLTV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const swipeUp = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 15,
  });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#F0F4C3',
      transform: `translateY(${100 - swipeUp * 100}%)`,
    }}>
      <Headline frame={frame} fps={fps} />
      <BrowserMockup frame={frame} fps={fps} />
      <PulsingIndicator frame={frame} fps={fps} />
      <Subtext frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

export default CustomerLTV;
