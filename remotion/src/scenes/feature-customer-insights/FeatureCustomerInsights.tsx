import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

const FPS = 30;

// --- Sub-components ---

const DashboardMockup: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  // Entrance: Slide in from top
  const entrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20 },
  });
  const translateY = interpolate(entrance, [0, 1], [-600, 0]);
  
  // Exit: Slide out to top
  const exitFrame = 135;
  const exitProgress = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitTranslateY = interpolate(exitProgress, [0, 1], [0, -800]);

  // Content Animations
  const contentSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12 },
  });

  return (
    <div
      style={{
        width: 900,
        height: 600,
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        transform: `translateY(${translateY + exitTranslateY}px)`,
        display: 'flex',
        flexDirection: 'column',
        fontFamily,
      }}
    >
      {/* Browser Header */}
      <div style={{ height: 40, backgroundColor: '#f1f1f1', display: 'flex', alignItems: 'center', padding: '0 15px', gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27c93f' }} />
      </div>
      
      {/* Dashboard Content */}
      <div style={{ padding: 30, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1 }}>
        {/* Left Column: Segments & LTV */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8, flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 15, fontSize: 18, color: '#333' }}>Customer Segments</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px' }}>
              {/* Animated Pie Chart Simulation */}
              <div style={{ 
                width: 120, 
                height: 120, 
                borderRadius: '50%', 
                background: `conic-gradient(#6366f1 0% ${contentSpring * 40}%, #10b981 ${contentSpring * 40}% ${contentSpring * 75}%, #f59e0b ${contentSpring * 75}% 100%)`,
                transform: `scale(${contentSpring})`
              }} />
            </div>
            <div style={{ marginTop: 15, fontSize: 12, color: '#666', display: 'flex', gap: 10 }}>
              <span>● New</span> <span>● Loyal</span> <span>● At-Risk</span>
            </div>
          </div>
          
          <div style={{ padding: 20, backgroundColor: '#6366f1', color: 'white', borderRadius: 8 }}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Customer Lifetime Value</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 5 }}>
              ${interpolate(contentSpring, [0, 1], [0, 12450]).toFixed(0)}
            </div>
          </div>
        </div>

        {/* Right Column: Churn & Top Customers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <div style={{ padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8, flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 16, color: '#333' }}>Top Customers</div>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0', 
                  borderBottom: '1px solid #eee',
                  opacity: contentSpring,
                  transform: `translateX(${interpolate(contentSpring, [0, 1], [-20, 0])}px)`
                }}>
                  <span style={{ fontSize: 14, color: '#444' }}>Customer #{i * 12}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>${(5000 / i).toFixed(0)}</span>
                </div>
              ))}
           </div>
           
           <div style={{ padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 16, color: '#333' }}>Churn Rate</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: 60, gap: 8 }}>
                {[0.4, 0.7, 0.5, 0.9, 0.3, 0.6].map((h, i) => (
                  <div key={i} style={{ 
                    flex: 1, 
                    backgroundColor: '#ef4444', 
                    borderRadius: '4px 4px 0 0',
                    height: `${h * 100 * contentSpring}%` 
                  }} />
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const FeaturePill: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  // Entrance: Scale in from bottom
  const entrance = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  
  // Exit: Scale out
  const exitFrame = 130;
  const exitProgress = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });

  const scale = entrance - exitProgress;
  const translateY = interpolate(entrance, [0, 1], [100, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        backgroundColor: '#333333',
        color: 'white',
        padding: '14px 32px',
        borderRadius: 100,
        fontSize: 22,
        fontWeight: 500,
        fontFamily,
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: interpolate(scale, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' }),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      Understand Your Customers Deeper
    </div>
  );
};

// --- Main Scene ---

export const FeatureCustomerInsights: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Scene Transition: Fade in at start, Fade out at end
  const sceneOpacity = interpolate(
    frame,
    [0, 10, 140, 150],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F7E0F0',
        background: 'linear-gradient(135deg, #F7E0F0 0%, #E6C7D6 100%)',
        opacity: sceneOpacity,
      }}
    >
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ transform: 'translateY(20px)' }}>
          <DashboardMockup frame={frame} />
        </div>
      </AbsoluteFill>
      
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FeaturePill frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
