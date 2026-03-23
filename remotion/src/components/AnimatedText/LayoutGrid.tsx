import React from "react";
import { usePositioning } from "./hooks/usePositioning";
import type { LayoutGridProps } from "./types";

/**
 * LayoutGrid component
 *
 * Handles grouped elements without manual offset calculations.
 * Essential for AI to create lists like "Translate. Dub. Distribute."
 *
 * Uses flexbox for layout and supports positioning props for placement.
 * CRITICAL: Uses transformStyle: 'preserve-3d' to maintain children's 3D context.
 *
 * @example
 * ```tsx
 * <LayoutGrid direction="column" gap={24} anchor="center">
 *   <AnimatedText text="Translate." preset="fadeBlurIn" stagger={0} fontSize={52} />
 *   <AnimatedText text="Dub." preset="fadeBlurIn" stagger={15} fontSize={52} />
 *   <AnimatedText text="Distribute." preset="fadeBlurIn" stagger={30} fontSize={52} />
 * </LayoutGrid>
 * ```
 */
export const LayoutGrid: React.FC<LayoutGridProps> = ({
  children,
  direction = "column",
  gap = 0,
  align = "center",
  justify = "center",
  // Positioning props
  anchor,
  offsetX,
  offsetY,
  x,
  y,
  textAlign,
  maxWidth,
  zIndex,
  anchorAnimation,
  style,
}) => {
  // 1. Calculate Positioning (Reuse the hook!)
  // This allows the ENTIRE grid to be placed/animated as one unit
  const positioning = usePositioning({
    anchor,
    offsetX,
    offsetY,
    x,
    y,
    textAlign,
    maxWidth,
    zIndex,
    anchorAnimation,
  });

  const { positionTransform, centerTransform, isPositioned, cssPosition } =
    positioning;

  // 2. Determine positioning strategy
  // If cssPosition is available, use CSS left/top (immune to parent transforms)
  // Otherwise, fall back to transform-based positioning
  const useCssPositioning = isPositioned && cssPosition;

  // Build transform string (only centering if using CSS positioning)
  let transform = "";
  if (isPositioned) {
    if (useCssPositioning) {
      // Only apply centering transform, position is handled by CSS left/top
      transform = centerTransform;
    } else {
      // Legacy: combine positioning with centering
      transform = `${positionTransform} ${centerTransform}`.trim();
    }
  }

  // Map align/justify to CSS values
  const alignItems =
    align === "start" ? "flex-start" : align === "end" ? "flex-end" : "center";
  const justifyContent =
    justify === "start"
      ? "flex-start"
      : justify === "end"
        ? "flex-end"
        : justify === "space-between"
          ? "space-between"
          : "center";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap: typeof gap === "number" ? `${gap}px` : gap,
        alignItems,
        justifyContent,

        // Positioning Logic
        // Use CSS positioning (immune to parent transforms like CameraRig zoom)
        position: isPositioned ? "absolute" : "relative",
        left: useCssPositioning ? cssPosition.left : isPositioned ? 0 : undefined,
        top: useCssPositioning ? cssPosition.top : isPositioned ? 0 : undefined,
        transform: transform || undefined, // Centering transform only when using CSS positioning

        // Size Constraints
        width: isPositioned ? undefined : "100%", // Full width in flow, auto in absolute
        height: isPositioned ? undefined : "100%",
        maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
        zIndex,

        // CRITICAL: Preserve 3D context of children
        // This ensures rotating elements (like phones) inside the grid
        // don't get flattened into 2D images.
        transformStyle: "preserve-3d",

        // Apply text alignment if specified
        ...(textAlign && { textAlign }),

        // Pass through custom styles (escape hatch for backgroundColor, padding, border, etc.)
        ...style,
      }}
    >
      {children}
    </div>
  );
};
