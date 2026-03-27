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

// --- Components ---

const FeaturePill: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20 },
  });

  const exit = spring({
    frame: frame - 130,
    fps,
    config: { damping: 200 },
  });

  const translateY = interpolate(entrance, [0, 1], [-100, 0]);
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const opacity = entrance - exit;

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px) scale(${scale})`,
        backgroundColor: '#333333',
        color: 'white',
        padding: '12px 32px',
        borderRadius: '24px',
        fontSize: '24px',
        fontWeight: 600,
        fontFamily,
        opacity,
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        zIndex: 10,
      }}
    >
      Real-time Sales Insights
    </div>
  );
};

const BrowserMockup: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const exit = spring({
    frame: frame - 135,
    fps,
    config: { damping: 200 },
  });

  const translateY = interpolate(entrance, [0, 1], [800, 0]);
  const opacity = entrance - exit;

  // Internal Dashboard Animations
  const contentLoad = spring({
    frame: frame - 25,
    fps,
    config: { damping: 200 },
  });

  const salesValue = Math.round(interpolate(contentLoad, [0, 1], [0, 128450]));

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        right: '10%',
        height: '65%',
        backgroundColor: 'white',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        transform: `translateY(${translateY}px) perspective(1000px) rotateX(2deg)`,
        opacity,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily,
      }}
    >
      {/* Browser Header */}
      <div style={{
        height: '40px',
        backgroundColor: '#f1f1f1',
        display: 'flex',
        alignItems: 'center',
        padding: '0 15px',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
        </div>
      </div>

      {/* Dashboard Content */}
      <div style={{ flex: 1, padding: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* KPI Card */}
        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px' }}>
            <div style={{ 
                flex: 1, 
                padding: '20px', 
                borderRadius: '12px', 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0',
                opacity: contentLoad
            }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Total Sales</div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a' }}>
                    ${salesValue.toLocaleString()}
                </div>
                <div style={{ color: '#10b981', fontSize: '14px', marginTop: '4px' }}>↑ 12.5% vs last month</div>
            </div>
            <div style={{ 
                flex: 1, 
                padding: '20px', 
                borderRadius: '12px', 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0',
                opacity: contentLoad
            }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Active Users</div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a' }}>
                    {Math.round(salesValue / 100).toLocaleString()}
                </div>
                <div style={{ color: '#10b981', fontSize: '14px', marginTop: '4px' }}>↑ 8.2% growth</div>
            </div>
        </div>

        {/* Charts Section */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', height: '200px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '15px' }}>Daily Revenue</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px' }}>
                {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1].map((h, i) => {
                    const barHeight = interpolate(contentLoad, [0, 1], [0, h * 100]);
                    return (
                        <div key={i} style={{ 
                            flex: 1, 
                            backgroundColor: '#3b82f6', 
                            height: `${barHeight}%`,
                            borderRadius: '4px 4px 0 0'
                        }} />
                    )
                })}
            </div>
        </div>

        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', height: '200px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '15px' }}>Top Products</div>
            {[1, 2, 3].map((i) => {
                const width = interpolate(contentLoad, [0, 1], [0, 100 - (i * 15)]);
                return (
                    <div key={i} style={{ marginBottom: '12px' }}>
                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', width: '100%' }}>
                            <div style={{ height: '100%', background: '#10b981', borderRadius: '4px', width: `${width}%` }} />
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export const SalesOverviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scene-wide fade transition
  const opacity = interpolate(
    frame,
    [0, 10, durationInFrames - 10, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ 
        background: 'linear-gradient(180deg, #E0F7F0 0%, #C7E6D6 100%)',
        opacity,
    }}>
      <BrowserMockup frame={frame} fps={fps} />
      <FeaturePill frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

export default SalesOverviewScene;
