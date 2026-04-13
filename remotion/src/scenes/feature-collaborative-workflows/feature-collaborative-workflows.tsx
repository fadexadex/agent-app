import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

// --- Components ---

const FeaturePill: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [-20, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 40,
        left: '50%',
        transform: `translate(-50%, ${translateY}px)`,
        backgroundColor: '#3F51B5',
        color: 'white',
        padding: '12px 32px',
        borderRadius: '50px',
        fontSize: '24px',
        fontWeight: 600,
        fontFamily,
        boxShadow: '0 4px 15px rgba(63, 81, 181, 0.3)',
        opacity,
        zIndex: 10,
      }}
    >
      {text}
    </div>
  );
};

const ChatBubble: React.FC<{
  name: string;
  role: string;
  message: string;
  avatarSide: 'left' | 'right';
  startFrame: number;
  x: string | number;
  y: string | number;
  exitFrame: number;
}> = ({ name, role, message, avatarSide, startFrame, x, y, exitFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 150 },
  });

  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]) - interpolate(exit, [0, 1], [0, 0.2]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]) - interpolate(exit, [0, 1], [0, 1]);
  const moveX = avatarSide === 'left' ? interpolate(entrance, [0, 1], [-30, 0]) : interpolate(entrance, [0, 1], [30, 0]);

  const charCount = Math.floor(interpolate(frame - startFrame - 10, [0, 40], [0, message.length], { extrapolateRight: 'clamp' }));
  const displayText = message.slice(0, Math.max(0, charCount));

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translateX(${moveX}px) scale(${scale})`,
        opacity,
        display: 'flex',
        flexDirection: avatarSide === 'left' ? 'row' : 'row-reverse',
        alignItems: 'flex-start',
        gap: '15px',
        width: '450px',
        fontFamily,
      }}
    >
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: avatarSide === 'left' ? '#3F51B5' : '#4CAF50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        flexShrink: 0,
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        {name[0]}
      </div>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '20px',
        borderTopLeftRadius: avatarSide === 'left' ? '0' : '20px',
        borderTopRightRadius: avatarSide === 'right' ? '0' : '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        flexGrow: 1,
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1A1A1A', marginBottom: '4px' }}>
          {name} <span style={{ fontWeight: 400, fontSize: '14px', color: '#666' }}>({role})</span>
        </div>
        <div style={{ fontSize: '18px', color: '#444', lineHeight: 1.5 }}>
          {displayText}
        </div>
      </div>
    </div>
  );
};

const AnimatedArrow: React.FC<{ startFrame: number; exitFrame: number }> = ({ startFrame, exitFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(progress, [0, 0.2], [0, 1]) - interpolate(exit, [0, 1], [0, 1]);
  const strokeDashoffset = interpolate(progress, [0, 1], [1000, 0]);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        opacity,
        zIndex: 5,
      }}
    >
      <path
        d="M 600 450 Q 960 540 1300 650"
        fill="none"
        stroke="#4CAF50"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="1000"
        strokeDashoffset={strokeDashoffset}
      />
      <polygon
        points="1300,650 1285,635 1295,660 1275,655"
        fill="#4CAF50"
        transform={`rotate(${interpolate(progress, [0.8, 1], [0, 15])} 1300 650)`}
      />
    </svg>
  );
};

const NoiseBackground: React.FC<{ color: string }> = ({ color }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: color, overflow: 'hidden' }}>
      <svg width="100%" height="100%" opacity="0.4" style={{ filter: 'contrast(150%) brightness(100%)' }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </AbsoluteFill>
  );
};

// --- Scene ---

export const CollaborativeWorkflows: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Transitions
  const doorProgress = spring({
    frame,
    fps: 30,
    durationInFrames: 20,
    config: { damping: 200 },
  });

  const leftDoorTranslate = interpolate(doorProgress, [0, 1], [0, -width / 2]);
  const rightDoorTranslate = interpolate(doorProgress, [0, 1], [0, width / 2]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background */}
      <NoiseBackground color="#F0F0F0" />

      {/* Hero Pill */}
      <FeaturePill text="Seamless Team Collaboration" startFrame={25} />

      {/* Chat Bubble 1 - Alice */}
      <ChatBubble
        name="Alice"
        role="Dev"
        message="This error in module X seems critical. Assigning to Bob."
        avatarSide="left"
        startFrame={40}
        x="15%"
        y="300px"
        exitFrame={130}
      />

      {/* Chat Bubble 2 - Bob */}
      <ChatBubble
        name="Bob"
        role="QA"
        message="Got it. Investigating now, will update in 30 mins."
        avatarSide="right"
        startFrame={75}
        x="50%"
        y="600px"
        exitFrame={133}
      />

      {/* Arrow */}
      <AnimatedArrow startFrame={65} exitFrame={136} />

      {/* Door Transition (Opening) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '50%',
        height: '100%',
        backgroundColor: '#09090B',
        transform: `translateX(${leftDoorTranslate}px)`,
        zIndex: 100,
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        backgroundColor: '#09090B',
        transform: `translateX(${rightDoorTranslate}px)`,
        zIndex: 100,
      }} />
    </AbsoluteFill>
  );
};
