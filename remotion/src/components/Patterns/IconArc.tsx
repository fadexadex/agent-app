import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
} from "remotion";

export interface IconConfig {
  /** Image source URL */
  src?: string;
  /** React node icon (alternative to src) */
  icon?: React.ReactNode;
  /** Icon name/label */
  name: string;
}

export interface IconArcProps {
  /** Array of icons to display */
  icons: IconConfig[];
  /** Radius of the arc in pixels */
  radius?: number;
  /** Start angle in degrees */
  startAngle?: number;
  /** End angle in degrees */
  endAngle?: number;
  /** Size of each icon */
  iconSize?: number;
  /** Background color for icon containers */
  iconBackground?: string;
  /** Shadow color */
  shadowColor?: string;
  /** Frames between each icon entrance */
  stagger?: number;
  /** Start frame for the animation */
  startFrame?: number;
  /** Center X position (percentage 0-100) */
  centerX?: number;
  /** Center Y position (percentage 0-100) */
  centerY?: number;
  /** Exit configuration */
  exit?: {
    startFrame: number;
    duration?: number;
    stagger?: number;
  };
}

export const IconArc: React.FC<IconArcProps> = ({
  icons,
  radius = 280,
  startAngle = -150,
  endAngle = -30,
  iconSize = 52,
  iconBackground = "#FFFFFF",
  shadowColor = "rgba(0, 0, 0, 0.1)",
  stagger = 3,
  startFrame = 0,
  centerX = 50,
  centerY = 50,
  exit,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Calculate center position
  const cx = (centerX / 100) * width;
  const cy = (centerY / 100) * height;

  // Calculate angle step
  const angleRange = endAngle - startAngle;
  const angleStep = icons.length > 1 ? angleRange / (icons.length - 1) : 0;

  return (
    <AbsoluteFill>
      {icons.map((iconConfig, index) => {
        // Calculate position on arc
        const angleDeg = startAngle + angleStep * index;
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = cx + radius * Math.cos(angleRad);
        const y = cy + radius * Math.sin(angleRad);

        // Entrance animation with stagger
        const iconDelay = startFrame + index * stagger;
        const entrance = spring({
          frame: frame - iconDelay,
          fps,
          config: { damping: 15, stiffness: 150 },
        });

        const scale = interpolate(entrance, [0, 1], [0, 1], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(entrance, [0, 1], [0, 1], {
          extrapolateRight: "clamp",
        });

        // Exit animation with stagger (reverse order)
        let exitOpacity = 1;
        let exitScale = 1;
        if (exit) {
          const exitStagger = exit.stagger || stagger;
          const reverseIndex = icons.length - 1 - index;
          const iconExitStart = exit.startFrame + reverseIndex * exitStagger;
          const exitDuration = exit.duration || 20;

          const exitProgress = interpolate(
            frame,
            [iconExitStart, iconExitStart + exitDuration],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          exitOpacity = 1 - exitProgress;
          exitScale = 1 - exitProgress * 0.3;
        }

        return (
          <div
            key={iconConfig.name}
            style={{
              position: "absolute",
              left: x - iconSize / 2,
              top: y - iconSize / 2,
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize / 4,
              backgroundColor: iconBackground,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${scale * exitScale})`,
              opacity: opacity * exitOpacity,
              boxShadow: `0 4px 12px ${shadowColor}`,
              overflow: "hidden",
            }}
          >
            {iconConfig.src ? (
              <Img
                src={iconConfig.src}
                style={{
                  width: iconSize * 0.7,
                  height: iconSize * 0.7,
                  objectFit: "contain",
                }}
              />
            ) : iconConfig.icon ? (
              <div
                style={{
                  width: iconSize * 0.7,
                  height: iconSize * 0.7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {iconConfig.icon}
              </div>
            ) : (
              <span
                style={{
                  fontSize: iconSize * 0.5,
                  fontWeight: 600,
                  color: "#333",
                }}
              >
                {iconConfig.name.charAt(0)}
              </span>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export default IconArc;
