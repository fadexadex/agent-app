import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import { IrisTransition } from '@/components/Transitions'; 
import React from 'react';

// Define the custom FeaturePill component locally for this scene
interface FeaturePillProps {
  text: string;
  startFrame: number;
  exitStartFrame?: number;
  color?: string;
  textColor?: string;
  width?: number;
  height?: number;
  x?: string | number;
  y?: string | number;
}

const FeaturePill: React.FC<FeaturePillProps> = ({
  text,
  startFrame,
  exitStartFrame,
  color = '#1A1A1A',
  textColor = '#FFFFFF',
  width = 600,
  height = 90,
  x = '50%',
  y = 'bottom-center',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceDelay = startFrame;
  const exitDelay = exitStartFrame !== undefined ? exitStartFrame : startFrame + 60; // Default exit duration if not provided

  // Position calculation for absolute positioning with 'center' alignment
  const style: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: color,
    borderRadius: 999,
    padding: '15px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: width,
    height: height,
    textAlign: 'center',
  };

  if (x === 'center') {
    style.left = '50%';
    style.transform = `translateX(-50%) ${style.transform || ''}`;
  } else {
    style.left = x;
  }

  if (y === 'center') {
    style.top = '50%';
    style.transform = `${style.transform || ''} translateY(-50%)`;
  } else if (y === 'bottom-center') {
    style.bottom = 50; // Fixed distance from bottom
  } else {
    style.top = y;
  }

  return (
    <MotionContainer
      initial="offscreen-bottom"
      delay={entranceDelay}
      duration={30} // Entrance animation duration for the pill
      exit={exitStartFrame !== undefined ? 'slide-down' : undefined}
      exitStartFrame={exitDelay}
      style={style}
    >
      <AnimatedText
        text={text}
        preset="typewriter"
        startFrame={0} // Typewriter starts immediately once pill is visible
        color={textColor}
        fontSize={36}
        fontWeight={700}
        animationUnit="character"
        stagger={1}
      />
    </MotionContainer>
  );
};


interface CustomerSegmentsSceneProps {
  // Define any configurable props if needed
}

export const CustomerSegmentsScene: React.FC<CustomerSegmentsSceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const transitionDuration = 15; // Duration for IrisTransition

  // Element Timings (relative to scene start)
  const headingEntryStart = 0;
  const headingExitStart = 115; // Exits last

  const mockupEntryStart = 40;
  const mockupExitStart = 100; // Exits after pill, before heading

  const pillEntryStart = 80;
  const pillExitStart = 90; // Exits first

  return (
    <AbsoluteFill style={{ backgroundColor: '#A99DFE' }}>
      <Background layers={[{ type: 'solid', color: '#A99DFE' }]} />

      {/* Iris Transition for scene entrance */}
      <Sequence from={0} durationInFrames={transitionDuration}>
        <IrisTransition mode="enter" startFrame={0} duration={transitionDuration} color="#FFFFFF" />
      </Sequence>

      {/* Main content, delayed by transition */}
      <Sequence from={transitionDuration} durationInFrames={135 - transitionDuration} premountFor={fps}>
        <AbsoluteFill>
          {/* Feature 2 Heading */}
          <AnimatedText
            text="Understand Your Customers Deeply"
            preset="typewriter"
            startFrame={headingEntryStart} // Relative to Sequence start
            anchor="top-center"
            offsetY={60}
            fontSize={56}
            fontWeight={700}
            color="#FFFFFF"
            animationUnit="character"
            stagger={1}
            exit={{
              startFrame: headingExitStart - transitionDuration, // Relative to Sequence start
              opacity: { from: 1, to: 0, duration: 20 },
              blur: { from: 0, to: 10, duration: 20 },
            }}
          />

          {/* Dashboard Mockup */}
          <MockupFrame
            type="browser"
            preset="slideUp"
            startFrame={mockupEntryStart - transitionDuration} // Relative to Sequence start
            exitPreset="slideDown"
            exitStartFrame={mockupExitStart - transitionDuration} // Relative to Sequence start
            theme="dark"
            width={width * 0.7}
            height={height * 0.6}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            {/* Content inside the mockup */}
            <AbsoluteFill style={{ padding: 30, backgroundColor: '#1E1E1E', borderRadius: 8, overflow: 'hidden' }}>
              <AnimatedText
                text={"New Customers: 60%\nReturning Customers: 40%\nAvg LTV: $250\nSegments: High-Value, Repeat, Engaged"}
                preset="typewriter"
                startFrame={0} // Starts immediately once mockup is visible
                color="#E0E0E0"
                fontSize={28}
                fontWeight={500}
                animationUnit="line"
                stagger={5}
                anchor="top-left"
                offsetX={20}
                offsetY={20}
              />
            </AbsoluteFill>
          </MockupFrame>

          {/* Feature Pill */}
          <FeaturePill
            text="Actionable Customer Insights & LTV"
            startFrame={pillEntryStart - transitionDuration} // Relative to Sequence start
            exitStartFrame={pillExitStart - transitionDuration} // Relative to Sequence start
            color="#1A1A1A"
            textColor="#FFFFFF"
            width={width * 0.5}
            height={height * 0.1}
            x="center"
            y="bottom-center"
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
