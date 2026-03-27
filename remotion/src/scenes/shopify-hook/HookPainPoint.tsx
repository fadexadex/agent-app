import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Background } from "@/components/Global";
import { AnimatedText } from "@/components/AnimatedText";

export const HookPainPoint: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Scene transition: Fade out at the end (last 15 frames)
  const fadeOutOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOutOpacity,
        backgroundColor: "#1A1A1A",
      }}
    >
      <Background
        layers={[
          { type: "solid", color: "#1A1A1A" },
          {
            type: "radial",
            colors: ["#333333", "transparent"],
            centerX: 50,
            centerY: 50,
            radius: 120, // using a reasonable radius for the gradient
          },
        ]}
      />

      <AnimatedText
        text="Struggling to scale your Shopify store?"
        preset="typewriter"
        stagger={1.5}
        startFrame={10}
        anchor="center"
        offsetY={-40}
        fontSize={64}
        fontWeight={700}
        color="#FFFFFF"
        exit={{
          startFrame: durationInFrames - 15,
          opacity: { to: 0, duration: 15 },
          blur: { to: 12, duration: 15 },
        }}
      />

      <AnimatedText
        text="Lost in endless data, not seeing real growth?"
        preset="typewriter"
        stagger={1}
        startFrame={40}
        anchor="center"
        offsetY={40}
        fontSize={36}
        fontWeight={400}
        color="#FFFFFF"
        style={{ opacity: 0.8 }}
        exit={{
          startFrame: durationInFrames - 15,
          opacity: { to: 0, duration: 15 },
          blur: { to: 12, duration: 15 },
        }}
      />
    </AbsoluteFill>
  );
};
