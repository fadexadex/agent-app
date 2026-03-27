import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import React from "react";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// Notion-style colors
const colors = {
  bg: "#F7F7F5",
  card: "#FFFFFF",
  text: "#37352F",
  textGray: "#9B9A97",
  border: "#E9E9E7",
  blue: "#2EAADC",
  cursor: "#000000",
};

export const SceneWorkspaceAssembly: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 1. Entrance & Exit Timing (30fps)
  // Main Mockup
  const mainMockupIn = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  const mainMockupOut = interpolate(frame, [110, 120], [1, 0], { extrapolateRight: "clamp" });
  
  // Title Block
  const titleIn = spring({ frame: frame - 35, fps, config: { damping: 200 } });
  const titleOut = interpolate(frame, [105, 115], [1, 0], { extrapolateRight: "clamp" });
  
  // Checklist
  const checklistIn = spring({ frame: frame - 40, fps, config: { damping: 200 } });
  const checklistOut = interpolate(frame, [100, 110], [1, 0], { extrapolateRight: "clamp" });
  
  // Database
  const databaseIn = spring({ frame: frame - 45, fps, config: { damping: 200 } });
  const databaseOut = interpolate(frame, [95, 105], [1, 0], { extrapolateRight: "clamp" });
  
  // Cursor
  const cursorIn = spring({ frame: frame - 70, fps, config: { damping: 20, stiffness: 100 } });
  const cursorOut = interpolate(frame, [90, 100], [1, 0], { extrapolateRight: "clamp" });
  
  // Click & Ripple
  // Cursor lands around frame 80, clicks at 82
  const clickScale = spring({ frame: frame - 82, fps, config: { damping: 15, stiffness: 300 } });
  const rippleScale = interpolate(frame - 82, [0, 15], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rippleOpacity = interpolate(frame - 82, [0, 15], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 2. Computed Values
  const mainScale = interpolate(mainMockupIn, [0, 1], [0.8, 1]) * interpolate(mainMockupOut, [0, 1], [0.9, 1]);
  const mainOpacity = interpolate(mainMockupIn, [0, 1], [0, 1]) * mainMockupOut;

  // Typewriter for Title
  const titleText = "Q3 Roadmap";
  const typewriterProgress = interpolate(frame - 35, [0, 25], [0, titleText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const displayTitle = titleText.slice(0, Math.floor(typewriterProgress));

  // Cursor movement
  const startX = width + 100;
  const startY = height + 100;
  const targetX = width / 2 + 150;
  const targetY = height / 2 + 150;
  const cursorX = interpolate(cursorIn, [0, 1], [startX, targetX]);
  const cursorY = interpolate(cursorIn, [0, 1], [startY, targetY]);
  // Calculate a slight dip for realistic movement using sin curve
  const pathDip = Math.sin(cursorIn * Math.PI) * 150;
  const finalCursorX = cursorX - pathDip;
  const finalCursorY = cursorY + pathDip;
  
  const cursorScaleBounce = 1 - (Math.sin(clickScale * Math.PI) * 0.15); // Bounce to 0.85 and back
  const finalCursorScale = cursorIn * cursorScaleBounce * cursorOut;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily }}>
      {/* Container with 3D Perspective */}
      <AbsoluteFill
        style={{
          perspective: "1200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 800,
            height: 600,
            backgroundColor: colors.card,
            borderRadius: 16,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05)",
            backdropFilter: "blur(20px)",
            transform: `rotateX(4deg) rotateY(-6deg) scale(${mainScale})`,
            opacity: mainOpacity,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Mac OS Window Header */}
          <div style={{ height: 48, borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FF5F56" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27C93F" }} />
          </div>

          {/* Page Content */}
          <div style={{ padding: "60px 80px", flex: 1, display: "flex", flexDirection: "column", gap: 32 }}>
            
            {/* Title Block */}
            <div
              style={{
                opacity: titleIn * titleOut,
                transform: `translateY(${interpolate(titleIn, [0, 1], [20, 0])}px)`,
              }}
            >
              <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, color: colors.text, minHeight: 58, display: "flex", alignItems: "center", gap: 4 }}>
                {displayTitle}
                {/* Blinking Cursor */}
                {frame > 35 && frame < 90 && Math.floor(frame / 15) % 2 === 0 && (
                  <div style={{ width: 3, height: 48, backgroundColor: colors.blue }} />
                )}
              </h1>
            </div>

            {/* Checklist Block */}
            <div
              style={{
                opacity: checklistIn * checklistOut,
                transform: `translateY(${interpolate(checklistIn, [0, 1], [20, 0])}px)`,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {[
                { text: "Finalize Product OKRs", w: 180 },
                { text: "Launch Marketing Campaign", w: 220 },
                { text: "Update Developer Docs", w: 190 },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${colors.border}`, flexShrink: 0 }} />
                  <div style={{ fontSize: 18, color: colors.text, fontWeight: 500 }}>{item.text}</div>
                </div>
              ))}
            </div>

            {/* Database Block */}
            <div
              style={{
                opacity: databaseIn * databaseOut,
                transform: `translateY(${interpolate(databaseIn, [0, 1], [20, 0])}px)`,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {/* Header Row */}
              <div style={{ display: "flex", borderBottom: `1px solid ${colors.border}`, backgroundColor: "#FAFAFA" }}>
                <div style={{ flex: 2, padding: "12px 16px", fontSize: 14, fontWeight: 600, color: colors.textGray, borderRight: `1px solid ${colors.border}` }}>Task</div>
                <div style={{ flex: 1, padding: "12px 16px", fontSize: 14, fontWeight: 600, color: colors.textGray, borderRight: `1px solid ${colors.border}` }}>Assignee</div>
                <div style={{ flex: 1, padding: "12px 16px", fontSize: 14, fontWeight: 600, color: colors.textGray }}>Status</div>
              </div>
              {/* Data Rows */}
              {[
                { task: "Design System 2.0", assignee: "Sarah", status: "In Progress", statusColor: "#FDE68A", statusText: "#D97706" },
                { task: "API Rate Limiting", assignee: "Alex", status: "Done", statusColor: "#D1FAE5", statusText: "#059669" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", borderBottom: i === 0 ? `1px solid ${colors.border}` : "none" }}>
                  <div style={{ flex: 2, padding: "12px 16px", fontSize: 15, color: colors.text, borderRight: `1px solid ${colors.border}` }}>{row.task}</div>
                  <div style={{ flex: 1, padding: "12px 16px", fontSize: 15, color: colors.textGray, borderRight: `1px solid ${colors.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: colors.border }} />
                      {row.assignee}
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: "12px 16px", display: "flex", alignItems: "center" }}>
                    <div style={{ padding: "4px 8px", borderRadius: 4, backgroundColor: row.statusColor, color: row.statusText, fontSize: 12, fontWeight: 600 }}>
                      {row.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </AbsoluteFill>

      {/* Ripple Effect Container */}
      {frame >= 82 && (
        <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              left: targetX - 40,
              top: targetY - 40,
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "3px solid rgba(0,0,0,0.5)",
              transform: `scale(${rippleScale})`,
              opacity: rippleOpacity,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Animated Cursor Overlay */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translate(${finalCursorX}px, ${finalCursorY}px) scale(${finalCursorScale})`,
            transformOrigin: "top left",
            opacity: cursorOut,
          }}
        >
          {/* Custom SVG Cursor for sleek, modern feel */}
          <svg width="42" height="42" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.2))" }}>
            <path d="M6 3.5V26L12.5 20.5L17.5 30L21.5 28L16.5 18.5H23L6 3.5Z" fill="#111111" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
      </AbsoluteFill>

      {/* Scene Exit Fade Overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: colors.bg,
          opacity: interpolate(frame, [105, 120], [0, 1], { extrapolateRight: "clamp" }),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
