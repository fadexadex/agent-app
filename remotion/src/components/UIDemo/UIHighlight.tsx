/**
 * UIHighlight Component
 *
 * Draws attention to UI elements with animated callouts.
 * Supports various highlight styles: ring, glow, box, arrow, spotlight.
 *
 * @example
 * ```tsx
 * import { UIHighlight } from '@/components/UIDemo';
 *
 * <UIHighlight
 *   x={100}
 *   y={200}
 *   width={150}
 *   height={50}
 *   type="ring"
 *   color="#6366F1"
 *   label="Click here"
 *   delay={30}
 * />
 * ```
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';

// ============================================
// Types
// ============================================

export type HighlightType = 'ring' | 'glow' | 'box' | 'arrow' | 'spotlight';
export type LabelPosition = 'top' | 'bottom' | 'left' | 'right';

export interface UIHighlightProps {
  /** X position of the highlight area */
  x: number;
  /** Y position of the highlight area */
  y: number;
  /** Width of the highlight area */
  width: number;
  /** Height of the highlight area */
  height: number;
  /** Type of highlight effect */
  type?: HighlightType;
  /** Highlight color (default: uses CSS currentColor) */
  color?: string;
  /** Optional label text */
  label?: string;
  /** Label position relative to highlight */
  labelPosition?: LabelPosition;
  /** Number of pulse animations (0 for static) */
  pulseCount?: number;
  /** Delay before highlight appears (frames) */
  delay?: number;
  /** Duration of entrance animation */
  entranceDuration?: number;
  /** Border radius of highlight area */
  borderRadius?: number;
  /** Spring configuration for animations */
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

// ============================================
// Default Values
// ============================================

const DEFAULT_SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

const LABEL_OFFSETS: Record<LabelPosition, { x: number; y: number }> = {
  top: { x: 0, y: -30 },
  bottom: { x: 0, y: 30 },
  left: { x: -20, y: 0 },
  right: { x: 20, y: 0 },
};

// ============================================
// Sub-Components
// ============================================

interface RingHighlightProps {
  width: number;
  height: number;
  color: string;
  progress: number;
  pulseProgress: number;
  borderRadius: number;
}

const RingHighlight: React.FC<RingHighlightProps> = ({
  width,
  height,
  color,
  progress,
  pulseProgress,
  borderRadius,
}) => {
  const scale = 1 + pulseProgress * 0.1;
  const opacity = progress * (1 - pulseProgress * 0.3);

  return (
    <div
      style={{
        width: width + 16,
        height: height + 16,
        border: `3px solid ${color}`,
        borderRadius: borderRadius + 8,
        transform: `translate(-8px, -8px) scale(${scale})`,
        opacity,
        boxSizing: 'border-box',
      }}
    />
  );
};

interface GlowHighlightProps {
  width: number;
  height: number;
  color: string;
  progress: number;
  pulseProgress: number;
  borderRadius: number;
}

const GlowHighlight: React.FC<GlowHighlightProps> = ({
  width,
  height,
  color,
  progress,
  pulseProgress,
  borderRadius,
}) => {
  const glowSize = 20 + pulseProgress * 10;
  const opacity = progress * 0.6;

  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        boxShadow: `0 0 ${glowSize}px ${glowSize / 2}px ${color}`,
        opacity,
      }}
    />
  );
};

interface BoxHighlightProps {
  width: number;
  height: number;
  color: string;
  progress: number;
  borderRadius: number;
}

const BoxHighlight: React.FC<BoxHighlightProps> = ({
  width,
  height,
  color,
  progress,
  borderRadius,
}) => {
  const clipPath = `inset(0 ${100 - progress * 100}% 0 0)`;

  return (
    <div
      style={{
        width: width + 8,
        height: height + 8,
        transform: 'translate(-4px, -4px)',
        border: `2px solid ${color}`,
        borderRadius: borderRadius + 4,
        clipPath,
        boxSizing: 'border-box',
      }}
    />
  );
};

interface ArrowHighlightProps {
  width: number;
  height: number;
  color: string;
  progress: number;
  pulseProgress: number;
  labelPosition: LabelPosition;
}

const ArrowHighlight: React.FC<ArrowHighlightProps> = ({
  width,
  height,
  color,
  progress,
  pulseProgress,
  labelPosition,
}) => {
  const arrowLength = 40;
  const bounce = 1 + pulseProgress * 0.15;

  // Calculate arrow position based on label position
  const getArrowStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      opacity: progress,
    };

    switch (labelPosition) {
      case 'top':
        return {
          ...baseStyles,
          left: width / 2 - 10,
          top: -arrowLength * bounce,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `${arrowLength}px solid ${color}`,
        };
      case 'bottom':
        return {
          ...baseStyles,
          left: width / 2 - 10,
          bottom: -arrowLength * bounce,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: `${arrowLength}px solid ${color}`,
        };
      case 'left':
        return {
          ...baseStyles,
          left: -arrowLength * bounce,
          top: height / 2 - 10,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderLeft: `${arrowLength}px solid ${color}`,
        };
      case 'right':
        return {
          ...baseStyles,
          right: -arrowLength * bounce,
          top: height / 2 - 10,
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          borderRight: `${arrowLength}px solid ${color}`,
        };
    }
  };

  return <div style={getArrowStyles()} />;
};

interface SpotlightHighlightProps {
  width: number;
  height: number;
  progress: number;
  borderRadius: number;
}

const SpotlightHighlight: React.FC<SpotlightHighlightProps> = ({
  width,
  height,
  progress,
  borderRadius,
}) => {


  return (
    <>
      {/* Dark overlay with cutout */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(0, 0, 0, ${0.7 * progress})`,
          pointerEvents: 'none',
          clipPath: `polygon(
            0% 0%,
            0% 100%,
            calc(50% - ${width / 2 + 10}px) 100%,
            calc(50% - ${width / 2 + 10}px) calc(50% - ${height / 2 + 10}px),
            calc(50% + ${width / 2 + 10}px) calc(50% - ${height / 2 + 10}px),
            calc(50% + ${width / 2 + 10}px) calc(50% + ${height / 2 + 10}px),
            calc(50% - ${width / 2 + 10}px) calc(50% + ${height / 2 + 10}px),
            calc(50% - ${width / 2 + 10}px) 100%,
            100% 100%,
            100% 0%
          )`,
        }}
      />
      {/* Highlight border */}
      <div
        style={{
          width: width + 20,
          height: height + 20,
          transform: 'translate(-10px, -10px)',
          border: `3px solid rgba(255, 255, 255, ${progress})`,
          borderRadius: borderRadius + 10,
          boxShadow: `0 0 30px rgba(255, 255, 255, ${0.5 * progress})`,
          boxSizing: 'border-box',
        }}
      />
    </>
  );
};

// ============================================
// Main Component
// ============================================

export const UIHighlight: React.FC<UIHighlightProps> = ({
  x,
  y,
  width,
  height,
  type = 'ring',
  color = '#6366F1',
  label,
  labelPosition = 'top',
  pulseCount = 2,
  delay = 0,
  entranceDuration,
  borderRadius = 4,
  springConfig = DEFAULT_SPRING_CONFIG,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const effectiveDuration = entranceDuration ?? Math.round(0.5 * fps);

  // Entrance animation
  const entranceProgress = spring({
    frame: frame - delay,
    fps,
    durationInFrames: effectiveDuration,
    config: springConfig,
  });

  // Pulse animation (loops)
  const pulseFrame = Math.max(0, frame - delay - effectiveDuration);
  const pulseDuration = Math.round(0.8 * fps);
  const currentPulse = Math.floor(pulseFrame / pulseDuration);
  const pulseProgress =
    currentPulse < pulseCount
      ? Math.sin((pulseFrame % pulseDuration) / pulseDuration * Math.PI)
      : 0;

  // Don't render before delay
  if (frame < delay) return null;

  // Render highlight based on type
  const renderHighlight = () => {
    switch (type) {
      case 'ring':
        return (
          <RingHighlight
            width={width}
            height={height}
            color={color}
            progress={entranceProgress}
            pulseProgress={pulseProgress}
            borderRadius={borderRadius}
          />
        );
      case 'glow':
        return (
          <GlowHighlight
            width={width}
            height={height}
            color={color}
            progress={entranceProgress}
            pulseProgress={pulseProgress}
            borderRadius={borderRadius}
          />
        );
      case 'box':
        return (
          <BoxHighlight
            width={width}
            height={height}
            color={color}
            progress={entranceProgress}
            borderRadius={borderRadius}
          />
        );
      case 'arrow':
        return (
          <ArrowHighlight
            width={width}
            height={height}
            color={color}
            progress={entranceProgress}
            pulseProgress={pulseProgress}
            labelPosition={labelPosition}
          />
        );
      case 'spotlight':
        return (
          <SpotlightHighlight
            width={width}
            height={height}
            progress={entranceProgress}
            borderRadius={borderRadius}
          />
        );
    }
  };

  // Label offset based on position
  const labelOffset = LABEL_OFFSETS[labelPosition];
  const labelX = width / 2 + labelOffset.x;
  const labelY = labelPosition === 'top' ? labelOffset.y - 10 : labelPosition === 'bottom' ? height + labelOffset.y + 10 : height / 2 + labelOffset.y;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        pointerEvents: 'none',
      }}
    >
      {renderHighlight()}

      {/* Label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            left: labelPosition === 'left' ? labelOffset.x - 10 : labelPosition === 'right' ? width + labelOffset.x + 10 : labelX,
            top: labelY,
            transform: labelPosition === 'left' || labelPosition === 'right' ? 'translateY(-50%)' : 'translateX(-50%)',
            color: color,
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            opacity: entranceProgress,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default UIHighlight;
