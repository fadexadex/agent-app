
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';

interface IntroStudyFlowProps {}

export const IntroStudyFlow: React.FC<IntroStudyFlowProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timing constants
  const logoEntryDelay = 0;
  const logoEntryDuration = 30; // frames
  const taglineEntryDelay = 20;
  const taglineEntryDuration = 25; // frames
  const mockupEntryDelay = 30;
  const mockupEntryDuration = 35; // frames

  const logoExitStartFrame = 90;
  const logoExitDuration = 15;
  const taglineExitStartFrame = 95; // Staggered 5 frames after logo exit
  const taglineExitDuration = 10;
  const mockupExitStartFrame = 100; // Staggered 5 frames after tagline exit
  const mockupExitDuration = 15;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Background layers={[{ type: 'linear', colors: ['#6DD5ED', '#2193B0'] }]} />

      {/* StudyFlow Logo (custom component implementation via MotionContainer + AnimatedText) */}
      <MotionContainer
        initial="offscreen-left"
        delay={logoEntryDelay}
        duration={logoEntryDuration}
        exit="slide-left"
        exitStartFrame={logoExitStartFrame}
        style={{
          position: 'absolute',
          top: height / 2 - 100, // Position based on spec: anchor="center", y=-100
          left: width / 2,
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Simple Book Icon (SVG) */}
        <div style={{ transform: 'scale(1.5)', display: 'flex', alignItems: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <AnimatedText
          text="StudyFlow"
          animationUnit="full"
          fontSize={72}
          fontWeight={700}
          color="white"
          // Entrance handled by parent MotionContainer
        />
      </MotionContainer>

      {/* Intro Tagline */}
      <AnimatedText
        text="Streamline your studies with ease."
        preset="scaleUp" // Matches "Fade in with a slight scale."
        animationUnit="full"
        startFrame={taglineEntryDelay}
        stagger={0} // Not staggered as it's full unit
        anchor="center"
        offsetY={0} // Position based on spec: anchor="center", y=0
        fontSize={40}
        fontWeight={500}
        color="white"
        exit={{
          startFrame: taglineExitStartFrame,
          opacity: { from: 1, to: 0, duration: taglineExitDuration },
        }}
      />

      {/* App Dashboard Mockup */}
      <MockupFrame
        type="iphone15"
        src="https://remotion.dev/img/example-screenshot.png" // Placeholder image
        preset="slideUp"
        startFrame={mockupEntryDelay}
        rotate={{
          startAngle: { x: 10, y: 0 }, // Start with a slight X rotation
          endAngle: { x: 0, y: 0 },    // End upright
          startFrame: mockupEntryDelay,
          endFrame: mockupEntryDelay + mockupEntryDuration,
        }}
        exitPreset="slideDown"
        exitStartFrame={mockupExitStartFrame}
        exitDuration={mockupExitDuration}
        width={300} // Adjust size for better fit
        height={600}
        style={{
          position: 'absolute',
          top: height / 2 + 120, // Position based on spec: anchor="center", y=120
          left: width / 2,
          transform: 'translateX(-50%)',
        }}
      />
    </AbsoluteFill>
  );
};
