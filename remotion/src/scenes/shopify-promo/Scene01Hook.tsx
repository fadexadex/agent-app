
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animations for QuestionMark3D (behind text)
  const questionMarkStartFrame = 0;
  const questionMarkScale = spring({
    frame: frame - questionMarkStartFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const questionMarkOpacity = interpolate(
    frame,
    [questionMarkStartFrame, questionMarkStartFrame + 30],
    [0, 0.18], // Slightly adjusted opacity for the background question mark
    { extrapolateRight: 'clamp' }
  );

  // Animations for AnimatedIcon (emojis)
  const iconStartFrame = 30; // Appear shortly after text starts
  const iconTranslation = spring({
    frame: frame - iconStartFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const iconOpacity = interpolate(
    frame,
    [iconStartFrame, iconStartFrame + 20],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Background
        layers={[
          {
            type: 'radial',
            colors: ["#533AFD", "#7E6BFD", "#A99DFE"],
            centerX: 50,
            centerY: 50,
            radius: 80,
          },
        ]}
        animated
        animationSpeed={0.5}
      />

      {/* QuestionMark3D (placeholder) - Represents a large 3D question mark behind the text. */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${questionMarkScale})`,
          fontSize: 300,
          fontWeight: 900,
          color: 'rgba(255, 255, 255, 1)', // White, opacity handled by interpolation
          opacity: questionMarkOpacity,
          zIndex: 5, // Behind the main text
          filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))', // Subtle glow
        }}
      >
        ?
      </div>

      <AnimatedText
        text="Struggling to scale your Shopify store?"
        preset="typewriter"
        animationUnit="character" // Changed to character for fine-grained typewriter effect
        stagger={1}
        startFrame={15}
        anchor="center"
        offsetY={-40}
        fontSize={64}
        fontWeight={700}
        color="#FFFFFF"
      />

      {/* AnimatedIcon (placeholder) - Represents a visual icon for pain point. */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, calc(-50% + 80px + ${interpolate(iconTranslation, [0, 1], [50, 0])}px))`,
          fontSize: 80,
          opacity: iconOpacity,
          zIndex: 10, // In front of the question mark
        }}
      >
        📈 📉 😟
      </div>
    </AbsoluteFill>
  );
};
