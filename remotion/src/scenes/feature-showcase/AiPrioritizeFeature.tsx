
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { AnimatedText } from '@/components/AnimatedText';
import { MotionContainer } from '@/components/Layout';

interface AIPillProps {
  delayFrame: number; // When the pill starts appearing
  durationFrames: number; // How long the pill is visible
  yOffset: number; // Vertical offset
}

const AIPill: React.FC<AIPillProps> = ({ delayFrame, durationFrames, yOffset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceDuration = 15; // 15 frames for entrance animation
  const exitDuration = 15;    // 15 frames for exit animation

  const entranceEndFrame = delayFrame + entranceDuration;
  const exitStartFrame = delayFrame + durationFrames - exitDuration;

  // Opacity and vertical translation for entrance/exit
  const visibilityProgress = interpolate(
    frame,
    [delayFrame, entranceEndFrame, exitStartFrame, delayFrame + durationFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    frame,
    [delayFrame, entranceEndFrame, exitStartFrame, delayFrame + durationFrames],
    [20, 0, 0, 20], // Starts lower, moves up, stays, moves down
    { extrapolateRight: 'clamp' }
  );

  // Pulsing scale effect using Math.sin for continuous loop
  // The pulse cycle is 30 frames long
  const sinPulse = interpolate(
    Math.sin(((frame - delayFrame) * Math.PI) / 15), 
    [-1, 1],
    [1, 1.05],
    { extrapolateRight: 'clamp' }
  );


  return (
    <AbsoluteFill style={{ 
      justifyContent: 'center', 
      alignItems: 'center', 
      opacity: visibilityProgress,
      transform: `translateY(${yOffset + translateY}px) scale(${sinPulse})`,
      zIndex: 10 // Ensure it's above the mockup but potentially below the tagline
    }}>
      <div 
        style={{ 
          backgroundColor: '#4CAF50', // Green pill
          color: 'white',
          padding: '10px 20px',
          borderRadius: '9999px', // Pill shape
          fontSize: 24,
          fontWeight: 600,
          whiteSpace: 'nowrap', // Prevent text wrapping
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
      >
        AI Prioritizing...
      </div>
    </AbsoluteFill>
  );
};


export const AiPrioritizeFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#E3F2FD', overflow: 'hidden' }}>
      {/* MotionContainer for the overall scene slide-in effect */}
      <MotionContainer initial="offscreen-right" duration={15} style={{ width, height }}>
        <Background layers={[{ type: 'solid', color: '#E3F2FD' }]} />

        {/* Task List Mockup */}
        {/* The entire MockupFrame sequence lasts for the full scene duration */}
        <Sequence from={0} durationInFrames={150} name="MockupFrame Sequence">
          <MockupFrame
            type="browser"
            anchor="center"
            offsetY={0}
            width={800} 
            height={500}
            browserConfig={{ url: "https://tasks.app/ai-prioritization" }}
            glass={{ blur: 5, opacity: 0.1 }}
            glare
          >
            {/* Initial tasks text */}
            {/* Visible from frame 0, types starting at 20, exits at 70 */}
            <Sequence from={0} durationInFrames={80} name="Initial Tasks"> 
              <AnimatedText
                text="Tasks:
- Draft Report (High)
- Schedule Meeting (Medium)
- Review Design (Critical)
- Follow Up Client (Low)"
                preset="typewriter"
                animationUnit="character"
                stagger={0.5}
                startFrame={20}
                anchor="top-left"
                offsetX={40}
                offsetY={40}
                fontSize={32}
                lineHeight={1.5}
                color="#333"
                exit={{
                  startFrame: 70, // Start fading out at frame 70, ends at 80
                  opacity: { from: 1, to: 0, duration: 10 },
                  blur: { from: 0, to: 5, duration: 10 },
                }}
              />
            </Sequence>
            {/* Prioritized tasks text */}
            {/* Appears at frame 80, exits at 120 */}
            <Sequence from={80} durationInFrames={70} name="Prioritized Tasks"> 
              <AnimatedText
                text="Tasks:
- Review Design (Critical)
- Draft Report (High)
- Schedule Meeting (Medium)
- Follow Up Client (Low)"
                preset="fadeBlurIn" // Simple fade in for the new list
                startFrame={80}
                anchor="top-left"
                offsetX={40}
                offsetY={40}
                fontSize={32}
                lineHeight={1.5}
                color="#333"
                exit={{
                  startFrame: 120, // Start fading out at frame 120, ends at 130
                  opacity: { from: 1, to: 0, duration: 10 },
                  blur: { from: 0, to: 5, duration: 10 },
                }}
              />
            </Sequence>
          </MockupFrame>
        </Sequence>

        {/* AI Prioritizing Pill */}
        {/* Appears at frame 60, visible for 40 frames, disappears at 100 */}
        <Sequence from={60} durationInFrames={40} name="AIPill Sequence"> 
          <AIPill delayFrame={60} durationFrames={40} yOffset={-150} />
        </Sequence>


        {/* Feature Tagline */}
        {/* Appears at frame 90, exits at frame 133 + 10 = 143. So total duration is 143 - 90 = 53 */}
        <Sequence from={90} durationInFrames={53} name="Tagline Sequence"> 
          <AnimatedText
            text="AI intelligently prioritizes your team's tasks."
            preset="typewriter"
            animationUnit="character"
            stagger={0.5}
            startFrame={90}
            anchor="center"
            offsetY={220}
            fontSize={48}
            fontWeight={700}
            color="#0D47A1"
            exit={{
              startFrame: 133, // Exits after mockup (120+10=130), with 3-frame stagger it's 133
              opacity: { from: 1, to: 0, duration: 10 },
              blur: { from: 0, to: 10, duration: 10 },
            }}
          />
        </Sequence>
      </MotionContainer>
    </AbsoluteFill>
  );
};
