import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Background } from "@/components/Global";
import { AnimatedText } from "@/components/AnimatedText";

// Custom component placeholders
// ProductLogoAnimation
const ProductLogoAnimation: React.FC<{ startFrame: number; exitStartFrame: number; fps: number }> = ({ startFrame, exitStartFrame, fps }) => {
  const frame = useCurrentFrame();
  const scale = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const exitOpacity = interpolate(
    frame,
    [exitStartFrame, exitStartFrame + 15],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: exitOpacity,
        fontSize: 72,
        fontWeight: 800,
        color: 'white',
        textShadow: '0 0 20px rgba(255,255,255,0.5)',
      }}
    >
      DevFlow AI
    </div>
  );
};

// FigmaIcon
const FigmaIcon: React.FC<{ startFrame: number; exitStartFrame: number; fps: number; offsetX: number }> = ({ startFrame, exitStartFrame, fps, offsetX }) => {
  const frame = useCurrentFrame();
  const entryProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const translateY = interpolate(entryProgress, [0, 1], [50, 0], { extrapolateRight: 'clamp' });
  const opacity = interpolate(entryProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  const exitOpacity = interpolate(
    frame,
    [exitStartFrame, exitStartFrame + 15],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${translateY}px))`,
        opacity: opacity * exitOpacity,
        width: 60,
        height: 60,
        backgroundColor: '#A259FF', // Figma purple
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
      }}
    >
      Figma
    </div>
  );
};

// ReactIcon
const ReactIcon: React.FC<{ startFrame: number; exitStartFrame: number; fps: number; offsetX: number }> = ({ startFrame, exitStartFrame, fps, offsetX }) => {
  const frame = useCurrentFrame();
  const entryProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const translateY = interpolate(entryProgress, [0, 1], [50, 0], { extrapolateRight: 'clamp' });
  const opacity = interpolate(entryProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  const exitOpacity = interpolate(
    frame,
    [exitStartFrame, exitStartFrame + 15],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${translateY}px))`,
        opacity: opacity * exitOpacity,
        width: 60,
        height: 60,
        backgroundColor: '#61DAFB', // React blue
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
      }}
    >
      React
    </div>
  );
};

// ConnectingLine
const ConnectingLine: React.FC<{ startFrame: number; exitStartFrame: number; fps: number; width: number; }> = ({ startFrame, exitStartFrame, fps, width }) => {
  const frame = useCurrentFrame();
  const drawProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const currentWidth = interpolate(drawProgress, [0, 1], [0, width], { extrapolateRight: 'clamp' });

  const exitOpacity = interpolate(
    frame,
    [exitStartFrame, exitStartFrame + 15],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: currentWidth,
        height: 4,
        backgroundColor: 'white',
        borderRadius: 2,
        opacity: exitOpacity,
      }}
    />
  );
};


export const IntroProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Define timings based on the plan
  const logoEntryStart = 0;
  const taglineEntryStart = 40;
  const lineIconsEntryStart = 75; // Start line drawing slightly before icons appear
  const iconsAnimationDelay = 5; // Icons animate 5 frames after line starts

  // Exit timings
  const lineExitStart = 80; // Connecting line exits first
  const iconsExitStart = lineExitStart + 4; // Icons exit after line
  const taglineExitStart = iconsExitStart + 4; // Tagline exits after icons
  const logoExitStart = taglineExitStart + 4; // Logo exits last

  // Positioning for icons and line
  const iconSpacing = 180; // Distance between Figma and React icon centers
  const figmaOffsetX = -(iconSpacing / 2);
  const reactOffsetX = (iconSpacing / 2);


  return (
    <AbsoluteFill>
      <Background preset="blueSky" />

      {/* Product Logo Animation */}
      <ProductLogoAnimation
        startFrame={logoEntryStart}
        exitStartFrame={logoExitStart}
        fps={fps}
      />

      {/* Tagline Text */}
      <AnimatedText
        text="Figma to Production React, Instantaneously."
        preset="typewriter"
        animationUnit="character"
        stagger={1} // Default for typewriter is 1 char per frame
        startFrame={taglineEntryStart}
        anchor="center"
        offsetY={100}
        fontSize={40}
        fontWeight={600}
        color="white"
        exit={{
          startFrame: taglineExitStart,
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 10, duration: 15 },
        }}
      />

      {/* Connecting Line */}
      <ConnectingLine
        startFrame={lineIconsEntryStart}
        exitStartFrame={lineExitStart}
        fps={fps}
        width={iconSpacing}
      />

      {/* Figma Icon */}
      <FigmaIcon
        startFrame={lineIconsEntryStart + iconsAnimationDelay}
        exitStartFrame={iconsExitStart}
        fps={fps}
        offsetX={figmaOffsetX}
      />

      {/* React Icon */}
      <ReactIcon
        startFrame={lineIconsEntryStart + iconsAnimationDelay}
        exitStartFrame={iconsExitStart}
        fps={fps}
        offsetX={reactOffsetX}
      />
    </AbsoluteFill>
  );
};
