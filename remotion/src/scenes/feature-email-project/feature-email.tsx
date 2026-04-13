import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

const VoiceIndicatorPill: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);

  // Exit animation (starts late)
  const exitFrame = 110;
  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div style={{
      opacity: opacity * exitOpacity,
      transform: `scale(${scale})`,
      backgroundColor: '#1A1A1A',
      width: 200,
      height: 60,
      borderRadius: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      position: 'absolute',
      top: 100,
      left: 100,
    }}>
      <div style={{ color: 'white', fontSize: 24 }}>✉️</div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const barHeight = interpolate(
            Math.sin(frame * 0.2 + i * 0.5),
            [-1, 1],
            [8, 24]
          );
          return (
            <div
              key={i}
              style={{
                width: 3,
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

const EmailWindow: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - 20,
    fps,
    config: { damping: 15, stiffness: 80, mass: 2 },
  });

  const translateY = interpolate(entrance, [0, 1], [100, 0]);
  const opacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: 'clamp' });

  const bodyText = "Hi Emily,\n\nQuick check, would it be easier to move our call to later? Happy to work around what's best for you.\n\nBest,\nJonah";
  const typeStart = 40;
  const charCount = Math.floor(interpolate(frame, [typeStart, typeStart + 60], [0, bodyText.length], { extrapolateRight: 'clamp' }));
  const displayText = bodyText.slice(0, charCount);

  // Exit animation (earliest exit)
  const exitFrame = 104;
  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);
  const exitTranslate = interpolate(exit, [0, 1], [0, -20]);

  return (
    <div style={{
      opacity: opacity * exitOpacity,
      transform: `translateY(${translateY + exitTranslate}px) perspective(1000px) rotateX(2deg)`,
      width: 600,
      height: 400,
      backgroundColor: 'white',
      borderRadius: 12,
      boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
      position: 'absolute',
      left: '50%',
      top: '50%',
      marginLeft: -300,
      marginTop: -150,
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
      fontFamily,
    }}>
      <div style={{ backgroundColor: '#F3F4F6', padding: '12px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>New message</span>
        <span style={{ color: '#6B7280' }}>✕</span>
      </div>
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #E5E7EB', fontSize: 14 }}>
        <span style={{ color: '#6B7280' }}>To:</span> <span style={{ marginLeft: 8 }}>Emily@voiceos.com</span>
      </div>
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #E5E7EB', fontSize: 14 }}>
        <span style={{ color: '#6B7280' }}>Subject:</span> <span style={{ marginLeft: 8 }}>Follow-Up on Project Update</span>
      </div>
      <div style={{ padding: '20px', fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-wrap', color: '#374151', height: 180 }}>
        {displayText}
        {frame % 20 < 10 && <span style={{ borderLeft: '2px solid #2563EB', marginLeft: 2 }} />}
      </div>
      <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 20, borderTop: '1px solid #E5E7EB' }}>
        <div style={{ backgroundColor: '#0B57D0', color: 'white', padding: '10px 24px', borderRadius: 20, fontSize: 14, fontWeight: 500 }}>Send email</div>
        <span style={{ color: '#0B57D0', fontSize: 13, cursor: 'pointer' }}>Attach a file</span>
      </div>
    </div>
  );
};

const FeaturePill: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - 30,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(entrance, [0, 1], [20, 0]);

  // Exit animation (staggered)
  const exitFrame = 107;
  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exit, [0, 1], [1, 0]);

  return (
    <div style={{
      opacity: opacity * exitOpacity,
      transform: `translateY(${translateY}px)`,
      backgroundColor: '#1A1A1A',
      color: 'white',
      padding: '12px 30px',
      borderRadius: 24,
      fontSize: 18,
      fontWeight: 500,
      position: 'absolute',
      bottom: 80,
      left: '50%',
      transform: `translateX(-50%) translateY(${translateY}px)`,
      fontFamily,
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    }}>
      Instantly replies for you
    </div>
  );
};

export const EmailReplyFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Scene Blur Transition
  const blur = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: 'clamp' });
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#FFFFFF',
      filter: `blur(${blur}px)`,
      opacity: sceneOpacity,
    }}>
      <VoiceIndicatorPill frame={frame} />
      <EmailWindow frame={frame} />
      <FeaturePill frame={frame} />
    </AbsoluteFill>
  );
};

export default EmailReplyFeature;
