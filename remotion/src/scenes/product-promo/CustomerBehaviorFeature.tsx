import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Sequence, staticFile, interpolate, spring } from "remotion";
import { Background } from "@/components/Global";
import { MockupFrame } from "@/components/MockupFrame";
import { AnimatedText } from "@/components/AnimatedText";

// FeaturePill component definition
interface FeaturePillProps {
  text: string;
  startFrame: number;
  width?: number;
  height?: number;
  color?: string;
  textColor?: string;
  left: number; // Absolute left position
  bottom: number; // Absolute bottom position
}

const FeaturePill: React.FC<FeaturePillProps> = ({
  text,
  startFrame,
  width = 300,
  height = 48,
  color = '#007bff',
  textColor = 'white',
  left,
  bottom,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation for the pill container itself (fade in and scale up)
  const entranceAnimationProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 }, // Smooth entrance
  });

  const entranceOpacity = interpolate(
    entranceAnimationProgress,
    [0, 1],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const entranceScale = interpolate(
    entranceAnimationProgress,
    [0, 1],
    [0.8, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left,
        bottom,
        width,
        height,
        backgroundColor: color,
        borderRadius: height / 2, // Make it a pill shape
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: entranceOpacity,
        transform: `scale(${entranceScale})`,
        transformOrigin: 'center center', // Scale from its center
        zIndex: 10, // Ensure it's above the mockup
      }}
    >
      <AnimatedText
        text={text}
        preset="typewriter"
        animationUnit="character"
        stagger={1} // Corresponds to speed: 1 in the spec
        startFrame={startFrame + 5} // Text animation starts slightly after pill appears
        color={textColor}
        fontSize={20}
        fontWeight={600}
        // AnimatedText centers itself within the flex container by default
      />
    </div>
  );
};


// Main Scene Component
export const CustomerBehaviorFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Overall scene fade-in transition
  const fadeInOpacity = interpolate(
    frame,
    [0, 15], // 15 frames duration for fade in
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ opacity: fadeInOpacity }}>
        {/* Background */}
        <Background layers={[{ type: 'solid', color: '#F0F2F5' }]} />

        {/* Customer Dashboard Mockup */}
        <MockupFrame
          type="browser"
          // src={staticFile("customer-dashboard.png")} // Placeholder image - COMMENTED OUT due to missing file
          anchor="center"
          width={width * 0.75} // Adjust size for better fit
          height={height * 0.75} // Adjust size for better fit
        />

        {/* Customer Feature Label */}
        <FeaturePill
          text="Understand Your Customers"
          startFrame={30} // Pill entrance starts at frame 30, text typewriter starts at 30 + 5
          left={width / 2 - width * 0.75 / 2 - 20} // Position to the left of mockup's assumed left edge with padding
          bottom={height / 2 - height * 0.75 / 2 - 80} // Position below mockup's assumed bottom edge with padding
        />
      </div>
    </AbsoluteFill>
  );
};
