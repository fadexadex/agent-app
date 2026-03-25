
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import React from 'react';

// Custom component for the frustrated emoji (simple animated div)
const FrustratedEmoji: React.FC<{ startFrame: number; exitStartFrame: number }> = ({ startFrame, exitStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation for opacity and scale
  const entranceProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const opacity = interpolate(entranceProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(entranceProgress, [0, 1], [0.5, 1], { extrapolateRight: 'clamp' });

  // Subtle shaking animation (continuous during active time)
  const shakeOffset = interpolate(
    Math.sin(frame / 5), // Using sine wave for continuous wobble
    [-1, 1],
    [-3, 3]
  );
  const rotateOffset = interpolate(
    Math.cos(frame / 7), // Using cosine for slight rotation
    [-1, 1],
    [-2, 2]
  );

  // Exit animation
  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.5], { extrapolateRight: 'clamp' });

  const finalOpacity = Math.min(opacity, exitOpacity);
  const finalScale = Math.min(scale, exitScale);

  if (finalOpacity === 0 && frame > exitStartFrame) {
    return null; // Don't render if fully exited
  }

  return (
    <div
      style={{
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: '50%',
        backgroundColor: '#ef4444', // Red color for emoji
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 30,
        transform: `translate(-50%, -50%) scale(${finalScale}) rotate(${rotateOffset}deg)`,
        opacity: finalOpacity,
        left: '50%',
        top: '50%',
        transformOrigin: 'center center',
        zIndex: 5, // Above mockups, below text
      }}
    >
      <span
        role="img"
        aria-label="frustrated emoji"
        style={{
          transform: `translateX(${shakeOffset}px)`, // Apply shake to emoji content
        }}
      >
        😩
      </span>
    </div>
  );
};


export const HookManualCodingPain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timing constants
  const textEntryStart = 10;
  const emojiEntryStart = 40;
  const mockupsEntryStart = 70;

  const emojiExitStart = 90;
  const textExitStart = emojiExitStart + 5; // Stagger 5 frames
  const mockupsExitStart = textExitStart + 5; // Stagger 5 frames

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1A1A' }}>
      <Background layers={[{ type: 'solid', color: '#1A1A1A' }]} />

      {/* Frustrated Emoji - custom component */}
      <FrustratedEmoji startFrame={emojiEntryStart} exitStartFrame={emojiExitStart} />

      {/* Pain Statement Text */}
      <AnimatedText
        text="Turning designs into code is a headache."
        preset="typewriter"
        animationUnit="character"
        stagger={1.5}
        startFrame={textEntryStart}
        anchor="center"
        offsetY={-150}
        fontSize={56}
        fontWeight={600}
        color="#FFFFFF"
        exit={{
          startFrame: textExitStart,
          opacity: { from: 1, to: 0, duration: 20 },
          blur: { from: 0, to: 10, duration: 20 },
        }}
        style={{ zIndex: 10 }} // Above emoji
      />

      {/* Figma Design Mockup */}
      <MockupFrame
        type="browser"
        src="https://picsum.photos/700/450" // Updated placeholder image
        preset="slideInLeft"
        startFrame={mockupsEntryStart}
        exitPreset="slideLeft"
        exitStartFrame={mockupsExitStart}
        width={700}
        height={450}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          marginLeft: -250, // Relative to center
          marginTop: 50,    // Relative to center
          zIndex: 0, // Below text and emoji
        }}
      />

      {/* VS Code Code Mockup */}
      <MockupFrame
        type="card"
        preset="slideInRight"
        startFrame={mockupsEntryStart}
        exitPreset="slideRight"
        exitStartFrame={mockupsExitStart}
        width={700}
        height={450}
        theme="dark"
        glass={{ blur: 10, opacity: 0.1 }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          marginLeft: 250, // Relative to center
          marginTop: 50,   // Relative to center
          zIndex: 0, // Below text and emoji
        }}
      >
        <div style={{ padding: 20, fontSize: 20, lineHeight: 1.4, color: '#e0e0e0', fontFamily: 'monospace' }}>
          <AnimatedText
            text={
              `import React from 'react';

// TODO: fix styling
const MyComponent = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center p-4">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};`
            }
            preset="typewriter"
            animationUnit="character"
            stagger={0.5} // typewriter speed 0.5 as per spec
            startFrame={50} // Original start frame 50
            color="#e0e0e0"
            // Exit handled by parent MockupFrame
          />
        </div>
      </MockupFrame>
    </AbsoluteFill>
  );
};
