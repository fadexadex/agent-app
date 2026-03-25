
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';

interface HookManualCodingPainProps {}

// Custom FrustratedEmoji component (defined inline for this scene)
const FrustratedEmoji: React.FC<{ size?: number; shakeStartFrame: number; shakeEndFrame: number }> = ({ size = 50, shakeStartFrame, shakeEndFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Shake animation using spring
  const shakeProgress = spring({
    frame: frame - shakeStartFrame,
    fps,
    config: { damping: 8, stiffness: 200 } // Bouncy shake
  });

  const translateX = interpolate(
    shakeProgress,
    [0, 0.5, 1],
    [0, -5, 5], // Shake left and right
    { extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    shakeProgress,
    [0, 0.5, 1],
    [0, 5, -5], // Shake up and down
    { extrapolateRight: 'clamp' }
  );

  // Sweat drops opacity
  const sweatOpacity = interpolate(frame, [shakeStartFrame, shakeStartFrame + 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#EF4444', // Red
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `translate(${translateX}px, ${translateY}px)`,
        border: '2px solid white',
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
      }}
    >
      {/* Eyes */}
      <div
        style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          backgroundColor: 'white',
          borderRadius: '50%',
          top: '25%',
          left: '20%',
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          backgroundColor: 'white',
          borderRadius: '50%',
          top: '25%',
          right: '20%',
        }}
      ></div>

      {/* Mouth (frown) */}
      <div
        style={{
          position: 'absolute',
          width: '60%',
          height: '20%',
          backgroundColor: 'white',
          borderRadius: '0 0 50% 50%',
          bottom: '20%',
          transform: 'rotate(180deg)', // Frown
        }}
      ></div>

      {/* Sweat drops */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '30%',
          width: '6px',
          height: '10px',
          backgroundColor: '#ADD8E6', // Light blue
          borderRadius: '50%',
          opacity: sweatOpacity,
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '30%',
          width: '6px',
          height: '10px',
          backgroundColor: '#ADD8E6', // Light blue
          borderRadius: '50%',
          opacity: sweatOpacity,
        }}
      ></div>
    </div>
  );
};


export const HookManualCodingPain: React.FC<HookManualCodingPainProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene fade-in/fade-out
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [115, 135], [1, 0], { extrapolateLeft: 'clamp' });
  const overallOpacity = fadeIn * fadeOut;

  // Timings
  const textStartFrame = 10;
  const emojiEnterFrame = 30;
  const figmaEnterFrame = 60;
  const vscodeEnterFrame = 65; // 5 frames stagger from Figma

  const emojiExitFrame = 90;
  const textExitFrame = 100;
  const figmaExitFrame = 110;
  const vscodeExitFrame = 115; // 5 frames stagger from Figma

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1A1A', opacity: overallOpacity }}>
      <Background layers={[{ type: 'solid', color: '#1A1A1A' }]} />

      {/* Main text: "Turning designs into code is a headache." */}
      <AnimatedText
        text="Turning designs into code is a headache."
        preset="typewriter"
        startFrame={textStartFrame}
        anchor="center"
        offsetY={-150}
        fontSize={56}
        fontWeight={600}
        color="#FFFFFF"
        exit={{
          startFrame: textExitFrame,
          opacity: { from: 1, to: 0, duration: 20 },
          blur: { from: 0, to: 8, duration: 20 },
        }}
      />

      {/* Frustrated Emoji */}
      <MotionContainer
        initial="scale-zero"
        delay={emojiEnterFrame}
        duration={20}
        exit="scale-down"
        exitStartFrame={emojiExitFrame}
        style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', marginTop: -50 }}
      >
        <FrustratedEmoji
          size={50}
          shakeStartFrame={emojiEnterFrame + 10} // Start shaking after appearing
          shakeEndFrame={emojiExitFrame}
        />
      </MotionContainer>

      {/* Figma Design Mockup */}
      <MockupFrame
        type="browser"
        src="https://picsum.photos/600/400" // New placeholder image
        preset="slideInLeft"
        delay={figmaEnterFrame}
        exitPreset="slideLeft"
        exitStartFrame={figmaExitFrame}
        width={600}
        height={400}
        anchor="center"
        offsetX={-250}
        offsetY={50}
        browserConfig={{ url: "https://figma.com/project/design-system-example" }}
        glass={{ blur: 8, opacity: 0.1 }}
      />

      {/* VS Code Code Mockup */}
      <MockupFrame
        type="card"
        preset="slideInRight"
        delay={vscodeEnterFrame}
        exitPreset="slideRight"
        exitStartFrame={vscodeExitFrame}
        width={600}
        height={400}
        anchor="center"
        offsetX={250}
        offsetY={50}
        theme="dark"
        glass
      >
        <pre
          style={{
            fontFamily: 'monospace',
            fontSize: 18,
            color: '#D4D4D4',
            backgroundColor: '#1E1E1E',
            padding: 20,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {`import React from 'react';

// TODO: fix styling
const MyComponent = ({ title, description }) => {
  return (
    <div className="flex flex-col items-center p-4">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};`}
        </pre>
      </MockupFrame>
    </AbsoluteFill>
  );
};
