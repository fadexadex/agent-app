import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

export interface FeaturePillProps {
  /** Text content of the pill */
  text: string;
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Font weight */
  fontWeight?: number;
  /** Entrance delay in frames */
  delay?: number;
  /** Position from bottom */
  bottom?: number;
  /** Horizontal padding */
  paddingX?: number;
  /** Vertical padding */
  paddingY?: number;
  /** Border radius */
  borderRadius?: number;
  /** Exit configuration */
  exit?: {
    startFrame: number;
    duration?: number;
  };
  /** Custom anchor position */
  anchor?: "center" | "bottom-center" | "top-center";
}

export const FeaturePill: React.FC<FeaturePillProps> = ({
  text,
  backgroundColor = "#1A1A1A",
  textColor = "#FFFFFF",
  fontSize = 20,
  fontWeight = 500,
  delay = 0,
  bottom = 120,
  paddingX = 24,
  paddingY = 14,
  borderRadius = 100,
  exit,
  anchor = "bottom-center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation with smooth spring
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [20, 0]);
  const blur = interpolate(entrance, [0, 1], [8, 0]);

  // Exit animation
  let exitOpacity = 1;
  let exitBlur = 0;
  let exitTranslateY = 0;
  if (exit) {
    const exitDuration = exit.duration || 20;
    const exitProgress = interpolate(
      frame,
      [exit.startFrame, exit.startFrame + exitDuration],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    exitOpacity = 1 - exitProgress;
    exitBlur = exitProgress * 12;
    exitTranslateY = exitProgress * -20;
  }

  // Determine positioning based on anchor
  const getPositionStyles = (): React.CSSProperties => {
    switch (anchor) {
      case "top-center":
        return {
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: bottom, // reuse bottom as top offset
        };
      case "center":
        return {
          justifyContent: "center",
          alignItems: "center",
        };
      case "bottom-center":
      default:
        return {
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: bottom,
        };
    }
  };

  const combinedBlur = blur + exitBlur;
  const combinedTranslateY = translateY + exitTranslateY;

  return (
    <AbsoluteFill style={getPositionStyles()}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor,
          color: textColor,
          fontSize,
          fontWeight,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          paddingLeft: paddingX,
          paddingRight: paddingX,
          paddingTop: paddingY,
          paddingBottom: paddingY,
          borderRadius,
          opacity: opacity * exitOpacity,
          transform: `translateY(${combinedTranslateY}px)`,
          filter: combinedBlur > 0 ? `blur(${combinedBlur}px)` : undefined,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export default FeaturePill;
