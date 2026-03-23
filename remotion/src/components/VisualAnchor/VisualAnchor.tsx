import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from 'remotion';

// ============================================
// Types
// ============================================

export interface GlowingOrbProps {
  /** Primary color for the orb */
  color: string;
  /** Size in pixels */
  size?: number;
  /** Blur amount in pixels */
  blur?: number;
  /** Horizontal position (0-100%) */
  x?: number;
  /** Vertical position (0-100%) */
  y?: number;
  /** Opacity (0-1) */
  opacity?: number;
  /** Animation delay in frames */
  delay?: number;
  /** Enable floating animation */
  float?: boolean;
  /** Float intensity (pixels of movement) */
  floatIntensity?: number;
}

export interface BrandPillProps {
  /** Array of icon paths (use staticFile paths) */
  icons?: string[];
  /** Background color */
  backgroundColor?: string;
  /** Border radius */
  borderRadius?: number;
  /** Padding */
  padding?: string;
  /** Gap between icons */
  gap?: number;
  /** Icon size */
  iconSize?: number;
  /** Position from top */
  top?: number;
  /** Animation delay */
  delay?: number;
  /** Entry animation preset */
  entryPreset?: 'fadeIn' | 'slideDown' | 'scaleIn';
  /** Enable backdrop blur */
  backdropBlur?: boolean;
  /** Children to render instead of icons */
  children?: React.ReactNode;
}

export interface IconCircleProps {
  /** Array of icon paths */
  icons: string[];
  /** Radius of the circle arrangement */
  radius?: number;
  /** Icon size */
  iconSize?: number;
  /** Center X position */
  centerX?: number;
  /** Center Y position */
  centerY?: number;
  /** Rotation speed (degrees per frame) */
  rotationSpeed?: number;
  /** Animation delay */
  delay?: number;
  /** Show center element */
  showCenter?: boolean;
  /** Center element (logo or icon) */
  centerElement?: React.ReactNode;
}

export interface FloatingShapeProps {
  /** Shape type */
  type: 'circle' | 'square' | 'rounded-square' | 'ring';
  /** Size in pixels */
  size?: number;
  /** Color */
  color?: string;
  /** Border width (for ring type) */
  borderWidth?: number;
  /** Position X (0-100%) */
  x?: number;
  /** Position Y (0-100%) */
  y?: number;
  /** Rotation speed */
  rotationSpeed?: number;
  /** Opacity */
  opacity?: number;
  /** Animation delay */
  delay?: number;
}

// ============================================
// GlowingOrb Component
// ============================================

/**
 * A soft, blurred glowing orb for background visual interest.
 * Use multiple orbs with different colors and positions for depth.
 */
export const GlowingOrb: React.FC<GlowingOrbProps> = ({
  color,
  size = 300,
  blur = 60,
  x = 50,
  y = 50,
  opacity = 0.4,
  delay = 0,
  float = true,
  floatIntensity = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  // Entrance animation
  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 100, stiffness: 80 },
  });

  // Floating animation
  const floatOffset = float
    ? Math.sin((frame + delay * 10) * 0.05) * floatIntensity
    : 0;

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}, transparent)`,
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) translateY(${floatOffset}px)`,
        filter: `blur(${blur}px)`,
        opacity: opacity * entrance,
        pointerEvents: 'none',
      }}
    />
  );
};

// ============================================
// BrandPill Component
// ============================================

/**
 * A pill-shaped container for icons or brand elements.
 * Great for visual continuity across scenes.
 */
export const BrandPill: React.FC<BrandPillProps> = ({
  icons = [],
  backgroundColor = 'rgba(255,255,255,0.1)',
  borderRadius = 50,
  padding = '12px 24px',
  gap = 12,
  iconSize = 24,
  top = 60,
  delay = 0,
  entryPreset = 'fadeIn',
  backdropBlur = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  // Entry animations based on preset
  let translateY = 0;
  let scale = 1;
  let opacity = 1;

  if (entryPreset === 'fadeIn') {
    opacity = spring({
      frame: localFrame,
      fps,
      config: { damping: 100 },
    });
  } else if (entryPreset === 'slideDown') {
    translateY = interpolate(
      spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 100 } }),
      [0, 1],
      [-30, 0]
    );
    opacity = spring({ frame: localFrame, fps, config: { damping: 100 } });
  } else if (entryPreset === 'scaleIn') {
    scale = spring({
      frame: localFrame,
      fps,
      config: { damping: 12, stiffness: 150 },
    });
    opacity = spring({ frame: localFrame, fps, config: { damping: 100 } });
  }

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px) scale(${scale})`,
        display: 'flex',
        alignItems: 'center',
        gap,
        padding,
        backgroundColor,
        borderRadius,
        backdropFilter: backdropBlur ? 'blur(10px)' : undefined,
        opacity,
      }}
    >
      {children || icons.map((icon, i) => (
        <Img
          key={i}
          src={staticFile(icon)}
          style={{
            width: iconSize,
            height: iconSize,
            objectFit: 'contain',
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// IconCircle Component
// ============================================

/**
 * Arranges icons in a circular pattern around a center point.
 * Great for showing integrations, features, or app ecosystems.
 */
export const IconCircle: React.FC<IconCircleProps> = ({
  icons,
  radius = 150,
  iconSize = 48,
  centerX = 960,
  centerY = 540,
  rotationSpeed = 0,
  delay = 0,
  showCenter = true,
  centerElement,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  // Entrance animation
  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Rotation
  const rotation = rotationSpeed * frame;

  return (
    <>
      {icons.map((icon, i) => {
        const angle = (i / icons.length) * Math.PI * 2 - Math.PI / 2 + (rotation * Math.PI / 180);
        const x = centerX + Math.cos(angle) * radius * entrance;
        const y = centerY + Math.sin(angle) * radius * entrance;

        // Staggered entrance
        const staggerDelay = i * 3;
        const iconEntrance = spring({
          frame: Math.max(0, localFrame - staggerDelay),
          fps,
          config: { damping: 12, stiffness: 150 },
        });

        return (
          <Img
            key={i}
            src={staticFile(icon)}
            style={{
              position: 'absolute',
              left: x - iconSize / 2,
              top: y - iconSize / 2,
              width: iconSize,
              height: iconSize,
              borderRadius: 12,
              opacity: iconEntrance,
              transform: `scale(${iconEntrance})`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          />
        );
      })}

      {/* Center element */}
      {showCenter && (
        <div
          style={{
            position: 'absolute',
            left: centerX - iconSize * 0.75,
            top: centerY - iconSize * 0.75,
            width: iconSize * 1.5,
            height: iconSize * 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: entrance,
            transform: `scale(${entrance})`,
          }}
        >
          {centerElement}
        </div>
      )}
    </>
  );
};

// ============================================
// FloatingShape Component
// ============================================

/**
 * A decorative floating shape for visual accents.
 */
export const FloatingShape: React.FC<FloatingShapeProps> = ({
  type,
  size = 200,
  color = 'rgba(255,255,255,0.1)',
  borderWidth = 2,
  x = 50,
  y = 50,
  rotationSpeed = 0.5,
  opacity = 0.3,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  // Entrance animation
  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 100 },
  });

  // Rotation
  const rotation = frame * rotationSpeed;

  // Shape styles
  const shapeStyles: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${entrance})`,
    opacity: opacity * entrance,
    pointerEvents: 'none',
  };

  switch (type) {
    case 'circle':
      return (
        <div
          style={{
            ...shapeStyles,
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
      );

    case 'square':
      return (
        <div
          style={{
            ...shapeStyles,
            width: size,
            height: size,
            backgroundColor: color,
          }}
        />
      );

    case 'rounded-square':
      return (
        <div
          style={{
            ...shapeStyles,
            width: size,
            height: size,
            borderRadius: size * 0.15,
            backgroundColor: color,
          }}
        />
      );

    case 'ring':
      return (
        <div
          style={{
            ...shapeStyles,
            width: size,
            height: size,
            borderRadius: size * 0.15,
            border: `${borderWidth}px solid ${color}`,
            backgroundColor: 'transparent',
          }}
        />
      );

    default:
      return null;
  }
};

// ============================================
// DotGrid Component
// ============================================

export interface DotGridProps {
  /** Dot color */
  color?: string;
  /** Grid spacing */
  spacing?: number;
  /** Dot size */
  dotSize?: number;
  /** Opacity */
  opacity?: number;
  /** Animation delay */
  delay?: number;
}

/**
 * A subtle dot grid pattern for backgrounds.
 */
export const DotGrid: React.FC<DotGridProps> = ({
  color = 'rgba(255,255,255,0.2)',
  spacing = 40,
  dotSize = 1,
  opacity = 0.5,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);

  const entrance = spring({
    frame: localFrame,
    fps,
    config: { damping: 100 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(${color} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        opacity: opacity * entrance,
        pointerEvents: 'none',
      }}
    />
  );
};

// ============================================
// Exports
// ============================================

export default {
  GlowingOrb,
  BrandPill,
  IconCircle,
  FloatingShape,
  DotGrid,
};
