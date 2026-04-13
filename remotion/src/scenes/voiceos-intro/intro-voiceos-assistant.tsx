import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';

const { fontFamily } = loadFont();

// --- Components ---

const VoiceOSLogo: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        width: 150,
        height: 150,
        borderRadius: 40,
        background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)',
        transform: `scale(${progress})`,
        opacity: progress,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          border: '8px solid white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 8,
            height: 40,
            backgroundColor: 'white',
            borderRadius: 4,
            transform: 'rotate(-20deg)',
          }}
        />
      </div>
    </div>
  );
};

const IconGrid: React.FC<{ progress: number }> = ({ progress }) => {
  const icons = ['📧', '📅', '📝'];
  return (
    <div
      style={{
        display: 'flex',
        gap: 40,
        marginTop: 40,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
      }}
    >
      {icons.map((icon, i) => (
        <div
          key={i}
          style={{
            fontSize: 32,
            filter: 'grayscale(100%) opacity(0.6)',
            transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
};

// --- Main Scene ---

export const IntroVoiceOSAssistant: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();

  // Exit Animation (starting at frame 115 for 20 frame duration)
  const exitStart = 115;
  const exitDuration = 20;
  const exitProgress = spring({
    frame: frame - exitStart,
    fps,
    config: { damping: 200 },
    durationInFrames: exitDuration,
  });

  const globalOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const globalScale = interpolate(exitProgress, [0, 1], [1, 0.95]);

  // Entrance Timings
  const logoProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const titleProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
  });

  const descProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 },
  });

  const iconsProgress = spring({
    frame: frame - 85,
    fps,
    config: { damping: 20 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F5F5F5',
        fontFamily,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: globalOpacity,
        transform: `scale(${globalScale})`,
      }}
    >
      {/* Logo */}
      <div style={{ transform: 'translateY(-50px)' }}>
        <VoiceOSLogo progress={logoProgress} />
      </div>

      {/* Title */}
      <div
        style={{
          marginTop: 40,
          fontSize: 80,
          fontWeight: 800,
          color: '#1F2937',
          opacity: titleProgress,
          transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
          textAlign: 'center',
        }}
      >
        VoiceOS
      </div>

      {/* Description */}
      <div
        style={{
          marginTop: 10,
          fontSize: 28,
          color: '#6B7280',
          opacity: descProgress,
          transform: `translateY(${interpolate(descProgress, [0, 1], [10, 0])}px)`,
          textAlign: 'center',
          maxWidth: 600,
          lineHeight: 1.5,
        }}
      >
        Your personal AI assistant, powered by voice.
      </div>

      {/* Feature Icons */}
      <IconGrid progress={iconsProgress} />
    </AbsoluteFill>
  );
};
