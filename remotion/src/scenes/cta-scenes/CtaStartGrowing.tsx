import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Background } from "@/components/Global";
import { AnimatedText } from "@/components/AnimatedText";
import { CTAButton } from "./CTAButton"; // Assuming CTAButton is in the same folder

export const CtaStartGrowing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const sceneDurationFrames = 105;
  const transitionDuration = 15; // Frames for fade in/out

  // Global fade-in (0 to 15 frames)
  const fadeInOpacity = interpolate(frame, [0, transitionDuration], [0, 1], { extrapolateRight: 'clamp' });

  // Global fade-out (90 to 105 frames)
  const fadeOutStartFrame = sceneDurationFrames - transitionDuration;
  const fadeOutOpacity = interpolate(frame, [fadeOutStartFrame, sceneDurationFrames], [1, 0], { extrapolateLeft: 'clamp' });

  const combinedOpacity = fadeInOpacity * fadeOutOpacity;

  return (
    <AbsoluteFill style={{ opacity: combinedOpacity }}>
      <Background layers={[{ type: "solid", color: "#007bff" }]} />

      {/* CTA Question Text */}
      <AnimatedText
        text="Ready to transform your store?"
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={10} // Typewriter starts at frame 10
        anchor="top-center"
        offsetY={100}
        fontSize={56}
        fontWeight={600}
        color="#FFFFFF"
        exit={{
          startFrame: 80, // Exit starts at frame 80
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 10, duration: 15 },
        }}
      />

      {/* CTA Button Component */}
      <CTAButton
        text="Get Started Free"
        textStartFrame={30} // Typewriter inside button starts at frame 30
        exit={{
          startFrame: 83, // Exit starts at frame 83 (staggered)
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 10, duration: 15 },
        }}
      />

      {/* Website URL Text */}
      <AnimatedText
        text="analyticsdashboard.io"
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={60} // Typewriter starts at frame 60
        anchor="bottom-center"
        offsetY={-60}
        fontSize={32}
        fontWeight={400}
        color="#FFFFFF"
        exit={{
          startFrame: 86, // Exit starts at frame 86 (staggered)
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 10, duration: 15 },
        }}
      />
    </AbsoluteFill>
  );
};
