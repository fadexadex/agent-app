import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { Background } from "@/components/Global";
import { AnimatedText } from "@/components/AnimatedText";
import React from 'react';

export const BenefitFocusEfficiency: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animation for "Reclaim Your Focus."
  const mainBenefitTextStartFrame = 0;

  // Animation for the custom chart
  const productivityChartStartFrame = 20;
  const chartEntranceProgress = spring({
    frame: frame - productivityChartStartFrame,
    fps,
    config: { damping: 200 },
  });
  const chartWidth = interpolate(chartEntranceProgress, [0, 1], [0, width * 0.4], { extrapolateRight: 'clamp' });
  const chartLineY = height / 2 + 20; // Y position for the line graph
  const chartEndX = (width / 2) + (width * 0.4) / 2; // End X position of the line

  // Animation for "Deliver projects faster, with less stress."
  const subBenefitTextStartFrame = 40;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Background
        layers={[
          {
            type: "radial",
            colors: ["#833AB4", "#FD1D1D", "#FCB045"],
            centerX: 50,
            centerY: 50,
            radius: 100, // Default radius, covers a good area
            animated: true, // Allow background to animate if it supports it
            animationSpeed: 0.5,
          }
        ]}
      />

      {/* Main Benefit Text */}
      <AnimatedText
        text="Reclaim Your Focus."
        preset="typewriter"
        startFrame={mainBenefitTextStartFrame}
        anchor="center"
        offsetY={-80}
        fontSize={72}
        fontWeight={700}
        color="#FFFFFF"
      />

      {/* Animated Productivity Chart Placeholder */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: chartLineY,
          transform: `translate(-50%, -50%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Animated Line */}
        <div
          style={{
            width: chartWidth,
            height: 8,
            backgroundColor: '#4CAF50', // Green for growth
            borderRadius: 4,
            opacity: chartEntranceProgress,
            transform: `translate(${width * 0.4 / 2}px, 0px)`, // Offset to center the growth from the middle
            transition: 'transform 0.1s ease-out'
          }}
        />
        {/* Target Icon (simple circle) */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: '#FFEB3B', // Yellow for target
            position: 'absolute',
            left: `${chartWidth}px`, // Follows the end of the line
            transform: `translate(-50%, -50%)`, // Center the circle
            opacity: chartEntranceProgress,
            transition: 'transform 0.1s ease-out'
          }}
        />
      </div>


      {/* Sub Benefit Text */}
      <AnimatedText
        text="Deliver projects faster, with less stress."
        preset="typewriter"
        startFrame={subBenefitTextStartFrame}
        anchor="center"
        offsetY={120}
        fontSize={42}
        fontWeight={500}
        color="#FFFFFF"
      />
    </AbsoluteFill>
  );
};