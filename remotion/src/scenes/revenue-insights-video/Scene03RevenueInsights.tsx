import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';

interface Scene03RevenueInsightsProps {}

// Inline FeaturePill component
const FeaturePill: React.FC<{
  text: string;
  startFrame: number;
  overallEndFrame: number; // Total scene duration for exit timing
  color?: string;
  textColor?: string;
}> = ({ text, startFrame, overallEndFrame, color = '#1A1A1A', textColor = '#FFFFFF' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceDelay = startFrame;
  const entranceDuration = 20;

  // Exit: First to exit, around overallEndFrame - 30 frames for exit transition
  const exitStartFrame = overallEndFrame - 30; // Pill starts exiting 30 frames before scene ends
  const exitDuration = 15;

  return (
    <MotionContainer
      initial="offscreen-bottom"
      delay={entranceDelay}
      duration={entranceDuration}
      exit="slide-down"
      exitStartFrame={exitStartFrame}
      style={{
        position: 'absolute',
        bottom: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: color,
        borderRadius: 999,
        padding: '10px 25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3, // Above mockup
        boxShadow: '0px 10px 20px rgba(0,0,0,0.2)',
      }}
    >
      <AnimatedText
        text={text}
        preset="typewriter"
        startFrame={entranceDelay + 5} // Text types slightly after pill appears
        animationUnit="character"
        stagger={0.5} // Faster typing for pill text
        fontSize={28}
        fontWeight={600}
        color={textColor}
        // Exit for the text inside the pill should match the pill's exit
        exit={{
          startFrame: exitStartFrame,
          opacity: { from: 1, to: 0, duration: exitDuration },
        }}
      />
    </MotionContainer>
  );
};


export const Scene03RevenueInsights: React.FC<Scene03RevenueInsightsProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const sceneDuration = 135; // Total frames for the scene

  // Heading exit: Last to exit
  const headingExitStartFrame = sceneDuration - 10; // 10 frames before end
  const headingExitDuration = 10;

  // Mockup exit: Second to exit
  const mockupExitStartFrame = sceneDuration - 20; // 20 frames before end
  const mockupExitDuration = 15;

  return (
    <AbsoluteFill>
      {/* Background */}
      <Background layers={[{ type: 'linear', colors: ['#7E6BFD', '#A99DFE'], angle: 90 }]} />

      {/* Feature 1 Heading */}
      <AnimatedText
        text="Unlock Real-time Revenue Trends"
        preset="typewriter"
        startFrame={0}
        animationUnit="character"
        stagger={0.5}
        anchor="top-center" // Changed from 'top' to 'top-center' for precise centering
        offsetY={60}
        fontSize={70}
        fontWeight={700}
        color="#FFFFFF"
        style={{ zIndex: 4 }} // Highest z-index for heading
        exit={{
          startFrame: headingExitStartFrame,
          opacity: { from: 1, to: 0, duration: headingExitDuration },
          blur: { from: 0, to: 8, duration: headingExitDuration },
        }}
      />

      {/* Dashboard Mockup */}
      <MotionContainer
        initial="offscreen-bottom"
        delay={40} // Mockup slides in at frame 40
        duration={25}
        exit="slide-down"
        exitStartFrame={mockupExitStartFrame} // Mockup exits
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotateZ(2deg)`, // Slightly angled
          zIndex: 2, // Below heading, above background
          boxShadow: '0px 15px 30px rgba(0,0,0,0.3)', // Subtle shadow
          borderRadius: 15, // For the browser frame visual (MockupFrame handles true frame)
          overflow: 'hidden', // Ensure content within mockup respects bounds
          width: 800, // Explicit width for consistent look
          height: 500, // Explicit height
        }}
      >
        <MockupFrame
          type="browser"
          theme="light" // Assuming a light theme for dashboard
          browserConfig={{ url: "https://stripe.com/analytics" }}
          glass={true} // Add some glass effect
          glare={true} // Add glare
          width={800} // Pass width/height to MockupFrame as well
          height={500}
        >
          {/* Content inside the browser mockup */}
          <AbsoluteFill style={{ padding: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatedText
              text="Revenue: +15% WoW\nSales: $12,345\nAvg Order Value: $75\nConversion Rate: 2.1%"
              preset="typewriter"
              startFrame={40 + 10} // Text types 10 frames after mockup starts entering
              animationUnit="character"
              stagger={0.3}
              color="#333"
              fontSize={30}
              anchor="center" // Center within the browser content area
              style={{ lineHeight: 1.5 }} // Improve readability of multiline text
              exit={{
                startFrame: mockupExitStartFrame,
                opacity: { from: 1, to: 0, duration: mockupExitDuration },
              }}
            />
          </AbsoluteFill>
        </MockupFrame>
      </MotionContainer>

      {/* Feature Pill */}
      <FeaturePill
        text="Instant Sales Data & Growth Metrics"
        startFrame={80} // Pill starts entering at frame 80
        overallEndFrame={sceneDuration}
        color="#1A1A1A"
        textColor="#FFFFFF"
      />
    </AbsoluteFill>
  );
};