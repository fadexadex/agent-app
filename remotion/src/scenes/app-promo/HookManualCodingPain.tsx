
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

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
    <AbsoluteFill style={{ backgroundColor: '#09090B', opacity: overallOpacity, fontFamily }}>
      {/* 
         Background with subtle glow. 
         Note: The Background component has zIndex: -1 by default in its source code.
         I'm using a deeper dark color (#09090B) to match the cinematic style.
      */}
      <Background 
        layers={[
          { type: 'solid', color: '#09090B' },
          { type: 'glow', color: '#3b82f6', x: 50, y: 80, radius: 400, opacity: 0.15 },
          { type: 'noise', opacity: 0.02 }
        ]} 
      />

      {/* Main text: "Turning designs into code is a headache." */}
      <AnimatedText
        text="Turning designs into code is a headache."
        preset="typewriter"
        startFrame={textStartFrame}
        anchor="center"
        offsetY={-200}
        fontSize={56}
        fontWeight={700}
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
        style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', marginTop: -80, zIndex: 10 }}
      >
        <FrustratedEmoji
          size={60}
          shakeStartFrame={emojiEnterFrame + 10} // Start shaking after appearing
          shakeEndFrame={emojiExitFrame}
        />
      </MotionContainer>

      {/* Figma Design Mockup */}
      <MockupFrame
        type="browser"
        src="https://picsum.photos/seed/figma/600/400"
        preset="slideInLeft"
        delay={figmaEnterFrame}
        exitPreset="slideLeft"
        exitStartFrame={figmaExitFrame}
        width={550}
        height={350}
        anchor="center"
        offsetX={-280}
        offsetY={100}
        browserConfig={{ url: "https://figma.com/design" }}
        glass={{ blur: 12, opacity: 0.1 }}
      />

      {/* VS Code Code Mockup */}
      <MockupFrame
        type="card"
        preset="slideInRight"
        delay={vscodeEnterFrame}
        exitPreset="slideRight"
        exitStartFrame={vscodeExitFrame}
        width={550}
        height={350}
        anchor="center"
        offsetX={280}
        offsetY={100}
        theme="dark"
        glass
      >
        <pre
          style={{
            fontFamily: 'monospace',
            fontSize: 16,
            color: '#D4D4D4',
            backgroundColor: '#1E1E1E',
            padding: 24,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {`import React from 'react';

const Card = ({ title }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>Hard-coding sucks...</p>
    </div>
  );
};`}
        </pre>
      </MockupFrame>
    </AbsoluteFill>
  );
};
