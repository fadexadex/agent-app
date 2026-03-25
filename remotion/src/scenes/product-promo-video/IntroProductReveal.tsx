
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

// Placeholder Components for custom elements
const ProductLogoAnimation: React.FC<{ frame: number, fps: number, exitProgress: number }> = ({ frame, fps, exitProgress }) => {
  const scaleIn = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 100 },
    durationInFrames: 30,
  });

  const scaleOut = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
  const opacityOut = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -100px) scale(${scaleIn * scaleOut})`,
        opacity: opacityOut,
        fontSize: 80,
        fontWeight: 700,
        color: 'white',
        textShadow: '0px 0px 20px rgba(0,0,0,0.3)',
      }}
    >
      DevFlow AI
    </div>
  );
};

const FigmaIcon: React.FC<{ frame: number, fps: number, exitProgress: number }> = ({ frame, fps, exitProgress }) => {
  const entranceDelay = 100; // After tagline starts
  const entranceDuration = 20;

  const entrance = spring({
    frame: frame - entranceDelay,
    fps,
    config: { damping: 200 },
    durationInFrames: entranceDuration,
  });

  const opacityOut = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
  const slideOut = interpolate(exitProgress, [0, 1], [0, -50], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% - 200px + ${slideOut}px), 100px) scale(${entrance})`,
        opacity: opacityOut,
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#F24E1E', // Figma orange
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 30,
        zIndex: 2, // Ensure icons are above the line
      }}
    >
      F
    </div>
  );
};

const ReactIcon: React.FC<{ frame: number, fps: number, exitProgress: number }> = ({ frame, fps, exitProgress }) => {
  const entranceDelay = 100; // After tagline starts
  const entranceDuration = 20;

  const entrance = spring({
    frame: frame - entranceDelay,
    fps,
    config: { damping: 200 },
    durationInFrames: entranceDuration,
  });

  const opacityOut = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
  const slideOut = interpolate(exitProgress, [0, 1], [0, 50], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + 200px + ${slideOut}px), 100px) scale(${entrance})`,
        opacity: opacityOut,
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#61DAFB', // React blue
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 30,
        zIndex: 2, // Ensure icons are above the line
      }}
    >
      R
    </div>
  );
};

const ConnectingLine: React.FC<{ frame: number, fps: number, exitProgress: number }> = ({ frame, fps, exitProgress }) => {
  const drawStartFrame = 100;
  const drawDuration = 30; // Frames to draw the line
  const animationProgress = interpolate(
    frame,
    [drawStartFrame, drawStartFrame + drawDuration],
    [0, 1],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  const opacityOut = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
  const lineLengthVisible = 350 * animationProgress; // Total length between Figma and React icons
  const strokeWidth = 5;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% - ${350/2}px), 100px)`, // Positioned from its center
        opacity: opacityOut, // Use opacity for exit
        width: 350,
        height: strokeWidth,
        backgroundColor: 'white',
        // Mask the line to simulate drawing
        maskImage: `linear-gradient(to right, white ${lineLengthVisible}px, transparent ${lineLengthVisible}px)`,
        WebkitMaskImage: `linear-gradient(to right, white ${lineLengthVisible}px, transparent ${lineLengthVisible}px)`,
        zIndex: 1, // Ensure line is below icons but above background
      }}
    />
  );
};


interface IntroProductRevealProps {}

export const IntroProductReveal: React.FC<IntroProductRevealProps> = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Exit animation timings based on "stagger 4 frames"
  const exitDuration = 20;

  // Calculate exit start frames to ensure the last element finishes exiting at `durationInFrames`
  const exitStartFrameLogo = durationInFrames - exitDuration; // Logo is last to exit
  const exitStartFrameTagline = exitStartFrameLogo - 4;
  const exitStartFrameIcons = exitStartFrameTagline - 4;
  const exitStartFrameConnectingLine = exitStartFrameIcons - 4; // Connecting line is first to exit

  const connectingLineExitProgress = interpolate(
    frame,
    [exitStartFrameConnectingLine, exitStartFrameConnectingLine + exitDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const iconsExitProgress = interpolate(
    frame,
    [exitStartFrameIcons, exitStartFrameIcons + exitDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const taglineExitProgress = interpolate(
    frame,
    [exitStartFrameTagline, exitStartFrameTagline + exitDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const logoExitProgress = interpolate(
    frame,
    [exitStartFrameLogo, exitStartFrameLogo + exitDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );


  return (
    <AbsoluteFill>
      <Background preset="blueSky" animated animationSpeed={0.5} />

      <ProductLogoAnimation
        frame={frame}
        fps={fps}
        exitProgress={logoExitProgress}
      />

      <AnimatedText
        text="Figma to Production React, Instantaneously."
        preset="typewriter"
        animationUnit="character"
        stagger={1.5}
        startFrame={40}
        anchor="center"
        offsetY={100}
        fontSize={36}
        fontWeight={500}
        color="white"
        exit={{
          startFrame: exitStartFrameTagline,
          opacity: { from: 1, to: 0, duration: exitDuration },
        }}
      />

      <ConnectingLine
        frame={frame}
        fps={fps}
        exitProgress={connectingLineExitProgress}
      />
      <FigmaIcon
        frame={frame}
        fps={fps}
        exitProgress={iconsExitProgress}
      />
      <ReactIcon
        frame={frame}
        fps={fps}
        exitProgress={iconsExitProgress}
      />
    </AbsoluteFill>
  );
};
