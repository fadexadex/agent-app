import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

export interface IndicatorPillProps {
  /** Icon to display - can be a React node or emoji string */
  icon: React.ReactNode | string;
  /** Background color of the pill */
  backgroundColor?: string;
  /** Color of the animated bars */
  barColor?: string;
  /** Number of animated bars */
  barCount?: number;
  /** Entrance delay in frames */
  delay?: number;
  /** Pill width */
  width?: number;
  /** Pill height */
  height?: number;
  /** Position from top */
  top?: number;
  /** Exit configuration */
  exit?: {
    startFrame: number;
    duration?: number;
  };
}

export const IndicatorPill: React.FC<IndicatorPillProps> = ({
  icon,
  backgroundColor = "#1A1A1A",
  barColor = "#FFFFFF",
  barCount = 5,
  delay = 0,
  width = 140,
  height = 56,
  top = 100,
  exit,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // Exit animation
  let exitOpacity = 1;
  let exitBlur = 0;
  if (exit) {
    const exitProgress = interpolate(
      frame,
      [exit.startFrame, exit.startFrame + (exit.duration || 20)],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    exitOpacity = 1 - exitProgress;
    exitBlur = exitProgress * 12;
  }

  // Animated bars - each bar oscillates at different phases
  const bars = Array.from({ length: barCount }, (_, i) => {
    const phase = (i / barCount) * Math.PI * 2;
    const barHeight = interpolate(
      Math.sin((frame - delay) * 0.3 + phase),
      [-1, 1],
      [8, 24]
    );
    return barHeight;
  });

  const renderIcon = () => {
    if (typeof icon === "string") {
      return (
        <span style={{ fontSize: height * 0.5 }}>{icon}</span>
      );
    }
    return icon;
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: top,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          backgroundColor,
          borderRadius: height / 2,
          padding: "0 20px",
          width,
          height,
          transform: `scale(${scale})`,
          opacity: opacity * exitOpacity,
          filter: exitBlur > 0 ? `blur(${exitBlur}px)` : undefined,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: height * 0.6,
            height: height * 0.6,
          }}
        >
          {renderIcon()}
        </div>

        {/* Animated bars */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            height: 32,
          }}
        >
          {bars.map((barHeight, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: barHeight,
                backgroundColor: barColor,
                borderRadius: 2,
                transition: "none",
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default IndicatorPill;
