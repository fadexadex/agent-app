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

// Components
const VoiceIndicatorPill: React.FC<{ progress: number; exitOpacity: number; exitBlur: number }> = ({ progress, exitOpacity, exitBlur }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(progress, [0, 1], [0.5, 1], { extrapolateRight: "clamp" });
  const yOffset = interpolate(progress, [0, 1], [20, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 200,
        height: 60,
        backgroundColor: "#1A1A1A",
        borderRadius: 30,
        transform: `translate(-50%, calc(-50% - 120px + ${yOffset}px)) scale(${scale})`,
        opacity: progress * exitOpacity,
        filter: `blur(${exitBlur}px)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        zIndex: 3,
      }}
    >
      {/* Email Icon */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>

      {/* Animated Sound Bars */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, height: 24 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const barHeight = interpolate(
            Math.sin(frame * 0.3 + i * 0.8),
            [-1, 1],
            [8, 24]
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

const EmailMockup: React.FC<{ progress: number; exitOpacity: number; exitBlur: number }> = ({ progress, exitOpacity, exitBlur }) => {
  const frame = useCurrentFrame();
  const rotateX = interpolate(progress, [0, 1], [10, 0], { extrapolateRight: "clamp" });
  const translateY = interpolate(progress, [0, 1], [40, 0], { extrapolateRight: "clamp" });
  const scale = interpolate(progress, [0, 1], [0.95, 1], { extrapolateRight: "clamp" });

  const fullText = "Hi Emily,\n\nQuick check, would it be easier to move our call to later? Happy to work around what's best for you.\n\nBest,\nJonah";
  const typewriterStart = 40;
  
  // Calculate character count avoiding negative numbers
  const charProgress = Math.max(0, frame - typewriterStart);
  // Speed is 2, meaning 2 characters per frame
  const charCount = Math.floor(
    interpolate(charProgress, [0, fullText.length / 2], [0, fullText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  
  const displayText = fullText.slice(0, charCount);
  const showCursor = frame >= typewriterStart && frame % 30 < 15 && charCount < fullText.length;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 480,
        backgroundColor: "white",
        borderRadius: 12,
        transform: `translate(-50%, calc(-50% + 20px + ${translateY}px)) scale(${scale}) rotateX(${rotateX}deg)`,
        opacity: progress * exitOpacity,
        filter: `blur(${exitBlur}px)`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 2,
      }}
    >
      {/* Header */}
      <div style={{ backgroundColor: "#F2F6FC", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#202124" }}>New message</span>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#E0E0E0" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#E0E0E0" }} />
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: "0 16px", borderBottom: "1px solid #F1F3F4", display: "flex", alignItems: "center", height: 40 }}>
        <span style={{ fontSize: 14, color: "#5F6368", width: 40 }}>To</span>
        <span style={{ fontSize: 14, color: "#202124", backgroundColor: "#E8F0FE", padding: "2px 8px", borderRadius: 12 }}>Emily@voiceos.com</span>
      </div>
      <div style={{ padding: "0 16px", borderBottom: "1px solid #F1F3F4", display: "flex", alignItems: "center", height: 40 }}>
        <span style={{ fontSize: 14, color: "#5F6368", width: 60 }}>Subject</span>
        <span style={{ fontSize: 14, color: "#202124" }}>Follow-Up on Project Update</span>
      </div>

      {/* Body */}
      <div style={{ padding: "16px", minHeight: 140, fontSize: 14, color: "#202124", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
        {displayText}
        {showCursor && <span style={{ borderRight: "2px solid black", marginLeft: 2 }} />}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #F1F3F4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            backgroundColor: "#1A73E8",
            color: "white",
            padding: "8px 24px",
            borderRadius: 18,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Send
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#1A73E8", fontSize: 14, fontWeight: 500 }}>Attach a file</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5F6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

const FeaturePill: React.FC<{ progress: number; exitOpacity: number; exitBlur: number }> = ({ progress, exitOpacity, exitBlur }) => {
  const yOffset = interpolate(progress, [0, 1], [10, 0], { extrapolateRight: "clamp" });
  const blurIn = interpolate(progress, [0, 1], [8, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, calc(-50% + 200px + ${yOffset}px))`,
        opacity: progress * exitOpacity,
        filter: `blur(${blurIn + exitBlur}px)`,
        backgroundColor: "#1A1A1A",
        color: "white",
        padding: "12px 24px",
        borderRadius: 24,
        fontSize: 16,
        fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        zIndex: 1,
      }}
    >
      Instantly replies for you
    </div>
  );
};

export const FeatureEmail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const voiceProgress = spring({
    frame: frame - 0,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const mockupProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200 },
  });

  const featureProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 },
  });

  // Exits staggered: Mockup (100), Label (103), Voice (106)
  const mockupExitOpacity = interpolate(frame, [100, 115], [1, 0], { extrapolateRight: "clamp" });
  const mockupExitBlur = interpolate(frame, [100, 115], [0, 15], { extrapolateRight: "clamp" });

  const labelExitOpacity = interpolate(frame, [103, 118], [1, 0], { extrapolateRight: "clamp" });
  const labelExitBlur = interpolate(frame, [103, 118], [0, 15], { extrapolateRight: "clamp" });

  const voiceExitOpacity = interpolate(frame, [106, 121], [1, 0], { extrapolateRight: "clamp" });
  const voiceExitBlur = interpolate(frame, [106, 121], [0, 15], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF", fontFamily, perspective: 1000 }}>
      <FeaturePill progress={featureProgress} exitOpacity={labelExitOpacity} exitBlur={labelExitBlur} />
      <EmailMockup progress={mockupProgress} exitOpacity={mockupExitOpacity} exitBlur={mockupExitBlur} />
      <VoiceIndicatorPill progress={voiceProgress} exitOpacity={voiceExitOpacity} exitBlur={voiceExitBlur} />
    </AbsoluteFill>
  );
};
