import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance Timings
  const startLogo = 0;
  const startBrand = 20;
  const startSubtitle = 35;

  // Exit Timings (Staggered by 3 frames: Subtitle -> Brand Text -> Logo)
  // Scene duration is 90 frames, so exits end around 87-90
  const exitSubtitle = 75;
  const exitBrand = 78;
  const exitLogo = 81;

  // -- Logo Animations --
  // Entrance: spring scale up
  const logoProgress = spring({
    frame: frame - startLogo,
    fps,
    config: { damping: 15, stiffness: 100, mass: 1 },
  });
  // Exit: scale down / fade out
  const logoExit = interpolate(frame, [exitLogo, exitLogo + 9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = logoProgress * logoExit;

  // -- Brand Text Animations --
  const brandProgress = spring({
    frame: frame - startBrand,
    fps,
    config: { damping: 200 },
  });
  const brandExit = interpolate(frame, [exitBrand, exitBrand + 9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brandY = interpolate(brandProgress, [0, 1], [30, 0], {
    extrapolateRight: "clamp",
  });
  const brandOpacity = brandProgress * brandExit;

  // -- Subtitle Animations --
  const subProgress = spring({
    frame: frame - startSubtitle,
    fps,
    config: { damping: 200 },
  });
  const subExit = interpolate(frame, [exitSubtitle, exitSubtitle + 9], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subY = interpolate(subProgress, [0, 1], [20, 0], {
    extrapolateRight: "clamp",
  });
  const subOpacity = subProgress * subExit;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F7F7F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
      }}
    >
      {/* Notion Logo Element */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoExit,
          marginBottom: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            backgroundColor: "#000000",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 72,
            fontWeight: 700,
            fontFamily,
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
          }}
        >
          N
        </div>
      </div>

      {/* Brand Text Element */}
      <h1
        style={{
          margin: 0,
          transform: `translateY(${brandY}px)`,
          opacity: brandOpacity,
          fontSize: 72,
          fontWeight: 700,
          color: "#37352F",
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        Notion.
      </h1>

      {/* Subtitle Element */}
      <h2
        style={{
          margin: 0,
          marginTop: 16,
          transform: `translateY(${subY}px)`,
          opacity: subOpacity,
          fontSize: 32,
          fontWeight: 400,
          color: "#6C6C6C",
          letterSpacing: "-0.01em",
        }}
      >
        For your life's work.
      </h2>
    </AbsoluteFill>
  );
};
