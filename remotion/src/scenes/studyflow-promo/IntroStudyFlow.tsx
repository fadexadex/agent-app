import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';

interface IntroStudyFlowProps {}

export const IntroStudyFlow: React.FC<IntroStudyFlowProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Logo animation timing
  const logoExitStartFrame = 90;
  const logoExitDuration = 15;

  // Tagline animation timing
  const taglineStartFrame = 20;
  const taglineExitStartFrame = 95; // 5 frames after logo exit
  const taglineExitDuration = 10;

  // Mockup animation timing
  const mockupEntryDelay = 30;
  const mockupEntryDuration = 35; // Duration for MotionContainer's entrance
  const mockupExitStartFrame = 100; // 5 frames after tagline exit
  const mockupExitDuration = 15;

  return (
    <AbsoluteFill>
      <Background
        layers={[
          { type: "linear", colors: ["#6DD5ED", "#2193B0"], angle: 90 },
        ]}
      />

      {/* StudyFlow Logo (representing "AppLogoTitle" as text only) */}
      <AnimatedText
        text="StudyFlow"
        preset="slideInLeft"
        animationUnit="full"
        startFrame={0} // Animation starts immediately at scene start
        anchor="center"
        offsetY={-100}
        fontSize={72}
        fontWeight={600}
        color="#FFFFFF"
        exit={{
          startFrame: logoExitStartFrame,
          opacity: { from: 1, to: 0, duration: logoExitDuration },
          position: {
            fromX: 0,
            toX: -width * 0.75, // Slide out left
            fromY: -100,
            toY: -100,
            duration: logoExitDuration,
          },
        }}
      />

      {/* Intro Tagline */}
      <AnimatedText
        text="Your ultimate study companion."
        preset="scaleUp" // Achieves "Fade in with a slight scale."
        animationUnit="full"
        startFrame={taglineStartFrame} // Animation starts at frame 20
        anchor="center"
        offsetY={0}
        fontSize={48}
        fontWeight={400}
        color="#FFFFFF"
        exit={{
          startFrame: taglineExitStartFrame,
          opacity: { from: 1, to: 0, duration: taglineExitDuration }, // Fade out
        }}
      />

      {/* App Dashboard Mockup */}
      <MotionContainer
        initial="offscreen-bottom" // Matches slideInUp intent
        delay={mockupEntryDelay} // Entrance starts at frame 30
        duration={mockupEntryDuration} // Entrance lasts 35 frames
        exit="slide-down" // Matches slideOutDown intent
        exitStartFrame={mockupExitStartFrame} // Exit starts at frame 100
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) translateY(120px)', // Centers the container and applies Y offset
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MockupFrame
          type="iphone15"
          src="/assets/studyflow-dashboard.png" // Placeholder image path
          rotate={{
            startAngle: { x: 10, y: 0 },
            endAngle: { x: 0, y: 0 },
            startFrame: 0, // Rotation starts at frame 0 relative to MotionContainer's active duration
            endFrame: mockupEntryDuration, // Rotation ends when MotionContainer entrance finishes
          }}
          glare // Adds a screen glare effect
        />
      </MotionContainer>
    </AbsoluteFill>
  );
};
