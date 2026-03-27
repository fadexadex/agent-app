import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const AnimatedBars = ({ frame }: { frame: number }) => (
  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: 24 }}>
    {[0, 1, 2, 3, 4].map((i) => {
      const barHeight = interpolate(
        Math.sin(frame * 0.3 + i * 0.8),
        [-1, 1],
        [8, 24]
      );
      return (
        <div 
          key={i} 
          style={{ 
            width: '4px', 
            height: barHeight, 
            backgroundColor: '#FFFFFF', 
            borderRadius: '2px' 
          }} 
        />
      );
    })}
  </div>
);

export const FeatureEmail = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Voice Indicator (Start: 0, Exit: 106)
  const voiceProgress = spring({ 
    frame: frame, 
    fps, 
    config: { damping: 20, stiffness: 200 } 
  });
  const voiceScale = interpolate(voiceProgress, [0, 1], [0.5, 1]);
  const voiceYOffset = interpolate(voiceProgress, [0, 1], [-100, -120]);
  const voiceExitOpacity = interpolate(frame, [106, 121], [1, 0], { extrapolateRight: 'clamp' });
  const voiceExitBlur = interpolate(frame, [106, 121], [0, 20], { extrapolateRight: 'clamp' });

  // Email Window (Start: 20, Exit: 100)
  const windowProgress = spring({ 
    frame: frame - 20, 
    fps, 
    config: { damping: 200 } 
  });
  const windowY = interpolate(windowProgress, [0, 1], [100, 20]);
  const windowOpacity = interpolate(windowProgress, [0, 1], [0, 1]);
  const windowRotateX = interpolate(windowProgress, [0, 1], [10, 0]);
  const windowExitOpacity = interpolate(frame, [100, 115], [1, 0], { extrapolateRight: 'clamp' });
  const windowExitBlur = interpolate(frame, [100, 115], [0, 20], { extrapolateRight: 'clamp' });

  // Feature Label (Start: 60, Exit: 103)
  const pillProgress = spring({ 
    frame: frame - 60, 
    fps, 
    config: { damping: 200 } 
  });
  const pillOpacity = interpolate(pillProgress, [0, 1], [0, 1]);
  const pillBlur = interpolate(pillProgress, [0, 1], [8, 0]);
  const pillExitOpacity = interpolate(frame, [103, 118], [1, 0], { extrapolateRight: 'clamp' });
  const pillExitBlur = interpolate(frame, [103, 118], [0, 20], { extrapolateRight: 'clamp' });

  // Typewriter effect
  const text = "Hi Emily,\n\nQuick check, would it be easier to move our call to later? Happy to work around what's best for you.\n\nBest,\nJonah";
  const charCount = Math.floor(
    interpolate(frame, [40, 40 + text.length / 2], [0, text.length], { 
      extrapolateRight: 'clamp', 
      extrapolateLeft: 'clamp' 
    })
  );
  const displayText = text.slice(0, charCount);

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF', fontFamily }}>
      
      {/* Voice Indicator */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 200,
        height: 60,
        backgroundColor: '#1A1A1A',
        borderRadius: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        transform: `translate(-50%, calc(-50% + ${voiceYOffset}px)) scale(${voiceScale})`,
        opacity: voiceExitOpacity,
        filter: `blur(${voiceExitBlur}px)`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        zIndex: 10
      }}>
        <EmailIcon />
        <AnimatedBars frame={frame} />
      </div>

      {/* Email Window */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 500,
        transform: `translate(-50%, calc(-50% + ${windowY}px)) perspective(1000px) rotateX(${windowRotateX}deg)`,
        opacity: windowOpacity * windowExitOpacity,
        filter: `blur(${windowExitBlur}px)`,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        boxShadow: '0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 5
      }}>
        <div style={{ backgroundColor: '#F9FAFB', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>New message</div>
          <div style={{ display: 'flex', gap: 12, color: '#9CA3AF' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </div>
        </div>

        <div style={{ padding: '10px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', fontSize: 14 }}>
          <span style={{ color: '#6B7280', width: 60 }}>To</span>
          <span style={{ color: '#111827', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>Emily@voiceos.com</span>
        </div>
        
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', fontSize: 14 }}>
          <span style={{ color: '#6B7280', width: 60 }}>Subject</span>
          <span style={{ color: '#111827', fontWeight: 500 }}>Follow-Up on Project Update</span>
        </div>

        <div style={{ padding: '20px 16px', minHeight: 160, fontSize: 15, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {displayText}
          <span style={{ opacity: frame % 30 < 15 ? 1 : 0, color: '#2563EB', marginLeft: 2 }}>|</span>
        </div>

        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ backgroundColor: '#2563EB', color: 'white', padding: '8px 20px', borderRadius: 20, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 4px rgba(37,99,235,0.3)' }}>
              Send 
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: 14, gap: 6, fontWeight: 500 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg> 
              <span style={{ display: 'inline-block', paddingTop: 2 }}>Attach a file</span>
            </div>
          </div>
          <div style={{ color: '#9CA3AF' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Feature Label */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, calc(-50% + 200px))`,
        opacity: pillOpacity * pillExitOpacity,
        filter: `blur(${pillBlur}px) blur(${pillExitBlur}px)`,
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: '12px 24px',
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        Instantly replies for you
      </div>

    </AbsoluteFill>
  );
};
