import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { AnimatedText } from "@/components/AnimatedText";

interface CTAButtonProps {
  text: string;
  textStartFrame: number;
  exit?: {
    startFrame: number;
    opacity?: { from?: number; to?: number; duration?: number };
    blur?: { from?: number; to?: number; duration?: number };
    scale?: { from?: number; to?: number; duration?: number };
  };
}

export const CTAButton: React.FC<CTAButtonProps> = ({ text, textStartFrame, exit }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Button entrance animation
  const buttonEntryProgress = spring({
    frame,
    fps,
    config: { damping: 200 }, // Smooth entrance
  });

  const buttonScale = interpolate(buttonEntryProgress, [0, 1], [0.8, 1], { extrapolateRight: 'clamp' });
  const buttonOpacity = interpolate(buttonEntryProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // Glow effect animation (subtle pulsing, fades out with button)
  const glowPulse = interpolate(
    frame,
    [0, 60, 120], // Cycle over 2 seconds (60 frames * 2)
    [0.1, 0.3, 0.1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  let currentOpacity = buttonOpacity;
  let currentScale = buttonScale;
  let currentBlur = 0;

  // Handle exit animation if provided
  if (exit && frame >= exit.startFrame) {
    const exitDuration = exit.opacity?.duration || 15;
    const exitProgress = interpolate(
      frame,
      [exit.startFrame, exit.startFrame + exitDuration],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const opacityFrom = exit.opacity?.from ?? currentOpacity;
    const opacityTo = exit.opacity?.to ?? 0;
    currentOpacity = interpolate(exitProgress, [0, 1], [opacityFrom, opacityTo], { extrapolateLeft: 'clamp' });

    const scaleFrom = exit.scale?.from ?? currentScale;
    const scaleTo = exit.scale?.to ?? 0.8;
    currentScale = interpolate(exitProgress, [0, 1], [scaleFrom, scaleTo], { extrapolateLeft: 'clamp' });

    const blurFrom = exit.blur?.from ?? 0;
    const blurTo = exit.blur?.to ?? 10;
    currentBlur = interpolate(exitProgress, [0, 1], [blurFrom, blurTo], { extrapolateLeft: 'clamp' });
  }

  const boxShadowOpacity = interpolate(currentOpacity, [0, 1], [0, glowPulse], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const blurStyle = currentBlur > 0 ? `blur(${currentBlur}px)` : 'none';

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: currentOpacity,
        transform: `scale(${currentScale})`,
        filter: blurStyle,
      }}
    >
      <div
        style={{
          backgroundColor: "#0056b3",
          width: 300,
          height: 70,
          borderRadius: 35,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: `0 0 15px rgba(255, 255, 255, ${boxShadowOpacity}), 0 0 30px rgba(255, 255, 255, ${boxShadowOpacity * 0.6})`,
        }}
      >
        <AnimatedText
          text={text}
          preset="typewriter"
          animationUnit="character"
          stagger={1}
          startFrame={textStartFrame}
          anchor="center"
          fontSize={32}
          fontWeight={600}
          color="#FFFFFF"
          // The AnimatedText itself doesn't need an exit here,
          // as the parent CTAButton will handle the overall fade-out.
        />
      </div>
    </AbsoluteFill>
  );
};
