import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const Scene02Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scale animation for the dashboard icon
  const iconScale = spring({
    frame: frame, // Starts immediately
    fps,
    config: { damping: 200 }, // Smooth entry
  });

  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'solid', color: '#533AFD' }]} />

      {/* Dashboard Icon */}
      <AnimatedText
        text="📊"
        preset="scaleUp"
        startFrame={0}
        anchor="center"
        offsetY={-200} // Position above title
        fontSize={150}
        color="#FFFFFF"
        scale={iconScale} // Apply custom scale animation
        // AnimatedText's scaleUp preset uses its own spring, so applying custom scale directly might conflict or be redundant.
        // Let's rely on the preset's scale animation and just set startFrame.
        // The preset "scaleUp" handles the scaling from 0 to 1 automatically.
      />

      {/* Title */}
      <AnimatedText
        text="Introducing Stripe Analytics:"
        preset="typewriter"
        animationUnit="character" // Typewriter works character by character
        stagger={1} // Default stagger for typewriter
        startFrame={10}
        anchor="center"
        offsetY={-80}
        fontSize={60}
        fontWeight={600}
        color="#FFFFFF"
      />

      {/* Subtitle */}
      <AnimatedText
        text="Your Growth Engine for Shopify."
        preset="typewriter"
        animationUnit="character" // Typewriter works character by character
        stagger={1} // Default stagger for typewriter
        startFrame={30}
        anchor="center"
        offsetY={0}
        fontSize={40}
        fontWeight={400}
        color="#FFFFFF"
      />
    </AbsoluteFill>
  );
};
