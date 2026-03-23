import React from "react";
import {
  useTextSplitter,
  useSegmentSplitter,
  useAnimatableUnitCount,
} from "./hooks/useTextSplitter";
import { useAnimationCalculator } from "./hooks/useAnimationCalculator";
import { useStyleComposer, getScaleOrigin } from "./hooks/useStyleComposer";
import { usePositioning } from "./hooks/usePositioning";
import { getGradientStyles } from "./utils/gradients";
import { getPreset } from "./presets";
import type { AnimatedTextProps, ParsedUnit } from "./types";

export const AnimatedText: React.FC<AnimatedTextProps> = (props) => {
  const {
    text,
    segments,
    animationUnit: animationUnitProp,
    preset = "none",
    typewriter,
    color,
    gradient,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    style,
    containerStyle,
    scale,
    mask: maskProp,
    // Spacing props
    wordGap,
    iconGap,
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
  } = props;

  // Determine if using segments mode
  const useSegments = segments && segments.length > 0;

  const presetValues = getPreset(preset);

  // Determine animation unit (preset can override)
  const animationUnit =
    animationUnitProp ?? presetValues.animationUnit ?? "full";

  // Split text/segments into units
  // For segments, we use the segment splitter which preserves per-segment styles
  // For plain text, we use the regular text splitter
  const textUnits = useTextSplitter(text || "", animationUnit);
  const segmentUnits = useSegmentSplitter(segments || [], animationUnit);

  // Use segment units if segments provided, otherwise text units
  const units: ParsedUnit[] = useSegments
    ? segmentUnits
    : textUnits.map((u) => ({ ...u })); // Convert TextUnit to ParsedUnit

  const totalAnimatableUnits = useAnimatableUnitCount(units);

  // Get combined text for typewriter mode
  const fullText = useSegments
    ? segments!.map((s) => s.text || "").join("")
    : text || "";

  // Get animation calculator
  const { getValuesForUnit, typewriterVisibleChars, showCursor } =
    useAnimationCalculator(props, totalAnimatableUnits);

  // Get style composer
  const { composeStyles } = useStyleComposer();

  // Get positioning
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

  // Get scale origin if provided
  const scaleOrigin = getScaleOrigin(scale);

  // Smart default for masking: auto-enable for slide presets (kinetic look)
  // but disable for others to preserve box-shadows and glow effects
  const isSlidePreset = preset?.toLowerCase().includes("slide");
  const shouldMask = maskProp ?? isSlidePreset;

  // Build base text styles
  const baseTextStyles: React.CSSProperties = {
    ...(color && { color }),
    ...(fontSize && { fontSize }),
    ...(fontWeight && { fontWeight }),
    ...(fontFamily && { fontFamily }),
    ...(letterSpacing && { letterSpacing }),
    ...(lineHeight && { lineHeight }),
    ...(gradient && getGradientStyles(gradient)),
    ...(textAlign && { textAlign }),
    ...style,
  };

  // Build positioning styles (applied to container)
  // Use CSS positioning when available (immune to parent transforms like CameraRig zoom)
  const useCssPositioning = positioning.isPositioned && positioning.cssPosition;
  const positioningStyles: React.CSSProperties = positioning.isPositioned
    ? {
        position: "absolute",
        left: useCssPositioning ? positioning.cssPosition!.left : 0,
        top: useCssPositioning ? positioning.cssPosition!.top : 0,
        ...(maxWidth && {
          maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
        }),
        ...(zIndex !== undefined && { zIndex }),
      }
    : {};

  // Check if typewriter mode
  const isTypewriter =
    preset === "typewriter" ||
    (typewriter !== undefined && typewriter !== false);

  // For typewriter, use string slicing (best practice)
  // Note: Typewriter mode doesn't support segments with individual styling
  if (isTypewriter && animationUnit === "character" && !useSegments) {
    const displayedText = fullText.slice(0, typewriterVisibleChars);
    const typewriterConfig =
      typeof typewriter === "object" ? typewriter : { cursor: true };
    const cursorChar = typewriterConfig.cursorChar || "|";

    const values = getValuesForUnit(0, false);
    const animationStyles = composeStyles(values, scaleOrigin, positioning);

    return (
      <span
        style={{
          ...baseTextStyles,
          ...positioningStyles,
          ...animationStyles,
          ...containerStyle,
        }}
      >
        {displayedText}
        {typewriterConfig.cursor !== false && (
          <span
            style={{
              opacity: showCursor ? 1 : 0,
              display: "inline",
            }}
          >
            {cursorChar}
          </span>
        )}
      </span>
    );
  }

  // For full text animation (no splitting)
  if (animationUnit === "full") {
    const values = getValuesForUnit(0, false);

    // Helper to render content (text or segments)
    const renderFullContent = () => {
      if (useSegments) {
        // Render each segment with its own styling
        return units.map((unit, index) => {
          const unitStyles: React.CSSProperties = {};
          if (unit.color) unitStyles.color = unit.color;
          if (unit.fontWeight) unitStyles.fontWeight = unit.fontWeight;
          if (unit.fontSize) unitStyles.fontSize = unit.fontSize;

          // Handle highlight/pill background
          if (unit.highlight) {
            const { backgroundColor, padding, borderRadius } = unit.highlight;
            unitStyles.backgroundColor = backgroundColor;
            unitStyles.padding =
              typeof padding === "number" ? `${padding}px` : padding;
            if (borderRadius) unitStyles.borderRadius = `${borderRadius}px`;
            unitStyles.display = "inline-block";
          }

          return (
            <span key={`segment-${index}`} style={unitStyles}>
              {unit.text}
            </span>
          );
        });
      }
      return fullText;
    };

    // For full text, masking wraps the entire text
    if (shouldMask) {
      // When masking, we need to separate positioning from animation:
      // - Positioning goes on the OUTER window (so it's placed correctly on screen)
      // - Animation transforms go on the INNER actor (so text moves within the window)

      // Get animation styles WITHOUT positioning (for inner element)
      const animationStylesWithoutPositioning = composeStyles(
        values,
        scaleOrigin,
      );
      const { transform: animationTransform, ...otherAnimationStyles } =
        animationStylesWithoutPositioning;

      // Get positioning styles WITH positioning (for outer element)
      const windowStyles = composeStyles(
        { blur: 0, opacity: 1, scale: 1, translateX: 0, translateY: 0 },
        undefined,
        positioning,
      );

      return (
        <span
          style={{
            ...positioningStyles,
            ...windowStyles,
            ...containerStyle,
            // The Window: clips content, positioned correctly
            display: "inline-flex",
            overflow: "hidden",
            verticalAlign: "top",
          }}
        >
          <span
            style={{
              ...baseTextStyles,
              ...otherAnimationStyles,
              // The Actor: animation transforms only (moves within the window)
              display: "inline-block",
              transform: animationTransform,
            }}
          >
            {renderFullContent()}
          </span>
        </span>
      );
    }

    const animationStyles = composeStyles(values, scaleOrigin, positioning);
    return (
      <span
        style={{
          ...baseTextStyles,
          ...positioningStyles,
          ...animationStyles,
          ...containerStyle,
        }}
      >
        {renderFullContent()}
      </span>
    );
  }

  // For word/character/line animation with stagger
  // Container needs positioning, individual units get animation transforms
  const containerAnimationStyles = composeStyles(
    { blur: 0, opacity: 1, scale: 1, translateX: 0, translateY: 0 },
    undefined,
    positioning,
  );

  // Calculate gap value for flex container
  const gapValue =
    wordGap !== undefined
      ? typeof wordGap === "number"
        ? `${wordGap}px`
        : wordGap
      : "0.25em";

  return (
    <span
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        alignItems: "center",
        ...positioningStyles,
        ...containerAnimationStyles,
        ...containerStyle,
      }}
    >
      {units.map((unit, index) => {
        // Track animatable index (excluding spaces)
        let animatableIndex = 0;
        for (let i = 0; i < index; i++) {
          if (!units[i].isSpace) {
            animatableIndex++;
          }
        }

        const unitValues = getValuesForUnit(
          unit.isSpace ? 0 : animatableIndex,
          !!unit.isSpace,
        );
        // Don't pass positioning to individual units - container handles it
        const animationStyles = composeStyles(unitValues, scaleOrigin);

        // Handle spaces
        if (unit.isSpace) {
          return (
            <span key={`space-${index}`} style={{ whiteSpace: "pre" }}>
              {unit.text}
            </span>
          );
        }

        // Build per-unit styles from segment (if using segments)
        const unitOverrideStyles: React.CSSProperties = {};
        if (unit.color) unitOverrideStyles.color = unit.color;
        if (unit.fontWeight) unitOverrideStyles.fontWeight = unit.fontWeight;
        if (unit.fontSize) unitOverrideStyles.fontSize = unit.fontSize;

        // Calculate spacing values
        const wordGapValue = gapValue; // Already calculated above
        const iconGapValue =
          iconGap !== undefined
            ? typeof iconGap === "number"
              ? `${iconGap}px`
              : iconGap
            : "0.3em";

        // Find next non-space unit to determine spacing
        const nextNonSpaceUnit = units.slice(index + 1).find((u) => !u.isSpace);
        const prevNonSpaceUnit = units
          .slice(0, index)
          .reverse()
          .find((u) => !u.isSpace);
        const isLastUnit = !nextNonSpaceUnit;

        // Smart spacing: use iconGap when adjacent to icons, wordGap between text
        if (unit.isIcon) {
          // Icon: use iconGap on left if preceded by text, on right if followed by text
          if (prevNonSpaceUnit && !prevNonSpaceUnit.isIcon) {
            unitOverrideStyles.marginLeft = iconGapValue;
          }
          if (nextNonSpaceUnit && !nextNonSpaceUnit.isIcon) {
            unitOverrideStyles.marginRight = iconGapValue;
          }
        } else {
          // Text unit: use wordGap to next text, iconGap to next icon
          if (!isLastUnit) {
            if (nextNonSpaceUnit?.isIcon) {
              // Next is icon - don't add margin, icon will handle its own marginLeft
            } else {
              // Next is text - add wordGap
              unitOverrideStyles.marginRight = wordGapValue;
            }
          }
        }

        // Handle highlight/pill background
        let highlightWrapperStyles: React.CSSProperties | undefined;
        if (unit.highlight) {
          const { backgroundColor, padding, borderRadius } = unit.highlight;
          highlightWrapperStyles = {
            backgroundColor,
            padding: typeof padding === "number" ? `${padding}px` : padding,
            borderRadius: borderRadius ? `${borderRadius}px` : undefined,
            display: "inline-block",
          };
        }

        // Masked rendering: "The Window and The Actor" pattern
        // Creates kinetic slide effect where text appears to enter from behind an invisible line
        if (shouldMask) {
          // Extract transform from animation styles for the inner element
          const { transform, ...otherAnimationStyles } = animationStyles;

          const content = (
            <span
              style={{
                // The Actor: all animations happen on the inner element
                // This creates the "portal" effect where text moves through the mask
                display: "inline-block",
                transform,
                ...otherAnimationStyles,
                ...unitOverrideStyles,
              }}
            >
              {unit.text}
            </span>
          );

          return (
            <span
              key={`unit-${index}`}
              style={{
                ...baseTextStyles,
                // The Window: clips content, defines visible area
                // No animations here - it just sits there
                display: "inline-flex",
                overflow: "hidden",
                verticalAlign: "top",
                ...highlightWrapperStyles,
              }}
            >
              {content}
            </span>
          );
        }

        // Standard rendering (no masking) - preserves box-shadows and glow effects
        const content = (
          <span
            style={{
              ...baseTextStyles,
              ...animationStyles,
              ...unitOverrideStyles,
            }}
          >
            {unit.text}
          </span>
        );

        // If highlight, wrap in highlight container
        if (highlightWrapperStyles) {
          return (
            <span key={`unit-${index}`} style={highlightWrapperStyles}>
              {content}
            </span>
          );
        }

        return (
          <span
            key={`unit-${index}`}
            style={{
              ...baseTextStyles,
              ...animationStyles,
              ...unitOverrideStyles,
            }}
          >
            {unit.text}
          </span>
        );
      })}
    </span>
  );
};
