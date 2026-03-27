import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MotionContainer } from '@/components/Layout';

interface Scene05BenefitGrowthProps {}

export const Scene05BenefitGrowth: React.FC<Scene05BenefitGrowthProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Common exit animation start frame and duration
  const exitStartFrame = 90;
  const exitDuration = 30;

  // Custom Growth Chart Animation (scales and glows)
  const chartAnimationDelay = 15; // Start chart animation slightly after heading
  const chartAnimationDuration = 60; // How long it takes for the chart to "grow"

  const chartEntryProgress = spring({
    frame: frame - chartAnimationDelay,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const currentChartScale = interpolate(
    chartEntryProgress,
    [0, 1],
    [0.5, 1],
    { extrapolateRight: 'clamp' }
  );

  const glowOpacityProgress = interpolate(
    frame,
    [chartAnimationDelay, chartAnimationDelay + chartAnimationDuration / 2],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const lineDrawProgress = interpolate(
    frame,
    [chartAnimationDelay + 10, chartAnimationDelay + chartAnimationDuration - 10],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Growth line properties - max values for the line at full growth
  const maxLineSegmentWidth = 200;
  const maxLineSegmentHeight = 150;

  const currentLineSegmentWidth = interpolate(lineDrawProgress, [0, 1], [0, maxLineSegmentWidth]);
  const currentLineSegmentHeight = interpolate(lineDrawProgress, [0, 1], [0, maxLineSegmentHeight]);

  return (
    <AbsoluteFill>
      <Background
        layers={[
          { type: 'linear', colors: ['#533AFD', '#7E6BFD'], angle: 45, animated: true, animationSpeed: 0.5 }
        ]}
      />

      {/* Heading */}
      <AnimatedText
        text="Turn Insights into Unstoppable Growth."
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={10}
        anchor="center"
        offsetY={-60}
        fontSize={64}
        fontWeight={700}
        color="#FFFFFF"
        exit={{
          startFrame: exitStartFrame,
          opacity: { from: 1, to: 0, duration: exitDuration },
        }}
      />

      {/* Animated Growth Chart (Custom Implementation) */}
      <MotionContainer
        initial="scale-zero" // Start scaled down
        delay={chartAnimationDelay}
        duration={chartAnimationDuration}
        exit="fade-out" // Exit by fading out
        exitStartFrame={exitStartFrame}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${currentChartScale})`,
          width: 300,
          height: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          boxShadow: `0 0 30px rgba(255, 255, 255, ${glowOpacityProgress * 0.7}), 0 0 60px rgba(126, 107, 253, ${glowOpacityProgress * 0.5})`,
          borderRadius: 16,
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <svg width="250" height="150" viewBox="0 0 250 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Horizontal Axis */}
          <line x1="20" y1="130" x2="230" y2="130" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          {/* Vertical Axis */}
          <line x1="20" y1="130" x2="20" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

          {/* Upward trending line */}
          <path
            d={`M 20 130 
                L ${20 + currentLineSegmentWidth} ${130 - currentLineSegmentHeight}`}
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            style={{
                filter: `drop-shadow(0 0 5px rgba(255,255,255, ${glowOpacityProgress})) drop-shadow(0 0 10px rgba(126, 107, 253, ${glowOpacityProgress * 0.7}))`,
            }}
          />
        </svg>
        <div style={{ color: 'white', marginTop: 10, fontSize: 20, fontWeight: 'bold' }}>Growth +25%</div>
      </MotionContainer>

      {/* Tagline */}
      <AnimatedText
        text="Make data-driven decisions. Grow faster."
        preset="typewriter"
        animationUnit="character"
        stagger={0.5}
        startFrame={60}
        anchor="center"
        offsetY={100}
        fontSize={36}
        fontWeight={500}
        color="#FFFFFF"
        exit={{
          startFrame: exitStartFrame,
          opacity: { from: 1, to: 0, duration: exitDuration },
        }}
      />
    </AbsoluteFill>
  );
};
