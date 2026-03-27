
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        layers={[
          { type: "radial", colors: ["#533AFD", "#7E6BFD", "#A99DFE"], centerX: 50, centerY: 50, radius: 100 }
        ]}
      />

      {/* Large 3D Question Mark (implemented with AnimatedText) - Rendered first to be behind other elements */}
      <AnimatedText
        text="?"
        preset="scaleUp"
        startFrame={30} // Appears slightly after background, before main text fully types
        anchor="center"
        fontSize={300}
        color="#FFFFFF"
        // Note: AnimatedText doesn't directly support z-index for layering,
        // but order in AbsoluteFill generally dictates z-order.
        // A slight offset might make it feel more "behind" or "integrated".
        offsetY={20}
        offsetX={-10}
        // No explicit exit, will fade with the scene transition
      />

      {/* Main Hook Question Text */}
      <AnimatedText
        text="Struggling to scale your Shopify store?"
        preset="typewriter"
        animationUnit="character"
        stagger={1} // Each character animates for 1 frame delay
        startFrame={15} // Starts typing at frame 15
        anchor="center"
        offsetY={-40}
        fontSize={72}
        fontWeight={600}
        color="#FFFFFF"
        // No explicit exit, will fade with the scene transition
      />

      {/* Pain Point Icon (implemented with AnimatedText for emojis) */}
      <AnimatedText
        text="📈 📉 😟"
        preset="scaleUp" // Scale up effect for the emojis
        startFrame={75} // Appears after main text is mostly typed
        anchor="center"
        offsetY={60} // Position below the main text
        fontSize={80}
        // No explicit exit, will fade with the scene transition
      />
    </AbsoluteFill>
  );
};
