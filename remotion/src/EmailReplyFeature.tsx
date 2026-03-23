import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { Background } from "@/components/Global";

// ==========================================
// Email Envelope Icon
// ==========================================

const EnvelopeIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = "#FFFFFF",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="3"
      fill={color}
      opacity={0.12}
    />
    <path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M22 6l-10 7L2 6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ==========================================
// Animated Sound Bars
// ==========================================

const AnimatedSoundBars: React.FC<{
  frame: number;
  fps: number;
  count?: number;
  color?: string;
}> = ({ frame, fps, count = 5, color = "#FFFFFF" }) => {
  const bars = Array.from({ length: count }, (_, i) => {
    const phase = i * 0.85;
    const freq = 1.0 + i * 0.45;
    const t = frame / fps;
    const barHeight = interpolate(
      Math.sin(t * Math.PI * 2 * freq + phase),
      [-1, 1],
      [5, 30]
    );

    return (
      <div
        key={i}
        style={{
          width: 3,
          height: barHeight,
          backgroundColor: color,
          borderRadius: 1.5,
        }}
      />
    );
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>{bars}</div>
  );
};

// ==========================================
// Voice Indicator Pill
// ==========================================

const VoiceIndicatorPill: React.FC<{
  frame: number;
  fps: number;
  entryFrame: number;
  exitFrame: number;
  exitDuration: number;
}> = ({ frame, fps, entryFrame, exitFrame, exitDuration }) => {
  // Entry: scale from 0.5 with slight Y offset, snappy spring
  const entry = spring({
    frame: frame - entryFrame,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const scale = interpolate(entry, [0, 1], [0.5, 1], {
    extrapolateRight: "clamp",
  });
  const yShift = interpolate(entry, [0, 1], [12, 0], {
    extrapolateRight: "clamp",
  });

  // Exit: blur out
  const exitT = interpolate(
    frame,
    [exitFrame, exitFrame + exitDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitOpacity = interpolate(exitT, [0, 1], [1, 0], {
    extrapolateRight: "clamp",
  });
  const exitBlur = interpolate(exitT, [0, 1], [0, 12], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        width: 200,
        height: 60,
        backgroundColor: "#1A1A1A",
        borderRadius: 30,
        transform: `scale(${scale}) translateY(${yShift}px)`,
        opacity: exitOpacity,
        filter: `blur(${exitBlur}px)`,
      }}
    >
      <EnvelopeIcon />
      <AnimatedSoundBars frame={frame} fps={fps} />
    </div>
  );
};

// ==========================================
// Gmail-Style Compose Window
// ==========================================

const EMAIL_BODY =
  "Hi Emily,\n\nQuick check, would it be easier to move our call to later? Happy to work around what's best for you.\n\nBest,\nJonah";

const ComposeWindow: React.FC<{
  frame: number;
  typewriterStartFrame: number;
  charsPerFrame: number;
}> = ({ frame, typewriterStartFrame, charsPerFrame }) => {
  const elapsed = frame - typewriterStartFrame;
  const charsVisible = Math.max(0, Math.floor(elapsed * charsPerFrame));
  const visibleText =
    frame >= typewriterStartFrame
      ? EMAIL_BODY.slice(0, charsVisible)
      : "";
  const isTyping =
    frame >= typewriterStartFrame && charsVisible < EMAIL_BODY.length;
  const cursorOn = isTyping && Math.floor(frame / 8) % 2 === 0;

  const font =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  return (
    <div
      style={{
        width: 420,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        overflow: "hidden",
        fontFamily: font,
        boxShadow:
          "0 8px 40px rgba(0, 0, 0, 0.10), 0 2px 10px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          backgroundColor: "#F2F2F2",
          borderBottom: "1px solid #E0E0E0",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#202124" }}>
          New message
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 15, color: "#5F6368" }}>—</span>
          <span style={{ fontSize: 15, color: "#5F6368" }}>×</span>
        </div>
      </div>

      {/* To field */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "9px 16px",
          borderBottom: "1px solid #EBEBEB",
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: "#5F6368",
            marginRight: 10,
            minWidth: 48,
          }}
        >
          To
        </span>
        <span style={{ fontSize: 13, color: "#202124" }}>
          Emily@voiceos.com
        </span>
      </div>

      {/* Subject field */}
      <div
        style={{
          padding: "9px 16px",
          borderBottom: "1px solid #EBEBEB",
        }}
      >
        <span style={{ fontSize: 13, color: "#202124", fontWeight: 500 }}>
          Follow-Up on Project Update
        </span>
      </div>

      {/* Email body */}
      <div style={{ padding: "16px", minHeight: 145 }}>
        <span
          style={{
            fontSize: 13,
            color: "#202124",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {visibleText}
          {cursorOn && (
            <span
              style={{
                display: "inline-block",
                width: 1.5,
                height: 15,
                backgroundColor: "#202124",
                marginLeft: 1,
                verticalAlign: "text-bottom",
              }}
            />
          )}
        </span>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderTop: "1px solid #EBEBEB",
        }}
      >
        <span style={{ fontSize: 12, color: "#1A73E8" }}>Attach a file</span>
        <div
          style={{
            backgroundColor: "#1A73E8",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 500,
            padding: "8px 22px",
            borderRadius: 4,
          }}
        >
          Send email
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Feature Label Pill
// ==========================================

const FeatureLabelPill: React.FC<{
  text: string;
  frame: number;
  fps: number;
  entryFrame: number;
  exitFrame: number;
  exitDuration: number;
}> = ({ text, frame, fps, entryFrame, exitFrame, exitDuration }) => {
  // Entry: fadeBlurIn with smooth spring
  const entry = spring({
    frame: frame - entryFrame,
    fps,
    config: { damping: 200 },
  });

  const entryOpacity = interpolate(entry, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });
  const entryBlur = interpolate(entry, [0, 1], [8, 0], {
    extrapolateRight: "clamp",
  });

  // Exit: blur out
  const exitT = interpolate(
    frame,
    [exitFrame, exitFrame + exitDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitOpacity = interpolate(exitT, [0, 1], [1, 0], {
    extrapolateRight: "clamp",
  });
  const exitBlur = interpolate(exitT, [0, 1], [0, 12], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 14,
        paddingBottom: 14,
        backgroundColor: "#1A1A1A",
        borderRadius: 24,
        opacity: entryOpacity * exitOpacity,
        filter: `blur(${entryBlur + exitBlur}px)`,
      }}
    >
      <span
        style={{
          color: "#FFFFFF",
          fontSize: 18,
          fontWeight: 500,
          whiteSpace: "nowrap",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ==========================================
// Main Scene: Email Reply Feature
// Duration: 120 frames
// ==========================================

export const EmailReplyFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Email window entrance: slideInUp + 3D rotateX, smooth spring, frame 20 ──
  const emailEntry = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200 },
  });

  const emailY = interpolate(emailEntry, [0, 1], [80, 0], {
    extrapolateRight: "clamp",
  });
  const emailEntryOpacity = interpolate(emailEntry, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });
  const emailRotateX = interpolate(emailEntry, [0, 1], [10, 0], {
    extrapolateRight: "clamp",
  });

  // ── Email exit: blur — exits FIRST at frame 100, duration 15 ──
  const emailExitT = interpolate(frame, [100, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const emailExitOpacity = interpolate(emailExitT, [0, 1], [1, 0], {
    extrapolateRight: "clamp",
  });
  const emailExitBlur = interpolate(emailExitT, [0, 1], [0, 12], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <Background layers={[{ type: "solid", color: "#FFFFFF" }]} />

      {/* Voice Indicator Pill — centered, 120px above center */}
      {/* Entry: frame 0, snappy spring | Exit: frame 106 (last), 14 frames */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ transform: "translateY(-120px)" }}>
          <VoiceIndicatorPill
            frame={frame}
            fps={fps}
            entryFrame={0}
            exitFrame={106}
            exitDuration={14}
          />
        </div>
      </AbsoluteFill>

      {/* Email Compose Window — centered, 20px below center */}
      {/* Entry: frame 20, smooth spring + 3D rotate | Exit: frame 100 (first), 15 frames */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            transform: `translateY(${20 + emailY}px) perspective(800px) rotateX(${emailRotateX}deg)`,
            opacity: emailEntryOpacity * emailExitOpacity,
            filter: `blur(${emailExitBlur}px)`,
          }}
        >
          <ComposeWindow
            frame={frame}
            typewriterStartFrame={40}
            charsPerFrame={2}
          />
        </div>
      </AbsoluteFill>

      {/* Feature Label Pill — centered, 200px below center */}
      {/* Entry: frame 60, fadeBlurIn | Exit: frame 103 (second), 15 frames */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ transform: "translateY(200px)" }}>
          <FeatureLabelPill
            text="Instantly replies for you"
            frame={frame}
            fps={fps}
            entryFrame={60}
            exitFrame={103}
            exitDuration={15}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
