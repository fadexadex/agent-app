import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import { AnimatedText } from '@/components/AnimatedText';

// Placeholder for FeaturePill component
const FeaturePill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  return (
    <div
      style={{
        backgroundColor: '#E0F2FE', // Light blue
        color: '#1A202C',         // Dark text
        padding: '8px 16px',
        borderRadius: 999,
        fontSize: 18,
        fontWeight: 600,
        textAlign: 'center',
        whiteSpace: 'nowrap', // Prevent text from wrapping
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const FeatureSmartSchedule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const mockupEntranceDelay = 0; // Starts at frame 0
  const mockupEntranceDuration = 40;
  const mockupExitFrame = 120; // Exit starts at frame 120, duration 20 frames

  const pillEntranceDelay = 30;
  const pillExitFrame = 125; // Exit starts at frame 125

  const explainerTextEntranceDelay = 50;
  const explainerTextExitFrame = 130; // Exit starts at frame 130, duration 15 frames

  const typewriterTextEntranceDelay = 60;
  const typewriterTextExitFrame = 110; // Exit starts at frame 110, duration 10 frames

  return (
    <AbsoluteFill style={{ backgroundColor: '#F8F9FA' }}>
      <Background layers={[{ type: 'solid', color: '#F8F9FA' }]} />

      {/* Feature Pill (MotionContainer handles entrance/exit) */}
      <MotionContainer
        initial="scale-zero"
        delay={pillEntranceDelay}
        exit="fade-out"
        exitStartFrame={pillExitFrame}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${-250}px)`, // Centered, 250px above screen center
          zIndex: 3,
        }}
      >
        <FeaturePill>Smart Schedule Builder</FeaturePill>
      </MotionContainer>

      {/* iPhone Mockup */}
      <MockupFrame
        type="iphone15"
        src="https://remotion.dev/assets/examples/iphone.png" // Placeholder image for a phone screen
        preset="slideInRight"
        startFrame={mockupEntranceDelay}
        entranceDuration={mockupEntranceDuration} // Explicit duration for the preset
        rotate={{
          startAngle: { x: -10, y: 0 },
          endAngle: { x: 0, y: 0 },
          startFrame: mockupEntranceDelay,
          endFrame: mockupEntranceDuration,
        }}
        exitPreset="slide-right"
        exitStartFrame={mockupExitFrame}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${-20}px)`, // Centered, 20px above screen center
          zIndex: 2,
        }}
      />

      {/* Schedule Explainer Text */}
      <AnimatedText
        text="Optimize your study time with AI-powered suggestions."
        preset="fadeBlurIn"
        animationUnit="word"
        stagger={2}
        startFrame={explainerTextEntranceDelay}
        anchor="center"
        offsetY={280} // 280px below screen center
        fontSize={28}
        fontWeight={400}
        color="#4A5568"
        exit={{
          startFrame: explainerTextExitFrame,
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 5, duration: 15 },
        }}
        style={{ zIndex: 3 }}
      />

      {/* Typewriter Text (visually appears on the mockup screen) */}
      <AnimatedText
        text="Calculus Homework, Due Friday"
        preset="typewriter"
        animationUnit="character" // Ensures character by character typing
        stagger={1} // Speed of typing
        startFrame={typewriterTextEntranceDelay}
        anchor="top-left"
        // These offsets are relative to the overall video canvas.
        // Positioning it explicitly on screen to appear 'inside' the mockup
        offsetX={width / 2 - 190} // Rough estimate to place it inside the phone screen
        offsetY={height / 2 - 220} // Rough estimate
        fontSize={22}
        fontWeight={500}
        color="#2D3748"
        exit={{
          startFrame: typewriterTextExitFrame,
          opacity: { from: 1, to: 0, duration: 10 },
        }}
        style={{ zIndex: 4 }}
      />
    </AbsoluteFill>
  );
};
