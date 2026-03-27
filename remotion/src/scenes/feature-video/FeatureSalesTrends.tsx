import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';

// Helper component for the Feature Pill
interface FeaturePillProps {
  text: string;
  startFrame: number; // When the pill container starts appearing
  exitStartFrame: number; // When the pill container starts exiting
  pillColor?: string;
  textColor?: string;
  fontSize?: number;
}

const FeaturePill: React.FC<FeaturePillProps> = ({
  text,
  startFrame,
  exitStartFrame,
  pillColor = '#1A1A1A',
  textColor = '#FFFFFF',
  fontSize = 24,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation for the pill container (scale and fade in)
  const entryProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 }, // Snappy entrance
  });
  const entryScale = interpolate(entryProgress, [0, 1], [0.8, 1], { extrapolateRight: 'clamp' });
  const entryOpacity = interpolate(entryProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // Exit animation for the pill container (fade out)
  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });

  const finalOpacity = entryOpacity * exitOpacity; // Combine entry and exit opacity

  // Only render if within relevant frames to prevent unnecessary calculations
  if (finalOpacity <= 0.01 && frame > exitStartFrame) { // Check for opacity and ensure it's not before start
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: pillColor,
        borderRadius: 9999, // full rounded ends
        padding: '8px 24px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 300,
        height: 48,
        transform: `scale(${entryScale})`,
        opacity: finalOpacity,
      }}
    >
      <AnimatedText
        text={text}
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={startFrame + 15} // Stagger text slightly after pill appears to ensure pill is visible
        fontSize={fontSize}
        color={textColor}
      />
    </div>
  );
};


export const FeatureSalesTrends: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const sceneDurationFrames = 135;
  const sceneTransitionDuration = 15; // From spec: "blur", "duration": 15

  // Overall scene entrance (blur and fade in) for the entire content
  const sceneEntryProgress = spring({
    frame: frame, // Starts from frame 0
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const sceneOpacity = interpolate(sceneEntryProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  const sceneBlur = interpolate(sceneEntryProgress, [0, 1], [15, 0], { extrapolateRight: 'clamp' });

  // Exit frames based on scene duration and transition
  const mockupExitStartFrame = sceneDurationFrames - sceneTransitionDuration; // e.g., 135 - 15 = 120
  const pillExitStartFrame = mockupExitStartFrame - 3; // Staggered by 3 frames, e.g., 117

  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'solid', color: '#FFFFFF' }]} />

      {/* Main content wrapper for scene-level blur transition */}
      <div
        style={{
          opacity: sceneOpacity,
          filter: `blur(${sceneBlur}px)`,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center', // Centers children horizontally
          alignItems: 'center',    // Centers children vertically
          position: 'relative', // Crucial for absolutely positioning FeaturePill relative to this container
        }}
      >
        {/* Sales Dashboard Mockup */}
        <MockupFrame
          type="browser"
          preset="springIn" // Default entrance animation for the mockup
          anchor="center" // MockupFrame's anchor will make it centered within its parent's flow
          width={width * 0.7} // Responsive width, roughly 70% of video width
          height={height * 0.7} // Responsive height, roughly 70% of video height
          browserConfig={{ url: "https://your-dashboard.com/sales" }}
          exitPreset="slide-down" // Exit animation for MockupFrame
          exit={{
            startFrame: mockupExitStartFrame,
            duration: sceneTransitionDuration,
          }}
        >
          {/* Placeholder content for the browser mockup, mimicking a dashboard */}
          <div
            style={{
              flex: 1, // Take full space of MockupFrame
              backgroundColor: '#f8fafc', // Light background for dashboard content
              borderRadius: 8,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              alignItems: 'center',
              color: '#333',
            }}
          >
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 20, color: '#0F172A' }}>Total Sales</h2>
            <div style={{
              width: '90%',
              height: '40%',
              backgroundColor: '#e0e7ff', // Light blue for graph area
              borderRadius: 12,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              fontSize: 20,
              color: '#6366f1'
            }}>
              <span style={{opacity: 0.6}}>'''[Dynamic Line Graph Placeholder]'''</span>
            </div>
            <div style={{ display: 'flex', gap: 40, marginTop: 30 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 32, fontWeight: 600, color: '#10B981' }}>$1.2M</p>
                <p style={{ fontSize: 18, color: '#6B7280' }}>Revenue</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 32, fontWeight: 600, color: '#F59E0B' }}>$75</p>
                <p style={{ fontSize: 18, color: '#6B7280' }}>AOV</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 32, fontWeight: 600, color: '#EF4444' }}>3.5%</p>
                <p style={{ fontSize: 18, color: '#6B7280' }}>CR</p>
              </div>
            </div>
          </div>
        </MockupFrame>

        {/* Feature Pill (positioned absolutely relative to the main content wrapper div) */}
        <div
          style={{
            position: 'absolute',
            // Positioned to be slightly above and to the right of the centered mockup
            // Adjust these values based on visual preview
            top: `${height * 0.2}px`, // 20% from top
            right: `${width * 0.15}px`, // 15% from right
            zIndex: 10, // Ensure it's above the mockup
          }}
        >
          <FeaturePill
            text="Real-time Sales Tracking"
            startFrame={30} // Pill entry starts at frame 30
            exitStartFrame={pillExitStartFrame} // Pill exit starts at 117
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};