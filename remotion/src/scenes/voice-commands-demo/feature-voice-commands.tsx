import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// --- Subcomponents ---

const VoiceIndicatorPill = ({ frame, fps }: { frame: number; fps: number }) => {
  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const exit = spring({
    frame: frame - 120,
    fps,
    config: { damping: 200 },
  });

  const translateY = interpolate(entrance - exit, [0, 1], [-100, 20]);
  const opacity = entrance - exit;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        width: 220,
        height: 60,
        backgroundColor: '#1A1A1A',
        borderRadius: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        opacity,
      }}
    >
      <div style={{ color: 'white', fontSize: 24 }}>🎙️</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 30 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const barHeight = interpolate(
            Math.sin(frame * 0.4 + i * 0.8),
            [-1, 1],
            [8, 30]
          );
          return (
            <div
              key={i}
              style={{
                width: 4,
                height: barHeight,
                backgroundColor: 'white',
                borderRadius: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const TrelloMockup = ({ frame, fps }: { frame: number; fps: number }) => {
  const entrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const exit = spring({
    frame: frame - 123,
    fps,
    config: { damping: 200 },
  });

  const scale = interpolate(entrance - exit, [0, 1], [0.8, 1]);
  const opacity = entrance - exit;

  const columnStyle: React.CSSProperties = {
    backgroundColor: '#ebecf0',
    borderRadius: 8,
    width: '30%',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 4,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    fontSize: 14,
    color: '#172b4d',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '40%',
        left: '10%',
        right: '10%',
        bottom: '20%',
        backgroundColor: '#f4f5f7',
        borderRadius: 12,
        boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
        border: '1px solid #dfe1e6',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Browser Top Bar */}
      <div style={{ height: 40, backgroundColor: '#fff', borderBottom: '1px solid #dfe1e6', display: 'flex', alignItems: 'center', padding: '0 15px', gap: 6 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27c93f' }} />
      </div>

      {/* Trello Board Content */}
      <div style={{ flex: 1, padding: 20, display: 'flex', gap: 15, fontFamily }}>
        <div style={columnStyle}>
          <div style={{ fontWeight: 'bold', fontSize: 13, color: '#5e6c84' }}>TO DO</div>
          <div style={cardStyle}>Review Q3 report</div>
          <div style={{ ...cardStyle, height: 40, opacity: 0.5, border: '1px dashed #ccc', backgroundColor: 'transparent' }} />
        </div>
        <div style={columnStyle}>
          <div style={{ fontWeight: 'bold', fontSize: 13, color: '#5e6c84' }}>IN PROGRESS</div>
          <div style={{ ...cardStyle, height: 60, opacity: 0.3 }} />
        </div>
        <div style={columnStyle}>
          <div style={{ fontWeight: 'bold', fontSize: 13, color: '#5e6c84' }}>DONE</div>
          <div style={{ ...cardStyle, height: 40, opacity: 0.3 }} />
        </div>
      </div>
    </div>
  );
};

const CommandText = ({ frame, fps }: { frame: number; fps: number }) => {
  const entrance = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
  });

  const exit = spring({
    frame: frame - 126,
    fps,
    config: { damping: 200 },
  });

  const translateY = interpolate(entrance - exit, [0, 1], [50, 0]);
  const opacity = entrance - exit;

  const fullText = "Open Trello, create task 'Review Q3 report', assign to Sarah.";
  // Typewriter effect speed: 2 characters per frame starting at frame 30
  const charCount = Math.floor(interpolate(frame, [30, 30 + (fullText.length / 2)], [0, fullText.length], { extrapolateRight: 'clamp' }));
  const displayText = fullText.slice(0, charCount);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        backgroundColor: 'white',
        padding: '20px 40px',
        borderRadius: 40,
        boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
        maxWidth: '80%',
        textAlign: 'center',
        opacity,
        fontFamily,
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 500, color: '#1A1A1A', lineHeight: 1.4 }}>
        {displayText}
        <span style={{ opacity: Math.floor(frame / 10) % 2 === 0 ? 1 : 0, marginLeft: 2 }}>|</span>
      </div>
    </div>
  );
};

// --- Main Scene ---

export const VoiceCommandsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Blur transition handling (0-15 and 120-135)
  const blurAmount = interpolate(
    frame,
    [0, 15, 120, 135],
    [20, 0, 0, 20],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#e0f2f7', 
      filter: `blur(${blurAmount}px)`,
      fontFamily 
    }}>
      <TrelloMockup frame={frame} fps={fps} />
      <VoiceIndicatorPill frame={frame} fps={fps} />
      <CommandText frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

export default VoiceCommandsScene;
