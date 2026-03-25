
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import React from 'react';

// --- Custom Component: AnimatedCheckmark ---
interface AnimatedCheckmarkProps {
  startFrame: number;
  durationFrames: number;
  exitStartFrame: number;
  exitDurationFrames: number;
  color?: string;
  size?: number;
}

const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({
  startFrame,
  durationFrames,
  exitStartFrame,
  exitDurationFrames,
  color = '#059669',
  size = 150,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const checkmarkProgress = interpolate(
    entranceProgress,
    [0, 1],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const scale = spring({
    frame: frame - startFrame - durationFrames * 0.8, // Start bounce towards end of draw
    fps,
    config: { damping: 8, stiffness: 200 }, // Bouncy
  });

  const exitOpacity = interpolate(
    frame,
    [exitStartFrame, exitStartFrame + exitDurationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // SVG path for a checkmark
  // viewBox="0 0 24 24" gives roughly 24 units. Stroke-width 2-3 is good.
  const pathLength = 25; // Approximate path length for dasharray/offset
  const checkmarkPath = "M5 13l4 4L19 7";

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: exitOpacity,
        display: frame < startFrame ? 'none' : 'block', // Hide before start
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d={checkmarkPath}
          strokeDasharray={pathLength}
          strokeDashoffset={interpolate(checkmarkProgress, [0, 1], [pathLength, 0], { extrapolateRight: 'clamp' })}
        />
      </svg>
    </div>
  );
};

// --- Custom Component: ProductivityBarChart ---
interface ProductivityBarChartProps {
  startFrame: number;
  durationFrames: number;
  exitStartFrame: number;
  exitDurationFrames: number;
  width?: number;
  height?: number;
}

const ProductivityBarChart: React.FC<ProductivityBarChartProps> = ({
  startFrame,
  durationFrames,
  exitStartFrame,
  exitDurationFrames,
  width = 500,
  height = 300,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const barHeightAnimation = interpolate(
    entranceProgress,
    [0, 1],
    [0, 1], // Animates from 0 to 1
    { extrapolateRight: 'clamp' }
  );

  const exitOpacity = interpolate(
    frame,
    [exitStartFrame, exitStartFrame + exitDurationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const beforeHeightRatio = 0.6; // 60% of max height
  const afterHeightRatio = 0.9;  // 90% of max height

  const barWidth = 100;
  const gap = 50;

  const beforeBarHeight = height * beforeHeightRatio;
  const afterBarAnimatedHeight = height * afterHeightRatio * barHeightAnimation;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, 120px)', // Position below text
        width,
        height,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: `${gap}px`,
        opacity: exitOpacity,
        visibility: frame < startFrame ? 'hidden' : 'visible',
      }}
    >
      {/* Before FlowPilot Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: barWidth,
            height: beforeBarHeight,
            backgroundColor: '#D1D5DB', // Gray
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 24,
            transition: 'height 0.3s ease-out', // For smooth initial appearance if not animated
          }}
        >
          60%
        </div>
        <div style={{ marginTop: 10, color: '#4B5563', fontSize: 20, fontWeight: 600 }}>Before</div>
      </div>

      {/* With FlowPilot Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: barWidth,
            height: afterBarAnimatedHeight,
            backgroundColor: '#10B981', // Vibrant Green
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.7)', // Glowing effect
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 24,
            overflow: 'hidden', // Hide text until bar is tall enough
          }}
        >
          {barHeightAnimation > 0.5 && '90%'} {/* Show % when bar is tall enough */}
        </div>
        <div style={{ marginTop: 10, color: '#059669', fontSize: 20, fontWeight: 600 }}>With FlowPilot</div>
      </div>
    </div>
  );
};


// --- Main Scene Component ---
export const BenefitProductivity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit animation durations
  const exitDuration = 20;

  return (
    <AbsoluteFill style={{ backgroundColor: '#D4EDDA' }}>
      <Background
        layers={[
          { type: 'linear', colors: ['#D4EDDA', '#C3E6CB'], angle: 90 },
        ]}
      />

      {/* Benefit Headline */}
      <AnimatedText
        text="Focus on what truly matters."
        preset="typewriter"
        animationUnit="character" // Character for typewriter effect
        stagger={0.5} // Faster typewriter
        startFrame={0}
        anchor="center"
        offsetY={-120}
        fontSize={80}
        fontWeight={900}
        color="#059669" // Emerald green
        exit={{
          startFrame: 90, // Exit at 90 frames, end at 110
          opacity: { from: 1, to: 0, duration: exitDuration },
        }}
      />

      {/* Productivity Stat */}
      <AnimatedText
        text="Boost your team's productivity by 30%."
        preset="typewriter"
        animationUnit="character"
        stagger={0.4} // Slightly faster typewriter
        startFrame={20} // Starts after headline
        anchor="center"
        offsetY={-40}
        fontSize={60}
        fontWeight={700}
        color="#34D399" // Slightly lighter green
        exit={{
          startFrame: 85, // Exit at 85 frames, end at 105 (first to exit)
          opacity: { from: 1, to: 0, duration: exitDuration },
        }}
      />

      {/* Animated Checkmark */}
      <AnimatedCheckmark
        startFrame={40} // Starts after first text element
        durationFrames={30}
        exitStartFrame={95} // Exit at 95 frames, end at 115
        exitDurationFrames={exitDuration}
        size={180}
        color="#059669"
      />

      {/* Productivity Bar Chart */}
      <ProductivityBarChart
        startFrame={60} // Starts after checkmark
        durationFrames={30}
        exitStartFrame={100} // Exit at 100 frames, end at 120 (last to exit)
        exitDurationFrames={exitDuration}
      />
    </AbsoluteFill>
  );
};
