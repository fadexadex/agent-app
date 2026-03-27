import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { AnimatedText } from "@/components/AnimatedText";
import { Background } from "@/components/Global";

export const UnlockGrowthHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scene transition: Fade out the whole scene in the last 15 frames
  const sceneOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <Background
        layers={[
          {
            type: "linear",
            colors: ["#8BC6EC", "#9599E2"],
            angle: 135,
          },
        ]}
      />

      <AnimatedText
        text="Unlock Your E-commerce Growth."
        preset="typewriter"
        startFrame={10}
        anchor="center"
        offsetY={-40}
        fontSize={64}
        fontWeight={800}
        color="white"
        exit={{
          startFrame: 85,
          opacity: { from: 1, to: 0, duration: 15 },
        }}
      />

      <AnimatedText
        text="Insights that drive sales."
        preset="typewriter"
        startFrame={30}
        anchor="center"
        offsetY={40}
        fontSize={32}
        fontWeight={500}
        color="white"
        exit={{
          startFrame: 88, // Staggered by 3 frames
          opacity: { from: 1, to: 0, duration: 15 },
        }}
      />
    </AbsoluteFill>
  );
};
