import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// --- Sub-components ---

const FeaturePill: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const entrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: `translateX(-50%) scale(${scale})`,
        backgroundColor: '#3F51B5',
        color: 'white',
        padding: '12px 32px',
        borderRadius: '999px',
        fontSize: '24px',
        fontWeight: 600,
        fontFamily,
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        opacity,
        zIndex: 10,
      }}
    >
      Seamless Team Collaboration
    </div>
  );
};

const ChatBubble: React.FC<{
  frame: number;
  delay: number;
  name: string;
  role: string;
  text: string;
  side: 'left' | 'right';
  top: number;
  left?: number;
  right?: number;
}> = ({ frame, delay, name, role, text, side, top, left, right }) => {
  const { fps } = useVideoConfig();
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [20, 0]);
  const scale = interpolate(entrance, [0, 1], [0.9, 1]);

  // Exit animation
  const exitFrame = 130 + (side === 'left' ? 0 : 3);
  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        right,
        opacity: opacity * exitOpacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: 'flex',
        flexDirection: side === 'left' ? 'row' : 'row-reverse',
        alignItems: 'flex-start',
        gap: '12px',
        width: '450px',
        fontFamily,
      }}
    >
      {/* Avatar Placeholder */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: side === 'left' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
          flexShrink: 0,
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      />
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '20px',
          borderTopLeftRadius: side === 'left' ? '0' : '20px',
          borderTopRightRadius: side === 'right' ? '0' : '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a', marginBottom: '4px' }}>
          {name} <span style={{ fontWeight: 400, color: '#666', fontSize: '12px' }}>({role})</span>
        </div>
        <div style={{ fontSize: '18px', lineHeight: '1.5', color: '#333' }}>
          {text}
        </div>
      </div>
    </div>
  );
};

const AnimatedArrow: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const startFrame = 60;
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  // Animated SVG path length logic
  const pathLength = 300;
  const dashOffset = interpolate(progress, [0, 1], [pathLength, 0]);
  const opacity = interpolate(progress, [0, 0.2], [0, 1]);

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 5,
        opacity,
      }}
      viewBox="0 0 1920 1080"
    >
      <path
        d="M 550 450 Q 960 600 1370 700"
        fill="none"
        stroke="#4CAF50"
        strokeWidth="6"
        strokeDasharray={pathLength}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
      <polygon
        points="1370,700 1355,685 1375,685"
        fill="#4CAF50"
        transform={`rotate(25, 1370, 700) translate(0, 0)`}
        style={{
          opacity: progress > 0.9 ? 1 : 0,
        }}
      />
    </svg>
  );
};

const NoiseBackground: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#F0F0F0' }}>
      <svg width="100%" height="100%" style={{ opacity: 0.05 }}>
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </AbsoluteFill>
  );
};

export const CollaborativeWorkflows: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <NoiseBackground />
      
      {/* Elements */}
      <FeaturePill frame={frame} />
      
      <ChatBubble
        frame={frame}
        delay={30}
        name="Alice"
        role="Dev"
        text="This error in module X seems critical. Assigning to Bob."
        side="left"
        top={300}
        left={150}
      />

      <AnimatedArrow frame={frame} />

      <ChatBubble
        frame={frame}
        delay={75}
        name="Bob"
        role="QA"
        text="Got it. Investigating now, will update in 30 mins."
        side="right"
        top={700}
        right={150}
      />
    </AbsoluteFill>
  );
};
