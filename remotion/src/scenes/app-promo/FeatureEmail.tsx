import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import React from "react";
import { Mail, Paperclip } from "lucide-react";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

const VoiceIndicatorPill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro animation (start 0, duration 20, snappy)
  const introProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 200 }
  });

  const scale = interpolate(introProgress, [0, 1], [0.5, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const yOffset = interpolate(introProgress, [0, 1], [-100, -120], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Exit animation (frame 106, duration 15)
  const exitProgress = interpolate(frame, [106, 121], [0, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: "clamp" });
  const blur = interpolate(exitProgress, [0, 1], [0, 10], { extrapolateRight: "clamp" });

  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(-50%, calc(-50% + ${yOffset}px)) scale(${scale})`,
      width: 200,
      height: 60,
      backgroundColor: '#1A1A1A',
      borderRadius: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      opacity,
      filter: `blur(${blur}px)`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      zIndex: 10
    }}>
      <Mail color="#FFFFFF" size={24} />
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const barHeight = interpolate(
            Math.sin(frame * 0.3 + i * 0.8),
            [-1, 1],
            [10, 30]
          );
          return (
            <div key={i} style={{
              width: 4,
              height: barHeight,
              backgroundColor: '#FFFFFF',
              borderRadius: 2
            }} />
          );
        })}
      </div>
    </div>
  );
};

const EmailWindow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro (start 20, duration 30, smooth)
  const introProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 200 }
  });

  const y = interpolate(introProgress, [0, 1], [150, 20], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const rotateX = interpolate(introProgress, [0, 1], [10, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const opacityIn = interpolate(introProgress, [0, 0.5], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Exit (frame 100, duration 15)
  const exitProgress = interpolate(frame, [100, 115], [0, 1], { extrapolateRight: "clamp" });
  const opacityOut = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: "clamp" });
  const blur = interpolate(exitProgress, [0, 1], [0, 10], { extrapolateRight: "clamp" });

  const finalOpacity = opacityIn * opacityOut;

  // Typewriter
  const text = "Hi Emily,\n\nQuick check, would it be easier to move our call to later? Happy to work around what's best for you.\n\nBest,\nJonah";
  const typewriterStart = 40;
  const speed = 2.5;
  const charCount = Math.max(0, Math.floor((frame - typewriterStart) * speed));
  const displayText = text.slice(0, charCount);

  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(-50%, calc(-50% + ${y}px)) rotateX(${rotateX}deg)`,
      transformOrigin: 'bottom center',
      width: 480,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
      opacity: finalOpacity,
      filter: `blur(${blur}px)`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily,
      zIndex: 5
    }}>
      {/* Header */}
      <div style={{ backgroundColor: '#F3F4F6', padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
        New message
      </div>
      {/* To */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: 8, fontSize: 14 }}>
        <span style={{ color: '#6B7280' }}>To</span>
        <span style={{ color: '#111827', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: 12 }}>Emily@voiceos.com</span>
      </div>
      {/* Subject */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', fontSize: 14, fontWeight: 500, color: '#111827' }}>
        Follow-Up on Project Update
      </div>
      {/* Body */}
      <div style={{ padding: '16px', fontSize: 14, color: '#374151', minHeight: 140, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
        {displayText}
        {frame >= typewriterStart && charCount < text.length && (
          <span style={{ display: 'inline-block', width: 2, height: 14, backgroundColor: '#000', verticalAlign: 'middle', marginLeft: 2 }} />
        )}
      </div>
      {/* Footer */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', fontSize: 13 }}>
          <Paperclip size={16} /> Attach a file
        </div>
        <div style={{ backgroundColor: '#2563EB', color: 'white', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
          Send email
        </div>
      </div>
    </div>
  );
};

const FeaturePill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro (start 60, duration 20, smooth)
  const introProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 }
  });

  const y = interpolate(introProgress, [0, 1], [220, 200], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const introOpacity = interpolate(introProgress, [0, 1], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const introBlur = interpolate(introProgress, [0, 1], [8, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Exit (frame 103, duration 15)
  const exitProgress = interpolate(frame, [103, 118], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: "clamp" });
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 10], { extrapolateRight: "clamp" });

  const finalOpacity = introOpacity * exitOpacity;
  const finalBlur = introBlur + exitBlur;

  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(-50%, calc(-50% + ${y}px))`,
      backgroundColor: '#1A1A1A',
      color: '#FFFFFF',
      padding: '12px 24px',
      borderRadius: 24,
      fontSize: 16,
      fontWeight: 500,
      opacity: finalOpacity,
      filter: `blur(${finalBlur}px)`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      fontFamily,
      zIndex: 10
    }}>
      Instantly replies for you
    </div>
  );
};

export const FeatureEmail: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF', perspective: '1000px' }}>
      <VoiceIndicatorPill />
      <EmailWindow />
      <FeaturePill />
    </AbsoluteFill>
  );
};
