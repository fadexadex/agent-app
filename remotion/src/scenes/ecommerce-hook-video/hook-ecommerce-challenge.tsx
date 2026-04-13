import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

const DownwardTrendIcon: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame * 0.2) * 2;
  
  // Drawing a simple SVG path for the downward trend
  return (
    <div style={{ 
      width: 120, 
      height: 100, 
      opacity: progress,
      transform: `scale(${progress}) translateY(${wobble}px)`,
      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
    }}>
      <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M10 10 L40 30 L60 20 L90 70" 
          stroke="#EF4444" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M70 70 H90 V50" 
          stroke="#EF4444" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </div>
  );
};

const AnimatedQuestionMark: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div style={{ 
      fontSize: 160, 
      fontWeight: 'bold', 
      color: '#0EA5E9',
      opacity: interpolate(progress, [0, 1], [0.3, 1]),
      transform: `scale(${progress}) rotate(${interpolate(progress, [0, 1], [-20, 0])}deg)`,
      fontFamily
    }}>
      ?
    </div>
  );
};

export const EcommerceChallengeHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 1. Setup global entrance timing
  const startFrame = 15;
  const text = "Is your Shopify store just... stuck?";
  
  // Typewriter calculation
  const charsShown = Math.floor(interpolate(frame - startFrame, [0, 40], [0, text.length], {
    extrapolateRight: 'clamp'
  }));
  const displayText = text.slice(0, charsShown);

  // 2. Element animations
  const springConfig = { damping: 15, stiffness: 100 };
  const questionMarkEntrance = spring({
    frame: frame - 25,
    fps,
    config: { damping: 8 } // Bouncy for the question mark
  });

  const graphEntrance = spring({
    frame: frame - 45,
    fps,
    config: springConfig
  });

  // 3. Exit Animations (Starting from frame 85, staggered by 3 frames)
  const exitStart = 85;
  const exitDuration = 15;

  const textExit = interpolate(frame, [exitStart, exitStart + exitDuration], [1, 0], { extrapolateRight: 'clamp' });
  const questionExit = interpolate(frame, [exitStart + 3, exitStart + 3 + exitDuration], [1, 0], { extrapolateRight: 'clamp' });
  const graphExit = interpolate(frame, [exitStart + 6, exitStart + 6 + exitDuration], [1, 0], { extrapolateRight: 'clamp' });

  // 4. Scene Fade Transition (Last 20 frames)
  const sceneOpacity = interpolate(frame, [105 - 20, 105], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#E0F2F7', opacity: sceneOpacity }}>
      {/* Question Mark Background Element */}
      <div style={{ 
        position: 'absolute', 
        right: '15%', 
        top: '20%',
        opacity: questionExit 
      }}>
        {frame > 25 && <AnimatedQuestionMark progress={questionMarkEntrance} />}
      </div>

      {/* Main Content Container */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        padding: '0 100px',
        textAlign: 'center',
        fontFamily
      }}>
        <h1 style={{ 
          fontSize: 80, 
          fontWeight: 800, 
          color: '#1E293B',
          lineHeight: 1.2,
          margin: 0,
          opacity: textExit
        }}>
          {displayText}
          {charsShown < text.length && <span style={{ opacity: frame % 10 < 5 ? 1 : 0 }}>|</span>}
        </h1>

        <div style={{ 
          marginTop: 60,
          opacity: graphExit
        }}>
          {frame > 45 && <DownwardTrendIcon progress={graphEntrance} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};