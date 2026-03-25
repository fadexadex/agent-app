
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface FlowPilotLogoSmallProps {
  startFrame?: number;
}

export const FlowPilotLogoSmall: React.FC<FlowPilotLogoSmallProps> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const opacity = interpolate(fadeIn, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: 40,
        opacity: opacity,
        color: 'white',
        fontSize: 24,
        fontWeight: 600,
        // In a real scenario, this would be an SVG or image
      }}
    >
      FlowPilot
    </div>
  );
};
