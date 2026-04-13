import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// --- Components ---

const FeaturePill: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const translateY = interpolate(entrance, [0, 1], [20, 0]);

  // Exit animation (staggered)
  const exitFrame = 130;
  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: `translateX(-50%) scale(${scale}) translateY(${translateY}px)`,
        opacity: opacity * exitOpacity,
        backgroundColor: '#6A1B9A',
        padding: '12px 30px',
        borderRadius: '50px',
        color: 'white',
        fontSize: '24px',
        fontWeight: 600,
        boxShadow: '0 10px 30px rgba(106, 27, 154, 0.3)',
        fontFamily,
        zIndex: 10,
      }}
    >
      {text}
    </div>
  );
};

const BrowserMockup: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const translateY = interpolate(entrance, [0, 1], [100, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const rotateX = interpolate(entrance, [0, 1], [5, 0]);

  // Exit animation (staggered)
  const exitFrame = 133;
  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 160,
        left: '10%',
        width: '80%',
        height: '600px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        opacity: opacity * exitOpacity,
        transform: `translateY(${translateY}px) perspective(1000px) rotateX(${rotateX}deg)`,
        fontFamily,
      }}
    >
      {/* Browser Header */}
      <div style={{ height: '40px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 15px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
        </div>
      </div>

      {/* Dashboard Content */}
      <div style={{ padding: '30px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 20px 0', color: '#111827' }}>Sales Overview</h2>
        
        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          {[
            { label: 'Total Sales', value: '$124,592', change: '+12.5%', pos: true },
            { label: 'AOV', value: '$84.20', change: '-2.1%', pos: false },
            { label: 'Orders', value: '1,480', change: '+8.4%', pos: true }
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>{stat.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: stat.pos ? '#10b981' : '#ef4444', marginTop: '5px' }}>{stat.change} vs last month</div>
            </div>
          ))}
        </div>

        {/* Revenue Trend Graph (Simulated) */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #f3f4f6', height: '240px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Revenue Trend</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '140px', paddingBottom: '20px' }}>
            {[40, 60, 45, 80, 70, 90, 100, 85, 95, 110, 105, 120].map((h, i) => {
                const barSpring = spring({
                    frame: frame - (startFrame + 40 + (i * 2)),
                    fps,
                    config: { damping: 20 }
                });
                return (
                    <div key={i} style={{ 
                        flex: 1, 
                        background: '#6A1B9A', 
                        height: `${h * barSpring}%`, 
                        borderRadius: '4px 4px 0 0',
                        opacity: 0.8 
                    }} />
                )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Subtitle: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(' ');
  
  // Exit animation (staggered)
  const exitFrame = 136;
  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        width: '100%',
        textAlign: 'center',
        fontSize: '32px',
        color: '#374151',
        fontFamily,
        opacity: exitOpacity,
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * 5;
        const opacity = interpolate(frame, [wordStart, wordStart + 10], [0, 1], {
          extrapolateRight: 'clamp',
        });
        const translateY = interpolate(frame, [wordStart, wordStart + 10], [10, 0], {
          extrapolateRight: 'clamp',
        });

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '8px',
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const SalesPerformanceTracker: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      <FeaturePill text="Real-time Sales Performance" startFrame={10} />
      <BrowserMockup startFrame={30} />
      <Subtitle text="Track every dollar and order in real-time." startFrame={80} />
    </AbsoluteFill>
  );
};

export default SalesPerformanceTracker;
