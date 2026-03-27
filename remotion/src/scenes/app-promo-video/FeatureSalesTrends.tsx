import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Background } from "@/components/Global";
import { MockupFrame } from "@/components/MockupFrame";
import { MotionContainer } from "@/components/Layout";
import { AnimatedText } from "@/components/AnimatedText";

interface FeatureSalesTrendsProps {}

export const FeatureSalesTrends: React.FC<FeatureSalesTrendsProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timing constants
  const pillEntryDelay = 10;
  const pillEntryDuration = 20;
  const textTypewriterStartFrame = pillEntryDelay + 10; // Text starts 10 frames after pill entry begins

  const pillExitStartFrame = 120;
  const pillExitDuration = 15;
  const mockupExitStartFrame = pillExitStartFrame + 3; // Stagger by 3 frames
  const mockupExitDuration = 15;

  const sceneBlurStartFrame = 120; // Overall scene blur starts with first element exit
  const sceneBlurDuration = 15;

  // Overall scene blur animation
  const sceneBlur = interpolate(
    frame,
    [sceneBlurStartFrame, sceneBlurStartFrame + sceneBlurDuration],
    [0, 10], // Blur from 0 to 10px
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF', filter: `blur(${sceneBlur}px)` }}>
      <Background layers={[{ type: 'solid', color: '#FFFFFF' }]} />

      {/* Sales Dashboard Mockup */}
      <MotionContainer
        initial="scale-zero"
        delay={0}
        duration={30} // Duration for entry animation
        exit="fade-out"
        exitStartFrame={mockupExitStartFrame}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)', // Center the MotionContainer
          transformOrigin: 'center center',
          width: width * 0.7, // Set desired size for the mockup within MotionContainer
          height: height * 0.6,
        }}
      >
        <MockupFrame
          type="browser"
          width="100%" // MockupFrame takes up 100% of MotionContainer's size
          height="100%"
          glass={{ blur: 5, opacity: 0.15 }}
          glare
          theme="dark"
        >
          {/* Placeholder for dashboard content */}
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#1C1C1E', // Dark background for dashboard
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A0A0A0',
              fontSize: 24,
            }}
          >
            <span style={{ opacity: 0.7 }}>Sales Dashboard Placeholder</span>
          </div>
        </MockupFrame>
      </MotionContainer>

      {/* Real-time Sales Tracking Feature Label (Pill) */}
      <MotionContainer
        initial="offscreen-top"
        delay={pillEntryDelay}
        duration={pillEntryDuration}
        exit="slide-up"
        exitStartFrame={pillExitStartFrame}
        style={{
          position: 'absolute',
          right: width * 0.1,
          top: height * 0.15,
          zIndex: 10,
          backgroundColor: '#1A1A1A',
          borderRadius: 9999,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Calculated min-width based on content and padding
          minWidth: 'fit-content', // Let content dictate width
          height: 48,
          transform: 'translateY(-50%)', // Vertically center on its 'top' position
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)' // Add a subtle shadow
        }}
      >
        <AnimatedText
          text="Real-time Sales Tracking"
          preset="typewriter"
          startFrame={textTypewriterStartFrame}
          animationUnit="character"
          stagger={1}
          color="#FFFFFF"
          fontSize={24}
          fontWeight={600}
          style={{ whiteSpace: 'nowrap' }}
          exit={{
            startFrame: pillExitStartFrame,
            opacity: { from: 1, to: 0, duration: pillExitDuration * 0.7 },
            blur: { from: 0, to: 5, duration: pillExitDuration * 0.7 },
          }}
        />
      </MotionContainer>
    </AbsoluteFill>
  );
};