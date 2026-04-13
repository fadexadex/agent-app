import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

// --- Components ---

const AbstractComplexityVisualization: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Create a set of "nodes" and "lines"
  const nodes = Array.from({ length: 20 }).map((_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const initialX = Math.cos(angle) * 300 + width / 2;
    const initialY = Math.sin(angle) * 300 + height / 2;
    return { id: i, x: initialX, y: initialY };
  });

  return (
    <AbsoluteFill style={{ opacity: 0.15 }}>
      <svg width={width} height={height}>
        {nodes.map((node, i) => {
          // Subtle floating motion
          const offsetX = Math.sin(frame / 30 + i) * 20;
          const offsetY = Math.cos(frame / 25 + i) * 20;
          
          return (
            <React.Fragment key={node.id}>
              {/* Draw lines to next few nodes */}
              {[1, 2, 3].map((step) => {
                const target = nodes[(i + step) % nodes.length];
                const targetX = target.x + Math.sin(frame / 30 + (i + step)) * 20;
                const targetY = target.y + Math.cos(frame / 25 + (i + step)) * 20;
                
                return (
                  <line
                    key={`${i}-${step}`}
                    x1={node.x + offsetX}
                    y1={node.y + offsetY}
                    x2={targetX}
                    y2={targetY}
                    stroke="#4A5568"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                );
              })}
              <circle
                cx={node.x + offsetX}
                cy={node.y + offsetY}
                r="4"
                fill="#3182CE"
              />
            </React.Fragment>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const AnimatedText: React.FC<{
  text: string;
  yOffset: number;
  startFrame: number;
  exitFrame: number;
}> = ({ text, yOffset, startFrame, exitFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance: Word-by-word reveal + Slide Up
  const words = text.split(' ');
  
  // Exit: Fade + Blur
  const exitOpacity = interpolate(
    frame,
    [exitFrame, exitFrame + 15],
    [1, 0],
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, calc(-50% + ${yOffset}px))`,
        textAlign: 'center',
        width: '100%',
        fontFamily,
        fontSize: '80px',
        fontWeight: 800,
        color: '#2D3748',
        opacity: exitOpacity,
        filter: `blur(${interpolate(frame, [exitFrame, exitFrame + 15], [0, 10], { extrapolateRight: 'clamp' })}px)`,
      }}
    >
      {words.map((word, i) => {
        const wordStart = startFrame + i * 5;
        const wordSpring = spring({
          frame: frame - wordStart,
          fps,
          config: { damping: 200 },
        });

        const opacity = interpolate(wordSpring, [0, 1], [0, 1]);
        const translateY = interpolate(wordSpring, [0, 1], [20, 0]);

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '20px',
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const HookComplexityChallenge: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Background Gradient Logic
  const bgOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  
  // Global Scene Fade Out
  const sceneFade = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#F0F4F8',
      background: 'radial-gradient(circle, #F0F4F8 0%, #E0E8F0 100%)',
      opacity: sceneFade
    }}>
      {/* Abstract Visualization */}
      <div style={{ opacity: bgOpacity }}>
        <AbstractComplexityVisualization />
      </div>

      {/* Main Text Elements */}
      <AnimatedText 
        text="Drowning in data?" 
        yOffset={-80} 
        startFrame={10} 
        exitFrame={90} // Staggered exit
      />
      
      <AnimatedText 
        text="Struggling with insights?" 
        yOffset={40} 
        startFrame={40} 
        exitFrame={93} // Staggered exit (3 frames later)
      />
    </AbsoluteFill>
  );
};
