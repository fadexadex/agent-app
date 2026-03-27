
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

interface IntroProjectPilotProps {}

export const IntroProjectPilot: React.FC<IntroProjectPilotProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Global scene fade in/out
  const globalFadeIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 15,
  });

  // Logo Pill entrance animation
  const logoPillEntryDelay = 20; // Starts at frame 20
  const logoPillScale = spring({
    frame: frame - logoPillEntryDelay,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const logoPillOpacity = interpolate(
    frame,
    [logoPillEntryDelay, logoPillEntryDelay + 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Logo Pill exit animation (ends by frame 135, staggered from text exits)
  const logoPillExitStartFrame = 129; // Individual exit starts
  const logoPillExitOpacity = interpolate(
    frame,
    [logoPillExitStartFrame, logoPillExitStartFrame + 15],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );
  const logoPillExitScale = interpolate(
    frame,
    [logoPillExitStartFrame, logoPillExitStartFrame + 15],
    [1, 0.5],
    { extrapolateRight: 'clamp' }
  );

  // MockupFrame entrance animation
  const mockupEntryDelay = 70; // Starts at frame 70
  const mockupScale = spring({
    frame: frame - mockupEntryDelay,
    fps,
    config: { damping: 200 },
  });
  const mockupOpacity = interpolate(
    frame,
    [mockupEntryDelay, mockupEntryDelay + 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // MockupFrame exit animation (ends by frame 135)
  const mockupExitStartFrame = 120;
  const mockupExitOpacity = interpolate(
    frame,
    [mockupExitStartFrame, mockupExitStartFrame + 15],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );


  return (
    <AbsoluteFill style={{ backgroundColor: '#F0F2F5' }}>
      <Background layers={[{ type: 'solid', color: '#F0F2F5' }]} />

      <MotionContainer
        initial="hidden"
        duration={15} // Global fade-in duration
        exit="fade-out"
        exitStartFrame={135} // Global fade-out starts at frame 135 (150 - 15)
        style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {/* Logo Pill - Custom Component */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${logoPillScale * (frame < logoPillExitStartFrame ? 1 : logoPillExitScale)})`,
            opacity: logoPillOpacity * (frame < logoPillExitStartFrame ? 1 : logoPillExitOpacity),
            backgroundColor: '#1E2B4B',
            borderRadius: 25,
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 20,
            fontWeight: 600,
            width: 180,
            height: 50,
            zIndex: 3, // Above text initially
            marginTop: '-180px', // Adjusted to match anchor="center", y: -180
          }}
        >
          {/* Assuming a simple text logo for now */}
          ProjectPilot AI
        </div>

        {/* Product Name */}
        <AnimatedText
          text="Meet ProjectPilot AI."
          preset="typewriter"
          animationUnit="character"
          stagger={1} // Speed 1 means stagger of 1 character per frame
          startFrame={30}
          anchor="center"
          offsetY={-120}
          fontSize={64}
          fontWeight={700}
          color="#333333"
          zIndex={2}
          exit={{
            startFrame: 123, // Individual exit starts
            opacity: { from: 1, to: 0, duration: 15 },
            blur: { from: 0, to: 5, duration: 15 },
          }}
        />

        {/* Tagline */}
        <AnimatedText
          text="Your intelligent project co-pilot."
          preset="typewriter"
          animationUnit="character"
          stagger={1} // Speed 1 means stagger of 1 character per frame
          startFrame={50}
          anchor="center"
          offsetY={-80}
          fontSize={40}
          fontWeight={500}
          color="#555555"
          zIndex={2}
          exit={{
            startFrame: 126, // Individual exit starts
            opacity: { from: 1, to: 0, duration: 15 },
            blur: { from: 0, to: 5, duration: 15 },
          }}
        />

        {/* App Mockup */}
        <div
          style={{
            transform: `scale(${mockupScale})`,
            opacity: mockupOpacity * (frame < mockupExitStartFrame ? 1 : mockupExitOpacity),
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '80px', // Below the text
            transformOrigin: 'center center',
            zIndex: 1,
          }}
        >
          <MockupFrame
            type="browser"
            src={staticFile('screenshots/projectpilot-dashboard.png')} // Placeholder image
            theme="light"
            width={800} // Example width, adjust as needed
            height={450} // Example height, adjust as needed
            glass={{ blur: 10, opacity: 0.2 }}
            glare
          />
        </div>

      </MotionContainer>
    </AbsoluteFill>
  );
};
