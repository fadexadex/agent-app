import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

interface FeatureSeamlessConversionProps {}

export const FeatureSeamlessConversion: React.FC<FeatureSeamlessConversionProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timing constants (in frames)
  const PILL_ENTRY_DELAY = 0; // Pill MotionContainer starts at global frame 0
  const MOCKUP_ENTRY_DELAY = 10; // Mockups MotionContainer start at global frame 10
  const MAGIC_EFFECT_ENTRY_DELAY = 40; // Magic effect Sequence starts at global frame 40
  const CODE_TYPEWRITER_GLOBAL_START = 60; // Code typing starts at global frame 60
  const CAPTION_TYPEWRITER_GLOBAL_START = 100; // Caption typewriter starts at global frame 100

  // Exit timings based on scene duration and staggered exit order
  const SCENE_DURATION = 150;
  const EXIT_ANIMATION_DURATION = 20; // Duration for each element's exit animation

  // Calculate exit start frames ensuring all animations finish by SCENE_DURATION
  const MOCKUP_EXIT_START = SCENE_DURATION - EXIT_ANIMATION_DURATION; // Mockups start exiting at frame 130
  const PILL_EXIT_START = MOCKUP_EXIT_START - 5; // Pill starts exiting at frame 125 (5 frames before mockups)
  const MAGIC_EXIT_START = PILL_EXIT_START - 5; // Magic effect starts exiting at frame 120 (5 frames before pill)
  const CAPTION_EXIT_START = MAGIC_EXIT_START - 5; // Caption starts exiting at frame 115 (5 frames before magic effect)

  // Relative start frames for AnimatedText components inside MotionContainers/Sequences
  const CODE_TYPEWRITER_RELATIVE_START = CODE_TYPEWRITER_GLOBAL_START - MOCKUP_ENTRY_DELAY; // 60 - 10 = 50
  const CAPTION_MOTION_CONTAINER_ENTRY_DELAY = CAPTION_TYPEWRITER_GLOBAL_START - 10; // Caption's MotionContainer starts 10 frames before its AnimatedText
  const CAPTION_TYPEWRITER_RELATIVE_START = CAPTION_TYPEWRITER_GLOBAL_START - CAPTION_MOTION_CONTAINER_ENTRY_DELAY; // 100 - (100 - 10) = 10

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      <Background layers={[{ type: 'solid', color: '#FFFFFF' }]} />

      {/* Feature Pill: Instant Code Generation */}
      <MotionContainer
        initial="scale-down"
        delay={PILL_ENTRY_DELAY}
        duration={30}
        exit="fade-out"
        exitStartFrame={PILL_EXIT_START}
        style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1A1A1A',
          borderRadius: 9999,
          padding: '10px 30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3,
        }}
      >
        <AnimatedText
          text="Instant Code Generation"
          preset="fadeBlurIn"
          animationUnit="full"
          fontSize={32}
          fontWeight={600}
          color="#FFFFFF"
          // startFrame relative to MotionContainer's active state
          startFrame={10} // Text animates in 10 frames after the pill container starts its entry
        />
      </MotionContainer>

      {/* Figma Browser Mockup */}
      <MotionContainer
        initial="offscreen-left"
        delay={MOCKUP_ENTRY_DELAY}
        duration={30}
        exit="slide-left"
        exitStartFrame={MOCKUP_EXIT_START}
        style={{
          position: 'absolute',
          left: width / 2 - 280,
          top: height / 2 + 50,
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
      >
        <MockupFrame
          type="browser"
          // Removed src and using children for placeholder content
          theme="light"
          width={500}
          height={300}
          browserConfig={{ url: "figma.com/design" }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: 24, color: '#333' }}>
            Figma Button Design
          </div>
        </MockupFrame>
      </MotionContainer>

      {/* VS Code Card Mockup */}
      <MotionContainer
        initial="offscreen-right"
        delay={MOCKUP_ENTRY_DELAY}
        duration={30}
        exit="slide-right"
        exitStartFrame={MOCKUP_EXIT_START}
        style={{
          position: 'absolute',
          left: width / 2 + 280,
          top: height / 2 + 50,
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
      >
        <MockupFrame
          type="card"
          theme="dark"
          width={500}
          height={300}
          glass={{ blur: 10, opacity: 0.1 }}
          glare
        >
          <div style={{ padding: 20, height: '100%', overflow: 'hidden' }}>
            <AnimatedText
              text={`import React from 'react';

const PrimaryButton = ({ label, onClick }) => {
  return (
    <button
      className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
      onClick={onClick}
    >
      {label}
    </button>
  );
};`}
              preset="typewriter"
              animationUnit="character"
              stagger={0.8}
              startFrame={CODE_TYPEWRITER_RELATIVE_START}
              fontSize={18}
              fontWeight={400}
              color="#e0e0e0"
              anchor="top-left"
            />
          </div>
        </MockupFrame>
      </MotionContainer>

      {/* Magic Transition Effect */}
      <Sequence from={MAGIC_EFFECT_ENTRY_DELAY} durationInFrames={MAGIC_EXIT_START - MAGIC_EFFECT_ENTRY_DELAY + EXIT_ANIMATION_DURATION}>
        <MotionContainer
          initial="scale-zero"
          duration={30}
          exit="fade-out"
          exitStartFrame={MAGIC_EXIT_START - MAGIC_EFFECT_ENTRY_DELAY} // Exit relative to Sequence start
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.8) 0%, rgba(124,58,237,0) 70%)',
          }}
        >
          <div style={{
            fontSize: 50,
            color: 'white',
            // Simple pulsating/scaling animation for the sparkle effect
            opacity: interpolate(
              frame, // Use global frame here as Sequence frame starts from MAGIC_EFFECT_ENTRY_DELAY
              [MAGIC_EFFECT_ENTRY_DELAY, MAGIC_EFFECT_ENTRY_DELAY + 15, MAGIC_EFFECT_ENTRY_DELAY + 30, MAGIC_EFFECT_ENTRY_DELAY + 45, MAGIC_EXIT_START],
              [0, 1, 0.5, 1, 0],
              { extrapolateRight: 'clamp' }
            ),
            transform: `scale(${interpolate(
              frame, // Use global frame here
              [MAGIC_EFFECT_ENTRY_DELAY, MAGIC_EFFECT_ENTRY_DELAY + 15, MAGIC_EFFECT_ENTRY_DELAY + 30, MAGIC_EFFECT_ENTRY_DELAY + 45, MAGIC_EXIT_START],
              [0.5, 1.2, 0.8, 1.2, 0.5],
              { extrapolateRight: 'clamp' }
            )})`,
          }}>✨</div>
        </MotionContainer>
      </Sequence>

      {/* Caption Text */}
      <MotionContainer
        initial="hidden"
        delay={CAPTION_MOTION_CONTAINER_ENTRY_DELAY} // Global frame when this MotionContainer becomes active
        duration={10} // Quick appearance for MotionContainer itself
        exit="fade-out"
        exitStartFrame={CAPTION_EXIT_START}
        style={{
          position: 'absolute',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
        }}
      >
        <AnimatedText
          text="Generate production-ready React code instantly."
          preset="typewriter"
          animationUnit="word"
          stagger={1.5}
          startFrame={CAPTION_TYPEWRITER_RELATIVE_START} // Relative to MotionContainer's start
          fontSize={32}
          fontWeight={500}
          color="#1A1A1A"
          anchor="center"
        />
      </MotionContainer>
    </AbsoluteFill>
  );
};
