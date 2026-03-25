
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

// Placeholder for ProductLogoAnimation - will use AnimatedText for now
const ProductLogoAnimation: React.FC<{ startFrame: number; exitStartFrame: number; }> = ({ startFrame, exitStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AnimatedText
      text="DevFlow AI"
      preset="scaleUp"
      animationUnit="full"
      startFrame={startFrame}
      anchor="center"
      fontSize={80}
      fontWeight={800}
      color="white"
      exit={{
        startFrame: exitStartFrame,
        opacity: { from: 1, to: 0, duration: 20 },
        scale: { from: 1, to: 0.8, duration: 20 },
      }}
    />
  );
};

// Placeholder for FigmaIcon
const FigmaIcon: React.FC<{ startFrame: number; exitStartFrame: number; offsetX: number }> = ({ startFrame, exitStartFrame, offsetX }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  const exitOpacity = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200, stiffness: 200 },
  });

  const translateX = interpolate(frame, [startFrame, startFrame + 30], [-20, 0], {
    extrapolateRight: 'clamp',
  });

  const exitTranslateX = interpolate(frame, [exitStartFrame, exitStartFrame + 20], [0, -20], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        opacity: Math.max(0, opacity - exitOpacity), // Fade in and then fade out
        transform: `translateX(${offsetX + translateX + exitTranslateX}px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        color: '#A259FF', // Figma purple
        height: 60,
        width: 60,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <span role="img" aria-label="Figma">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="40" height="40" fill="#A259FF"><path d="M250 250c-69.1 0-125 55.9-125 125S180.9 500 250 500s125-55.9 125-125-55.9-125-125-125zM125 125c-69.1 0-125 55.9-125 125s55.9 125 125 125 125-55.9 125-125-55.9-125-125-125zM250 0C180.9 0 125 55.9 125 125s55.9 125 125 125 125-55.9 125-125S319.1 0 250 0zM375 125c-69.1 0-125 55.9-125 125s55.9 125 125 125 125-55.9 125-125-55.9-125-125-125zM375 250c-69.1 0-125 55.9-125 125s55.9 125 125 125 125-55.9 125-125-55.9-125-125-125z"/></svg>
      </span>
    </div>
  );
};

// Placeholder for ReactIcon
const ReactIcon: React.FC<{ startFrame: number; exitStartFrame: number; offsetX: number }> = ({ startFrame, exitStartFrame, offsetX }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  const exitOpacity = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200, stiffness: 200 },
  });

  const translateX = interpolate(frame, [startFrame, startFrame + 30], [20, 0], {
    extrapolateRight: 'clamp',
  });

  const exitTranslateX = interpolate(frame, [exitStartFrame, exitStartFrame + 20], [0, 20], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        opacity: Math.max(0, opacity - exitOpacity), // Fade in and then fade out
        transform: `translateX(${offsetX + translateX + exitTranslateX}px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        color: '#61DAFB', // React blue
        height: 60,
        width: 60,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <span role="img" aria-label="React">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348" width="40" height="40" fill="#61DAFB"><circle cx="0" cy="0" r="2.05" fill="#61DAFB"/><g stroke="#61DAFB" strokeWidth="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>
      </span>
    </div>
  );
};

// Placeholder for ConnectingLine
const ConnectingLine: React.FC<{ startFrame: number; exitStartFrame: number; centerOffset: number }> = ({ startFrame, exitStartFrame, centerOffset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200, stiffness: 200 },
  });

  const lineWidth = interpolate(entranceProgress, [0, 1], [0, 200], {
    extrapolateRight: 'clamp',
  });

  const exitLineWidth = interpolate(exitProgress, [0, 1], [200, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        transform: `translateX(calc(-50% + ${centerOffset}px))`, // Horizontal center
        top: '50%',
        marginTop: 100, // Vertically centered with text
        height: 4,
        width: Math.max(0, lineWidth - exitLineWidth),
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 2,
      }}
    />
  );
};


export const IntroProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const duration = 120; // 120 frames

  // Exit timings based on notes: connecting line, icons, tagline, logo. Stagger 4 frames.
  const exitConnectingLine = 88; // 120 - 32
  const exitFigmaReactIcons = exitConnectingLine + 4; // 92
  const exitTagline = exitFigmaReactIcons + 4; // 96
  const exitLogo = exitTagline + 4; // 100

  // Calculate positions for icons and line
  const iconsDistanceFromCenter = 150; // Distance of icon center from screen center

  return (
    <AbsoluteFill>
      <Background
        layers={[
          { type: "linear", colors: ["#3A8DFF", "#86C6FF"], angle: 90, preset: "blueSky" }
        ]}
      />

      {/* Product Logo Animation */}
      <ProductLogoAnimation
        startFrame={0}
        exitStartFrame={exitLogo}
      />

      {/* Tagline Text */}
      <Sequence from={40} durationInFrames={duration - 40} name="tagline-sequence">
        <AnimatedText
          text="Figma to Production React, Instantaneously."
          preset="typewriter"
          animationUnit="character"
          stagger={1.5}
          startFrame={0} // Relative to sequence start
          anchor="center"
          offsetY={100}
          fontSize={36}
          fontWeight={600}
          color="white"
          exit={{
            startFrame: exitTagline - 40, // Relative to sequence start
            opacity: { from: 1, to: 0, duration: 20 },
            position: { toY: 150, duration: 20 },
          }}
        />
      </Sequence>


      {/* Connecting Line, Figma Icon, React Icon - enter after tagline (startFrame: 60) */}
      <Sequence from={60} durationInFrames={duration - 60} name="icons-line-sequence" >
        <ConnectingLine
          startFrame={0} // Relative to sequence start
          exitStartFrame={exitConnectingLine - 60} // Relative to sequence start
          centerOffset={0}
        />
        <FigmaIcon
          startFrame={0} // Relative to sequence start
          exitStartFrame={exitFigmaReactIcons - 60} // Relative to sequence start
          offsetX={-iconsDistanceFromCenter}
        />
        <ReactIcon
          startFrame={0} // Relative to sequence start
          exitStartFrame={exitFigmaReactIcons - 60} // Relative to sequence start
          offsetX={iconsDistanceFromCenter}
        />
      </Sequence>

    </AbsoluteFill>
  );
};
