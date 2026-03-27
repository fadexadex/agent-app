import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { AnimatedText } from "@/components/AnimatedText";
import { Background } from "@/components/Global";

export const CtaStartGrowing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // CTA Button glow animation
  const glowOpacity = spring({
    frame: frame - 25, // Start glow shortly before text appears
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 0.5,
    },
  });

  const glowIntensity = interpolate(
    glowOpacity,
    [0, 1],
    [0, 0.4], // Animate from no glow to a visible glow
    { extrapolateRight: "clamp" }
  );

  const glowSize = interpolate(
    glowOpacity,
    [0, 1],
    [10, 30], // Animate glow spread
    { extrapolateRight: "clamp" }
  );

  const buttonGlow = `0 0 ${glowSize}px rgba(255, 255, 255, ${glowIntensity})`;

  return (
    <AbsoluteFill style={{ backgroundColor: "#007bff" }}>
      <Background layers={[{ type: "solid", color: "#007bff" }]} />

      {/* CTA Question */}
      <AnimatedText
        text="Ready to transform your store?"
        preset="typewriter"
        startFrame={10}
        animationUnit="character"
        stagger={1}
        anchor="top-center"
        offsetY={100}
        fontSize={56}
        fontWeight={600}
        color="#FFFFFF"
      />

      {/* CTA Button */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 70,
          borderRadius: 35,
          backgroundColor: "#0056b3", // Darker blue
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: buttonGlow,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)", // Center the button
        }}
      >
        <AnimatedText
          text="Get Started Free"
          preset="typewriter"
          startFrame={30}
          animationUnit="character"
          stagger={1}
          fontSize={36}
          fontWeight={700}
          color="#FFFFFF"
        />
      </div>

      {/* Website URL */}
      <AnimatedText
        text="analyticsdashboard.io"
        preset="typewriter"
        startFrame={60}
        animationUnit="character"
        stagger={1}
        anchor="bottom-center"
        offsetY={-60}
        fontSize={32}
        fontWeight={500}
        color="#FFFFFF"
      />
    </AbsoluteFill>
  );
};
