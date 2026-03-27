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

// === Icons ===
const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 7L10.2 11.65C11.2667 12.45 12.7333 12.45 13.8 11.65L20 7"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const PaperclipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.4354 2.58198C20.6908 1.83737 19.6808 1.41905 18.6277 1.41905C17.5746 1.41905 16.5647 1.83737 15.82 2.58198L4.69466 13.7073C3.57736 14.8246 2.94966 16.34 2.94966 17.9202C2.94966 19.5004 3.57736 21.0157 4.69466 22.133C5.81195 23.2503 7.3273 23.878 8.90748 23.878C10.4877 23.878 12.003 23.2503 13.1203 22.133L23.414 11.8393"
      stroke="#444746"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// === Subcomponents ===

const VoiceIndicatorPill: React.FC<{
  frame: number;
  progress: number;
  exitOpacity: number;
  exitBlur: number;
}> = ({ frame, progress, exitOpacity, exitBlur }) => {
  // Snappy spring config gives a slight bounce naturally
  // Starting from 0.5 scale
  const scale = interpolate(progress, [0, 1], [0.5, 1], {
    extrapolateRight: "clamp",
  });
  
  // Slight Y offset correction
  const yOffsetIn = interpolate(progress, [0, 1], [20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        // Anchor center, Y: -120
        transform: `translate(-50%, calc(-50% - 120px + ${yOffsetIn}px)) scale(${scale})`,
        opacity: exitOpacity,
        filter: `blur(${exitBlur}px)`,
        width: 200,
        height: 60,
        backgroundColor: "#1A1A1A",
        borderRadius: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        fontFamily,
      }}
    >
      <EmailIcon />
      <div style={{ display: "flex", gap: "6px", alignItems: "center", height: "100%" }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const barHeight = interpolate(
            Math.sin(frame * 0.3 + i * 0.8),
            [-1, 1],
            [12, 32]
          );
          return (
            <div
              key={i}
              style={{
                width: 4,
                height: barHeight,
                backgroundColor: "white",
                borderRadius: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const MockupWindow: React.FC<{
  frame: number;
  progress: number;
  exitOpacity: number;
  exitBlur: number;
}> = ({ frame, progress, exitOpacity, exitBlur }) => {
  // Animation: preset slideInUp, 3d rotate
  const rotateX = interpolate(progress, [0, 1], [10, 0], {
    extrapolateRight: "clamp",
  });
  const yOffsetIn = interpolate(progress, [0, 1], [40, 0], {
    extrapolateRight: "clamp",
  });
  const opacityIn = interpolate(progress, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Typewriter effect (speed 2, start 40)
  const fullText =
    "Hi Emily,\n\nQuick check, would it be easier to move our call to later? Happy to work around what's best for you.\n\nBest,\nJonah";
  const charsToShow = Math.max(0, Math.floor((frame - 40) * 2));
  const displayedText = fullText.slice(0, charsToShow);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        // Anchor center, Y: 20
        transform: `translate(-50%, calc(-50% + 20px + ${yOffsetIn}px)) perspective(1000px) rotateX(${rotateX}deg)`,
        opacity: opacityIn * exitOpacity,
        filter: `blur(${exitBlur}px)`,
        width: 480,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#F2F6FC",
          padding: "16px 20px",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1F1F1F" }}>
          New Message
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Faux window controls */}
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#E5E7EB" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#E5E7EB" }} />
        </div>
      </div>

      {/* Email Fields */}
      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            borderBottom: "1px solid #E5E7EB",
            padding: "12px 0",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#6B7280", marginRight: 12 }}>To</span>
          <span
            style={{
              color: "#1F1F1F",
              backgroundColor: "#E8F0FE",
              padding: "4px 10px",
              borderRadius: 16,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Emily@voiceos.com
          </span>
        </div>
        <div
          style={{
            borderBottom: "1px solid #E5E7EB",
            padding: "14px 0",
            fontSize: 14,
            color: "#6B7280",
            display: "flex",
            alignItems: "center",
          }}
        >
          Subject
          <span style={{ color: "#1F1F1F", fontWeight: 500, marginLeft: 12 }}>
            Follow-Up on Project Update
          </span>
        </div>
      </div>

      {/* Body Area */}
      <div
        style={{
          padding: "20px",
          fontSize: 15,
          color: "#374151",
          minHeight: 160,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {displayedText}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          backgroundColor: "#F9FAFB",
        }}
      >
        <div
          style={{
            backgroundColor: "#0B57D0",
            color: "white",
            padding: "10px 24px",
            borderRadius: 24,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Send
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#444746", fontSize: 14 }}>
          <PaperclipIcon />
          Attach a file
        </div>
      </div>
    </div>
  );
};

const FeatureLabel: React.FC<{
  progress: number;
  exitOpacity: number;
  exitBlur: number;
}> = ({ progress, exitOpacity, exitBlur }) => {
  // Animation: fadeBlurIn - opacity 0->1, blur 8->0
  const opacityIn = interpolate(progress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });
  const blurIn = interpolate(progress, [0, 1], [8, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        // Anchor center, Y: 200
        transform: `translate(-50%, calc(-50% + 200px))`,
        opacity: opacityIn * exitOpacity,
        filter: `blur(${blurIn + exitBlur}px)`,
        width: 280,
        height: 48,
        backgroundColor: "#1A1A1A",
        borderRadius: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
        fontFamily,
        fontSize: 15,
        fontWeight: 500,
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      }}
    >
      Instantly replies for you
    </div>
  );
};

// === Main Scene ===

export const EmailFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance Springs
  const indicatorProgress = spring({
    frame: frame - 0,
    fps,
    config: { damping: 20, stiffness: 200 }, // snappy
  });

  const mockupProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200 }, // smooth
  });

  const labelProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 }, // smooth
  });

  // Exit Interpolations
  // Mockup exits at frame 100
  const mockupExitOpacity = interpolate(frame, [100, 115], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const mockupExitBlur = interpolate(frame, [100, 115], [0, 15], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Label exits at frame 103 (staggered by 3 frames)
  const labelExitOpacity = interpolate(frame, [103, 118], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const labelExitBlur = interpolate(frame, [103, 118], [0, 15], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Voice Indicator exits at frame 106 (staggered by 3 frames)
  const indicatorExitOpacity = interpolate(frame, [106, 121], [1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const indicatorExitBlur = interpolate(frame, [106, 121], [0, 15], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      {/* Elements render order: Mockup in back, Labels/Indicators on top */}
      <MockupWindow
        frame={frame}
        progress={mockupProgress}
        exitOpacity={mockupExitOpacity}
        exitBlur={mockupExitBlur}
      />
      <FeatureLabel
        progress={labelProgress}
        exitOpacity={labelExitOpacity}
        exitBlur={labelExitBlur}
      />
      <VoiceIndicatorPill
        frame={frame}
        progress={indicatorProgress}
        exitOpacity={indicatorExitOpacity}
        exitBlur={indicatorExitBlur}
      />
    </AbsoluteFill>
  );
};
