import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';

// FeaturePill component - a simple styled pill that wraps AnimatedText for typewriter
const FeaturePillContent: React.FC<{ text: string; startFrame: number; exitStartFrame?: number }> = ({ text, startFrame, exitStartFrame }) => {
  return (
    <div
      style={{
        backgroundColor: '#1A1A1A',
        color: 'white',
        padding: '12px 24px',
        borderRadius: 999,
        fontSize: 24,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      <AnimatedText
        text={text}
        preset="typewriter"
        startFrame={startFrame}
        animationUnit="character"
        stagger={0.5}
        fontSize={24}
        fontWeight={600}
        color="white"
        exit={{
          startFrame: exitStartFrame, // Relative to AnimatedText's own internal frame
          opacity: { from: 1, to: 0, duration: 15 },
        }}
      />
    </div>
  );
};


export const Scene03RevenueInsights: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const durationFrames = 135; // Total scene duration

  // Scene-wide fly-in transition (duration 15 frames)
  // This will affect all content inside the main div.
  const sceneEntranceDuration = 15;
  const sceneFlyInProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const sceneTranslateY = interpolate(sceneFlyInProgress, [0, 1], [height * 0.5, 0], { extrapolateRight: 'clamp' }); // Fly in from bottom
  const sceneOpacity = interpolate(sceneFlyInProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });


  // Calculate exit frames for elements based on notes: pill, then mockup, then heading
  // Total duration: 135 frames
  // Exit duration for each element: 15-20 frames

  const headingExitStartFrame = durationFrames - 15; // Heading exits from 120-135
  const mockupExitStartFrame = durationFrames - 25; // Mockup exits from 110-130 (20 frames)
  const pillExitStartFrame = durationFrames - 40; // Pill exits from 95-115 (20 frames)


  // Element 1: Feature Heading
  const headingStartFrame = 0; // Appears immediately at scene start
  const headingText = "Unlock Real-time Revenue Trends";


  // Element 2: Mockup (Browser with Stripe Dashboard)
  const mockupEntryStartFrame = 15; // Mockup slides in after heading starts
  const mockupEntryDuration = 30; // Slide in duration
  const mockupTextStartFrame = 40; // Typewriter for mockup content starts
  const mockupTextContent = "Revenue: +15% WoW\nSales: $12,345\nAvg Order Value: $75\nConversion Rate: 2.1%";

  // Element 3: Feature Pill
  const pillEntryStartFrame = 80; // Feature pill animates in last
  const pillEntryDuration = 30; // Slide in duration
  const pillTextContent = "Instant Sales Data & Growth Metrics";


  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      <Background
        layers={[
          {
            type: 'linear',
            colors: ['#7E6BFD', '#A99DFE'],
            angle: 90,
          },
        ]}
      />

      {/* Apply scene-wide fly-in effect to all content */}
      <div style={{ transform: `translateY(${sceneTranslateY}px)`, opacity: sceneOpacity }}>
        {/* Element 1: Feature Heading */}
        <Sequence from={headingStartFrame} durationInFrames={headingExitStartFrame - headingStartFrame + 30}>
          <AnimatedText
            text={headingText}
            preset="typewriter"
            startFrame={0} // Relative to Sequence start
            animationUnit="character"
            stagger={1}
            anchor="top-center"
            offsetY={60}
            fontSize={60}
            fontWeight={700}
            color="white"
            style={{ zIndex: 3 }}
            exit={{
              startFrame: headingExitStartFrame - headingStartFrame, // Relative to Sequence start
              opacity: { from: 1, to: 0, duration: 15 },
              scale: { from: 1, to: 0.8, duration: 15 }
            }}
          />
        </Sequence>


        {/* Element 2: Mockup Frame (Browser with Stripe Dashboard) */}
        <Sequence from={mockupEntryStartFrame} durationInFrames={mockupExitStartFrame - mockupEntryStartFrame + 30}>
          <MotionContainer
            initial="offscreen-right"
            delay={0} // Relative to Sequence start
            duration={mockupEntryDuration}
            exit="slide-right"
            exitStartFrame={mockupExitStartFrame - mockupEntryStartFrame}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
            }}
          >
            <MockupFrame
              type="browser"
              theme="dark"
              width={800}
              height={500}
              glass={{ blur: 10, opacity: 0.1 }}
              glare
              rotate={{
                startAngle: { x: 0, y: 10 },
                endAngle: { x: 0, y: 0 },
                startFrame: 0, // Relative to MotionContainer's internal frame
                endFrame: mockupEntryDuration,
              }}
              style={{
                boxShadow: '0px 20px 50px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Content for the browser mockup - using AnimatedText for typewriter effect */}
              <div
                style={{
                  padding: 20,
                  backgroundColor: '#1A1A1A',
                  color: '#FAFAFA',
                  fontFamily: 'monospace',
                  fontSize: 20,
                  width: '100%',
                  height: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'left',
                  lineHeight: 1.4,
                }}
              >
                <AnimatedText
                  text={mockupTextContent}
                  preset="typewriter"
                  startFrame={mockupTextStartFrame - mockupEntryStartFrame} // Relative to Sequence start
                  animationUnit="character"
                  stagger={0.5}
                  fontSize={24}
                  fontWeight={500}
                  color="#FAFAFA"
                  anchor="center"
                  style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}
                  exit={{
                    startFrame: mockupExitStartFrame - mockupEntryStartFrame - 10, // Exit text slightly before mockup frame
                    opacity: { from: 1, to: 0, duration: 15 },
                  }}
                />
              </div>
            </MockupFrame>
          </MotionContainer>
        </Sequence>

        {/* Element 3: Feature Pill */}
        <Sequence from={pillEntryStartFrame} durationInFrames={pillExitStartFrame - pillEntryStartFrame + 30}>
          <MotionContainer
            initial="offscreen-bottom"
            delay={0} // Relative to Sequence start
            duration={pillEntryDuration}
            exit="slide-down"
            exitStartFrame={pillExitStartFrame - pillEntryStartFrame}
            style={{
              position: 'absolute',
              bottom: 80,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 4
            }}
          >
            <FeaturePillContent
              text={pillTextContent}
              startFrame={0} // Relative to Sequence start
              exitStartFrame={pillExitStartFrame - pillEntryStartFrame - 10} // Text exits slightly before pill container
            />
          </MotionContainer>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};