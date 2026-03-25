
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

interface CallToActionButtonProps {
  text: string;
  startFrame?: number;
}

export const CallToActionButton: React.FC<CallToActionButtonProps> = ({ text, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const entranceProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const scaleEntrance = interpolate(entranceProgress, [0, 1], [0, 1]);
  const opacityEntrance = interpolate(entranceProgress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });

  // Pulsation animation (starts after entrance, e.g., 20 frames after startFrame)
  const pulsationStartFrame = startFrame + 20;
  const pulseScale = interpolate(
    frame,
    [pulsationStartFrame, pulsationStartFrame + 15, pulsationStartFrame + 30, pulsationStartFrame + 45, pulsationStartFrame + 60],
    [1, 1.05, 1, 1.02, 1],
    { extrapolateRight: 'clamp' }
  );

  const combinedScale = scaleEntrance * pulseScale;

  return (
    <div
      style={{
        position: 'absolute',
        transform: `scale(${combinedScale})`,
        opacity: opacityEntrance,
        backgroundColor: '#10B981', // Emerald green
        color: 'white',
        fontSize: 32,
        fontWeight: 700,
        padding: '20px 40px',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${combinedScale})`,
        boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.3)',
      }}
    >
      {text}
    </div>
  );
};
