import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

// Custom Pill component for the logo
const Pill: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entryProgress = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 200,
    },
  });

  const scale = interpolate(entryProgress, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(entryProgress, [0, 0.5], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '60%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        backgroundColor: '#1E40AF', // Dark blue background
        color: 'white',
        padding: '10px 20px',
        borderRadius: 25, // Pill shape
        fontSize: 28,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        minWidth: 180,
        height: 50,
      }}
    >
      {text}
    </div>
  );
};


export const IntroProjectPilot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Duration for the content before the fade transition
  const contentDuration = 150 - 15; // Scene duration (150) - transition duration (15)

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={contentDuration} name="SceneContent">
        <AbsoluteFill style={{ backgroundColor: '#F0F2F5' }}>
          <Background layers={[{ type: 'solid', color: '#F0F2F5' }]} />

          {/* App Name */}
          <AnimatedText
            text="Meet ProjectPilot AI."
            preset="typewriter"
            animationUnit="character" // Changed to character for fine-grained typewriter effect
            stagger={1} // Adjusted stagger for character unit
            startFrame={30}
            anchor="center"
            offsetY={-120}
            fontSize={80}
            fontWeight={700}
            color="#333333"
          />

          {/* Tagline */}
          <AnimatedText
            text="Your intelligent project co-pilot."
            preset="typewriter"
            animationUnit="character" // Changed to character for fine-grained typewriter effect
            stagger={0.5} // Adjusted stagger for character unit
            startFrame={50}
            anchor="center"
            offsetY={-80}
            fontSize={48}
            fontWeight={500}
            color="#555555"
          />

          {/* App Mockup */}
          <MockupFrame
            type="browser"
            src="https://picsum.photos/seed/projectpilot/1200/800" // Placeholder image
            preset="springIn"
            width={width * 0.7}
            height={height * 0.6}
            style={{
                position: 'absolute',
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
            }}
            glass={{ blur: 10, opacity: 0.1 }}
            glare
            browserConfig={{ url: "https://projectpilot.ai/dashboard" }}
          />

          {/* Logo Pill */}
          <Pill text="ProjectPilot AI" startFrame={80} />

        </AbsoluteFill>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
    </TransitionSeries>
  );
};