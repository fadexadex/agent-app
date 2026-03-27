import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import React from "react";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// 1. Sleek floating pill-shaped prompt bar
const AIPromptPill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy entrance
  const entrance = spring({
    frame: frame - 10, // Start slightly delayed for impact
    fps,
    config: { damping: 15, stiffness: 200 },
  });
  const entranceScale = interpolate(entrance, [0, 1], [0.8, 1]);
  const entranceOpacity = interpolate(entrance, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Exit sequence starting at 106
  const exitProgress = interpolate(frame, [106, 116], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const exitScale = interpolate(exitProgress, [0, 1], [0.95, 1]);

  const scale = entranceScale * exitScale;
  const opacity = entranceOpacity * exitProgress;

  // Typewriter effect starting at frame 20
  const text = "Draft a launch plan...";
  const typingProgress = interpolate(frame, [20, 20 + text.length * 1.5], [0, text.length], {
    extrapolateRight: "clamp",
  });
  const displayedText = text.slice(0, Math.floor(typingProgress));
  const showCursor = frame > 10 && frame < 106;
  const cursorOpacity = Math.floor(frame / 15) % 2 === 0 ? 1 : 0;

  return (
    <div
      style={{
        width: "560px",
        height: "64px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "32px",
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        transform: `scale(${scale})`,
        opacity,
        zIndex: 10,
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#A855F7">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
      <div
        style={{
          marginLeft: "16px",
          fontSize: "22px",
          fontWeight: 500,
          color: "#374151",
          display: "flex",
          alignItems: "center",
        }}
      >
        {displayedText}
        {showCursor && (
          <span
            style={{
              opacity: cursorOpacity,
              borderLeft: "2px solid #A855F7",
              marginLeft: "4px",
              height: "22px",
            }}
          />
        )}
      </div>
    </div>
  );
};

// 2. Skeleton text lines with sweeping gradient
const SkeletonText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Master exit for all skeleton text at 100
  const exitProgress = interpolate(frame, [100, 110], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        opacity: exitProgress,
        padding: "32px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {[0, 1, 2].map((i) => {
        // Staggered entrance starting at 75
        const entrance = spring({
          frame: frame - 75 - i * 4,
          fps,
          config: { damping: 200 },
        });
        const opacity = interpolate(entrance, [0, 1], [0, 1]);
        const translateY = interpolate(entrance, [0, 1], [10, 0]);

        const width = i === 0 ? "85%" : i === 1 ? "100%" : "60%";

        // Shimmer sweep animation
        const sweep = interpolate(frame % 60, [0, 60], [-50, 150]);
        const background = `linear-gradient(90deg, #F3F4F6 ${sweep}%, #FFFFFF ${sweep + 20}%, #F3F4F6 ${sweep + 40}%)`;

        return (
          <div
            key={i}
            style={{
              height: "24px",
              width,
              background,
              borderRadius: "6px",
              opacity,
              transform: `translateY(${translateY}px)`,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.02)",
            }}
          />
        );
      })}
    </div>
  );
};

// 3. Document Card that morphs/expands
const AIDocumentCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Expand animation starting at 50
  const entrance = spring({
    frame: frame - 50,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const height = interpolate(entrance, [0, 1], [0, 240]);
  const opacity = interpolate(entrance, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Exit sequence starting at 103
  const exitProgress = interpolate(frame, [103, 113], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const exitScale = interpolate(exitProgress, [0, 1], [0.95, 1]);

  return (
    <div
      style={{
        width: "600px",
        height: `${height}px`,
        backgroundColor: "#FFFFFF",
        borderRadius: "24px",
        marginTop: "16px",
        boxShadow: "0 20px 40px -10px rgba(120, 0, 255, 0.15), 0 30px 60px -15px rgba(0, 150, 255, 0.1), 0 0 0 1px rgba(120, 0, 255, 0.05)",
        opacity: opacity * exitProgress,
        transform: `scale(${exitScale})`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        {frame >= 50 && <SkeletonText />}
      </div>
    </div>
  );
};

export const SceneNotionAIMagic: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smoothly shift the whole block upwards as the card expands 
  // so the visual center remains perfectly aligned
  const expandProgress = spring({
    frame: frame - 50,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  // The expanded card is 240px tall + 16px gap = 256px
  // Half of that is 128px, which is the offset needed to keep it centered
  const wrapperY = interpolate(expandProgress, [0, 1], [0, -128]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F7F7F5",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      <div
        style={{
          transform: `translateY(${wrapperY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          position: "relative",
        }}
      >
        <AIPromptPill />
        <AIDocumentCard />
      </div>
    </AbsoluteFill>
  );
};
