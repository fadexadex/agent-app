import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const Scene1HookProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitStartFrame = 120 - 15; // Scene duration (120) - transition duration (15) = 105

  return (
    <AbsoluteFill>
      <Background
        layers={[
          {
            type: 'linear',
            colors: ['#FF6B6B', '#FFD93D'],
            angle: 45, // Diagonal gradient
          },
        ]}
      />

      {/* Headline Text */}
      <AnimatedText
        text="Design-to-Code Handoff Headaches?"
        preset="typewriter"
        animationUnit="character"
        stagger={1.5} // Corresponds to speed: 1.5
        startFrame={10}
        anchor="center"
        offsetY={-60}
        fontSize={72}
        fontWeight={600}
        color="#FFFFFF"
        exit={{
          startFrame: exitStartFrame,
          opacity: { from: 1, to: 0, duration: 15 },
        }}
      />

      {/* Pain Point Icons */}
      <AnimatedText
        text="🛠️ ⏳ 🐛 🔄"
        preset="scaleUp" // For "subtly flicker or scale"
        animationUnit="character"
        stagger={5} // Subtle stagger for individual icon animation
        startFrame={40}
        anchor="center"
        offsetY={80}
        fontSize={64}
        color="#FFFFFF"
        exit={{
          startFrame: exitStartFrame,
          opacity: { from: 1, to: 0, duration: 15 },
        }}
      />
    </AbsoluteFill>
  );
};