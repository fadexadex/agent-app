import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

// --- Components ---

const AnimatedArrow = ({ frame, fps }: { frame: number; fps: number }) => {
  const entrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.5, 1]);

  // Subtle floating/growing animation
  const float = Math.sin(frame / 10) * 5;

  const exit = spring({
    frame: frame - 100,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div
      style={{
        opacity: opacity * exitOpacity,
        transform: `translateY(${translateY + float}px) scale(${scale})`,
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 20,
      }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#goldGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </div>
  );
};

const MoneyBag = ({ frame, fps }: { frame: number; fps: number }) => {
  const entrance = spring({
    frame: frame - 40,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scaleEntrance = interpolate(entrance, [0, 1], [0.8, 1]);
  
  // Pulsing animation
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.95, 1.05]);

  const exit = spring({
    frame: frame - 103, // 3 frame stagger from arrow
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div
      style={{
        opacity: opacity * exitOpacity,
        transform: `scale(${scaleEntrance * pulse})`,
        display: 'flex',
        justifyContent: 'center',
        marginTop: 40,
        filter: 'drop-shadow(0 0 15px rgba(76, 175, 80, 0.4))',
      }}
    >
      <svg
        width="60"
        height="60"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4CAF50"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h12l4 6-10 12L2 9z" />
        <path d="M12 3v18" />
        <path d="M12 9H8a2 2 0 1 0 0 4h8a2 2 0 1 1 0 4h-4" />
      </svg>
    </div>
  );
};

export const BenefitRevenueGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Scene Entrance Fade
  const sceneFade = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Headline Animation
  const text = "Stop Guessing. Start Growing.";
  const words = text.split(" ");
  
  const exit = spring({
    frame: frame - 106, // 3 frame stagger from money bag
    fps,
    config: { damping: 200 },
  });
  const textExitOpacity = interpolate(exit, [0, 1], [1, 0]);
  const textExitBlur = interpolate(exit, [0, 1], [0, 10]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1A1A1A',
        opacity: sceneFade,
        fontFamily,
        color: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center', width: '80%' }}>
        <AnimatedArrow frame={frame} fps={fps} />
        
        <div style={{ 
          fontSize: 72, 
          fontWeight: 800, 
          lineHeight: 1.1,
          opacity: textExitOpacity,
          filter: `blur(${textExitBlur}px)`
        }}>
          {words.map((word, i) => {
            const wordStart = 20 + i * 5;
            const wordSpring = spring({
              frame: frame - wordStart,
              fps,
              config: { damping: 200 },
            });
            
            const wordOpacity = interpolate(wordSpring, [0, 1], [0, 1]);
            const wordY = interpolate(wordSpring, [0, 1], [20, 0]);

            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  marginRight: '0.25em',
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        <MoneyBag frame={frame} fps={fps} />
      </div>
    </AbsoluteFill>
  );
};
