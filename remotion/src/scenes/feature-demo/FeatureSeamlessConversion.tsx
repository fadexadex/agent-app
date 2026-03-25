import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

// Custom component: FeaturePill
const FeaturePill: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        backgroundColor: '#1A1A1A',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '9999px', // pill shape
        fontSize: 24,
        fontWeight: 600,
        display: 'inline-block', // to wrap content
      }}
    >
      {children}
    </div>
  );
};

// Custom component: MagicTransitionEffect
const MagicTransitionEffect: React.FC<{ startFrame: number, duration: number, exitStartFrame: number }> = ({ startFrame, duration, exitStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const entryProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const scale = interpolate(entryProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(entryProgress, [0, 0.5, 1], [0, 1, 0.8], { extrapolateRight: 'clamp' });

  // Exit animation
  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const exitScale = interpolate(exitProgress, [0, 1], [1, 1.5], { extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });

  // Final values based on current frame relative to start/exit
  let finalScale = 0;
  let finalOpacity = 0;

  if (frame < startFrame) {
    finalScale = 0;
    finalOpacity = 0;
  } else if (frame >= exitStartFrame) {
    finalScale = exitScale;
    finalOpacity = exitOpacity;
  } else { // Between startFrame and exitStartFrame
    finalScale = scale;
    finalOpacity = opacity;
  }

  // Additional swirl/sparkle visual for the "magic"
  const glowOpacity = interpolate(frame, [startFrame, startFrame + duration / 2, startFrame + duration], [0, 1, 0], { extrapolateRight: 'clamp' });
  const glowScale = interpolate(frame, [startFrame, startFrame + duration / 2, startFrame + duration], [0.5, 1.2, 1], { extrapolateRight: 'clamp' });


  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(${finalScale})`,
        opacity: finalOpacity,
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: `radial-gradient(circle at center, rgba(124,58,237,${glowOpacity}) 0%, rgba(124,58,237,${glowOpacity * 0.5}) 50%, transparent 100%)`,
        filter: `blur(${interpolate(entryProgress, [0,1],[10,0], {extrapolateRight: 'clamp'})}px)`,
      }}
    >
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${glowScale})`,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle at center, rgba(255,255,255,${glowOpacity * 0.8}) 0%, rgba(255,255,255,${glowOpacity * 0.2}) 50%, transparent 100%)`,
          filter: 'blur(5px)'
        }}></div>
    </div>
  );
};


export const FeatureSeamlessConversion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const durationFrames = 150; // Total scene duration

  // Define entrance/exit frames
  const pillEntranceDelay = 0;
  const mockupEntranceDelay = 5;
  const magicEffectEntranceStart = 15;
  const magicEffectDuration = 60; // How long the magic effect is "active" for visual transformation

  const captionTypewriterStart = 100;
  const vscodeTypewriterStart = 60; // As per spec

  // Exit timings based on stagger of 5 frames
  const captionExitStart = 120; // 150 - 30 (exit duration)
  const magicEffectExitStart = captionExitStart - 5;
  const pillExitStart = magicEffectExitStart - 5;
  const mockupExitStart = pillExitStart - 5; // Both mockups exit together here

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      <Background layers={[{ type: 'solid', color: '#FFFFFF' }]} />

      {/* Feature Pill */}
      <MotionContainer
        initial="scale-zero"
        delay={pillEntranceDelay}
        duration={20}
        exit="scale-down"
        exitStartFrame={pillExitStart}
        style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)' }}
      >
        <FeaturePill>Instant Code Generation</FeaturePill>
      </MotionContainer>

      {/* Figma Mockup */}
      <MotionContainer
        initial="offscreen-left"
        delay={mockupEntranceDelay}
        duration={30}
        exit="slide-left"
        exitStartFrame={mockupExitStart}
        style={{ position: 'absolute', left: width / 2 - 280, top: height / 2 + 50, transform: 'translate(-50%, -50%)' }}
      >
        <MockupFrame
          type="browser"
          width={400}
          height={250}
          browserConfig={{ url: "figma.com/design-button" }}
          // Removed src={"/assets/figma-button-design.png"} to prevent 404 error
          theme="light"
        />
      </MotionContainer>

      {/* VS Code Mockup */}
      <MotionContainer
        initial="offscreen-right"
        delay={mockupEntranceDelay} // Both slide in roughly at the same time
        duration={30}
        exit="slide-right"
        exitStartFrame={mockupExitStart}
        style={{ position: 'absolute', left: width / 2 + 280, top: height / 2 + 50, transform: 'translate(-50%, -50%)' }}
      >
        <MockupFrame
          type="card"
          width={400}
          height={250}
          theme="dark"
          glass
          glare
        >
          <div style={{ padding: 20, fontSize: 16, fontFamily: 'monospace', color: '#e0e0e0', lineHeight: 1.5 }}>
            <AnimatedText
              text={"import React from 'react';\n\nconst PrimaryButton = ({ label, onClick }) => {\n  return (\n    <button\n      className=\"bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200\"\n      onClick={onClick}\n    >\n      {label}\n    </button>\n  );\n};"}
              preset="typewriter"
              startFrame={vscodeTypewriterStart}
              animationUnit="character"
              stagger={0.8} // speed: 0.8 from spec
              color="#e0e0e0"
              fontSize={16}
              fontWeight={400}
            />
          </div>
        </MockupFrame>
      </MotionContainer>

      {/* Magic Transition Effect */}
      <MagicTransitionEffect
        startFrame={magicEffectEntranceStart}
        duration={magicEffectDuration}
        exitStartFrame={magicEffectExitStart}
      />

      {/* Caption Text */}
      <AnimatedText
        text="Generate production-ready React code instantly."
        preset="typewriter"
        animationUnit="character"
        stagger={1.5} // speed: 1.5 from spec
        startFrame={captionTypewriterStart}
        anchor="center"
        offsetY={250}
        fontSize={24}
        fontWeight={500}
        color="#000000"
        exit={{
          startFrame: captionExitStart,
          opacity: { from: 1, to: 0, duration: 20 },
        }}
      />
    </AbsoluteFill>
  );
};
