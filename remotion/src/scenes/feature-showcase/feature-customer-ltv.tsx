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

// --- Sub-components ---

const BrowserMockup: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 20,
    fps,
    config: { damping: 20 },
  });

  const translateY = interpolate(entrance, [0, 1], [100, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  const exitFrame = 130; // Staggered: sub(120), ind(125), mockup(130), main(135)
  const exitProgress = interpolate(frame, [exitFrame, exitFrame + 10], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 20]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <div
      style={{
        width: '80%',
        height: '60%',
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transform: `translateY(${translateY}px)`,
        opacity: opacity * exitOpacity,
        filter: `blur(${exitBlur}px)`,
        position: 'relative',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Browser Header */}
      <div style={{
        height: 40,
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        padding: '0 15px',
        gap: 8
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: ['#ff5f56', '#ffbd2e', '#27c93f'][i] }} />
        ))}
      </div>
      
      {/* Dashboard Content Mock */}
      <div style={{ flex: 1, padding: 30, display: 'flex', gap: 20 }}>
        <div style={{ flex: 1, backgroundColor: '#f0f2f5', borderRadius: 8, padding: 20 }}>
          <div style={{ height: 20, width: '60%', backgroundColor: '#e0e0e0', marginBottom: 20 }} />
          <div style={{ height: 100, width: '100%', backgroundColor: '#e0e0e0', borderRadius: 4 }} />
        </div>
        <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ height: 80, backgroundColor: '#E1F5FE', borderRadius: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: '#01579B' }}>Avg LTV</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#01579B' }}>$2,450</div>
          </div>
          <div style={{ height: 80, backgroundColor: '#F3E5F5', borderRadius: 8 }} />
          <div style={{ height: 80, backgroundColor: '#E8F5E9', borderRadius: 8 }} />
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

  const pulse = Math.sin((frame - startFrame) * 0.1) * 0.1 + 1;
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  
  const exitFrame = 125;
  const exitProgress = interpolate(frame, [exitFrame, exitFrame + 10], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 20]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        right: '18%',
        width: 60,
        height: 60,
        borderRadius: '50%',
        border: '4px solid #01579B',
        backgroundColor: 'rgba(1, 87, 155, 0.2)',
        transform: `scale(${entrance * pulse})`,
        opacity: opacity * exitOpacity,
        filter: `blur(${exitBlur}px)`,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
};

const AnimatedText: React.FC<{
  text: string;
  frame: number;
  fps: number;
  start: number;
  exitFrame: number;
  style: React.CSSProperties;
  typewriter?: boolean;
}> = ({ text, frame, fps, start, exitFrame, style, typewriter }) => {
  const entrance = spring({
    frame: frame - start,
    fps,
    config: { damping: 200 },
  });

  const exitProgress = interpolate(frame, [exitFrame, exitFrame + 10], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 20]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  let displayText = text;
  if (typewriter) {
    const chars = Math.floor(interpolate(frame, [start, start + text.length * 1.5], [0, text.length], { extrapolateRight: 'clamp' }));
    displayText = text.slice(0, chars);
  }

  const opacity = typewriter ? 1 : entrance;
  const translateY = typewriter ? 0 : interpolate(entrance, [0, 1], [20, 0]);

  return (
    <div
      style={{
        ...style,
        opacity: opacity * exitOpacity,
        transform: `translateY(${translateY}px)`,
        filter: `blur(${exitBlur}px)`,
        fontFamily,
      }}
    >
      {displayText}
    </div>
  );
};

// --- Main Scene ---

export const CustomerLTV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Swipe Up Transition (Entry)
  const introDuration = 15;
  const introProgress = spring({
    frame,
    fps,
    durationInFrames: introDuration,
    config: { damping: 200 },
  });
  const introY = interpolate(introProgress, [0, 1], [height, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#F0F4C3', overflow: 'hidden', transform: `translateY(${introY}px)` }}>
      
      {/* Main Headline */}
      <div style={{ position: 'absolute', top: 80, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <AnimatedText
          text="Understand your most valuable customers"
          frame={frame}
          fps={fps}
          start={10}
          exitFrame={135}
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: '#1a1a1a',
            textAlign: 'center',
            maxWidth: '80%',
          }}
        />
      </div>

      {/* Mockup Center */}
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', top: 40 }}>
        <BrowserMockup frame={frame} fps={fps} />
        <PulsingIndicator frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* Subtext Bottom */}
      <div style={{ position: 'absolute', bottom: 100, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <AnimatedText
          text="Drive repeat purchases with targeted insights"
          frame={frame}
          fps={fps}
          start={90}
          exitFrame={120}
          typewriter
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: '#444',
            textAlign: 'center',
          }}
        />
      </div>

    </AbsoluteFill>
  );
};

export default CustomerLTV;
