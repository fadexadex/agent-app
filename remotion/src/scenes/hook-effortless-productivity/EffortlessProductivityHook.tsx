import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Mail, Calendar, MessageSquare, FileText } from 'lucide-react';

const { fontFamily } = loadFont();

const IconGrid = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Create a grid of icons
  const icons = [Mail, Calendar, MessageSquare, FileText];
  const rows = 6;
  const cols = 8;
  const spacingX = width / (cols - 1);
  const spacingY = height / (rows - 1);

  return (
    <AbsoluteFill style={{ opacity: 0.15 }}>
      {Array.from({ length: rows }).map((_, rowIndex) =>
        Array.from({ length: cols }).map((_, colIndex) => {
          const Icon = icons[(rowIndex + colIndex) % icons.length];
          const uniqueId = rowIndex * cols + colIndex;
          
          // Initial entrance
          const entrance = spring({
            frame: frame - (uniqueId % 20),
            fps,
            config: { damping: 100 },
          });

          // Continuous floating motion
          const floatX = Math.sin(frame / 30 + uniqueId) * 10;
          const floatY = Math.cos(frame / 40 + uniqueId) * 10;

          return (
            <div
              key={uniqueId}
              style={{
                position: 'absolute',
                left: colIndex * spacingX,
                top: rowIndex * spacingY,
                transform: `translate(${floatX}px, ${floatY}px) scale(${entrance})`,
                color: 'white',
              }}
            >
              <Icon size={40} strokeWidth={1} />
            </div>
          );
        })
      )}
    </AbsoluteFill>
  );
};

export const EffortlessProductivityHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Background Gradient
  const bgOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Main Title Animation
  const titleText = "Effortless Productivity, Always.";
  const titleStart = 10;
  const charsShown = Math.floor(
    interpolate(frame, [titleStart, titleStart + 40], [0, titleText.length], {
      extrapolateRight: 'clamp',
    })
  );

  const titleSpring = spring({
    frame: frame - titleStart,
    fps,
    config: { damping: 200 },
  });

  // Exit Animation (starting at frame 90 for a 15-frame fade out)
  const exitFrame = durationInFrames - 15;
  const exitOpacity = interpolate(frame, [exitFrame, durationInFrames], [1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
        opacity: exitOpacity,
        fontFamily,
        overflow: 'hidden',
      }}
    >
      <IconGrid />
      
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 100px',
        }}
      >
        <h1
          style={{
            color: 'white',
            fontSize: '84px',
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.1,
            textShadow: '0 10px 30px rgba(0,0,0,0.2)',
            transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
            opacity: interpolate(titleSpring, [0, 0.5], [0, 1]),
          }}
        >
          {titleText.slice(0, charsShown)}
          <span
            style={{
              opacity: frame % 20 < 10 ? 1 : 0,
              marginLeft: '4px',
              borderRight: '4px solid white',
            }}
          />
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
