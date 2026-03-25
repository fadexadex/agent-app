
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';

interface FrustratedEmojiProps {
  startFrame: number;
  endFrame: number;
}

const FrustratedEmoji: React.FC<FrustratedEmojiProps> = ({ startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shakeProgress = interpolate(
    frame,
    [startFrame, endFrame],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Simple sine wave for shaking effect
  const shakeX = Math.sin(shakeProgress * Math.PI * 10) * interpolate(shakeProgress, [0, 0.5, 1], [0, 8, 0], { extrapolateRight: 'clamp' });
  const shakeY = Math.sin(shakeProgress * Math.PI * 12) * interpolate(shakeProgress, [0, 0.5, 1], [0, 6, 0], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        fontSize: '50px',
        width: '50px',
        height: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `translateX(${shakeX}px) translateY(${shakeY}px)`,
      }}
    >
      🥵
    </div>
  );
};

export const HookManualCodingPain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const sceneDuration = 135; // frames

  // Animation timing calculations
  const textEntranceStart = 10;
  const textExitStart = 105;
  
  const emojiEntranceDelay = 30; // after scene start
  const emojiExitStart = 100;
  
  const mockupsEntranceDelay = 70; // after scene start
  const mockupsExitStart = 110;
  const mockupTransitionDuration = 25; // frames

  const vscodeCodeTypewriterStart = mockupsEntranceDelay + 10; // 10 frames after mockup appears
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1A1A' }}>
      {/* Scene Background */}
      <Background layers={[{ type: 'solid', color: '#1A1A1A' }]} />

      {/* Overall scene fade-in transition */}
      <MotionContainer initial="hidden" duration={20} delay={0} style={{ width: '100%', height: '100%' }}>
          {/* Main text: "Turning designs into code is a headache." */}
          <AnimatedText
            text="Turning designs into code is a headache."
            preset="typewriter"
            animationUnit="character"
            stagger={1.5}
            startFrame={textEntranceStart}
            anchor="center"
            offsetY={-150}
            fontSize={56}
            fontWeight={600}
            color="#FFFFFF"
            exit={{
              startFrame: textExitStart,
              opacity: { from: 1, to: 0, duration: 15 },
            }}
          />

          {/* Frustrated Emoji */}
          <MotionContainer
            initial="scale-zero"
            delay={emojiEntranceDelay}
            duration={20}
            exit="fade-out"
            exitStartFrame={emojiExitStart}
            style={{
              position: 'absolute',
              left: '50%',
              top: `${height / 2 - 150 + 100}px`, // Centered Y of text: height/2 - 150. Emoji 100px below that.
              transform: 'translate(-50%, -50%)', // Center the MotionContainer itself relative to its top/left
            }}
          >
            <FrustratedEmoji
              startFrame={emojiEntranceDelay}
              endFrame={emojiExitStart}
            />
          </MotionContainer>


          {/* Figma Design Mockup (Left) */}
          <MotionContainer
            initial="offscreen-left"
            delay={mockupsEntranceDelay}
            duration={mockupTransitionDuration}
            exit="slide-left"
            exitStartFrame={mockupsExitStart}
            style={{
              position: 'absolute',
              left: `${width / 2 - 250 - (400 / 2)}px`, // -250 from center, -200 for mockup half-width (400px)
              top: `${height / 2 + 50 - (300 / 2)}px`,  // +50 from center, -150 for mockup half-height (300px)
              width: 400,
              height: 300,
            }}
          >
            <MockupFrame type="browser" theme="dark" width={400} height={300} browserConfig={{ url: "figma.com/design" }}>
              <div style={{ backgroundColor: '#212121', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#eee', fontSize: 24 }}>
                Complex Figma UI (Placeholder)
              </div>
            </MockupFrame>
          </MotionContainer>

          {/* VS Code Code Mockup (Right) */}
          <MotionContainer
            initial="offscreen-right"
            delay={mockupsEntranceDelay}
            duration={mockupTransitionDuration}
            exit="slide-right"
            exitStartFrame={mockupsExitStart}
            style={{
              position: 'absolute',
              left: `${width / 2 + 250 - (400 / 2)}px`, // +250 from center, -200 for mockup half-width (400px)
              top: `${height / 2 + 50 - (300 / 2)}px`,  // +50 from center, -150 for mockup half-height (300px)
              width: 400,
              height: 300,
            }}
          >
            <MockupFrame type="card" theme="dark" glass width={400} height={300}>
              <div style={{ padding: 20, flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                <AnimatedText
                  text={'import React from \'react\';\n\n// TODO: fix styling\nconst MyComponent = ({ title, description }) => {\n  return (\n    <div className=\"flex flex-col items-center p-4\">\n      <h3>{title}</h3>\n      <p>{description}</p>\n    </div>\n  );\n};'}
                  preset="typewriter"
                  animationUnit="character"
                  stagger={0.2} // Adjusted stagger for faster typing
                  startFrame={vscodeCodeTypewriterStart} // Absolute start frame
                  fontSize={18}
                  fontWeight={400}
                  color="#D4D4D4" // VS Code like text color
                  style={{ fontFamily: 'monospace', lineHeight: 1.4 }}
                />
              </div>
            </MockupFrame>
          </MotionContainer>
      </MotionContainer>
    </AbsoluteFill>
  );
};
