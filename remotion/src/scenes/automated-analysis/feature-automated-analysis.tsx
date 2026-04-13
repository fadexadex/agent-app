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

// --- Components ---

const FeaturePill: React.FC<{ text: string; frame: number }> = ({ text, frame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [-20, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 50,
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        backgroundColor: '#6DD5ED',
        padding: '12px 30px',
        borderRadius: '50px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 350,
        border: '1px solid rgba(255,255,255,0.3)',
      }}
    >
      <span
        style={{
          color: 'white',
          fontFamily,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: '0.5px',
        }}
      >
        {text}
      </span>
    </div>
  );
};

const DataStreamMockup: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - 25,
    fps,
    config: { damping: 20 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [-50, 0]);

  const jsonLines = [
    '{ "status": "analyzing", "packets": 1024, "latency": "12ms" }',
    '{ "error_rate": 0.02, "cpu_usage": "45%", "mem": "1.2GB" }',
    '{ "event": "api_call", "endpoint": "/v1/auth", "code": 200 }',
    '{ "warning": "high_load", "source": "db-cluster-01" }',
    '{ "thread": 0x45A1, "action": "gc_start", "duration": "5ms" }',
    '{ "audit": "login_attempt", "user_id": "882", "ip": "10.0.0.1" }',
  ];

  const scrollY = (frame * 2) % (jsonLines.length * 30);

  const progress = interpolate(frame, [30, 100], [0, 100], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: '10%',
        top: '25%',
        width: 450,
        height: 400,
        backgroundColor: '#09090B',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        opacity,
        transform: `perspective(1000px) rotateY(10deg) translateX(${translateX}px)`,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ color: '#4ADE80', fontFamily: 'monospace', fontSize: 14, marginBottom: 20 }}>
        [LIVE DATA STREAM]
      </div>
      <div style={{ transform: `translateY(-${scrollY}px)` }}>
        {[...jsonLines, ...jsonLines, ...jsonLines].map((line, i) => (
          <div key={i} style={{ color: '#94A3B8', fontFamily: 'monospace', height: 30, whiteSpace: 'nowrap' }}>
            {line}
          </div>
        ))}
      </div>
      
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        height: 80, 
        backgroundColor: 'rgba(9, 9, 11, 0.95)',
        padding: '15px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ color: 'white', fontFamily, fontSize: 16, marginBottom: 8 }}>
          {progress < 100 ? 'Analyzing Logs...' : 'Processing Complete'}
        </div>
        <div style={{ height: 6, width: '100%', backgroundColor: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#38BDF8', transition: 'width 0.1s linear' }} />
        </div>
      </div>
    </div>
  );
};

const InsightCardMockup: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - 70,
    fps,
    config: { damping: 15, stiffness: 80, mass: 1.5 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [50, 0]);

  const text = "Key Insight\n• Critical error rate increased by 5% in module X\n• Performance bottleneck identified in API Y\n• 3 new vulnerabilities detected";
  
  const lines = text.split('\n');
  const totalChars = text.length;
  
  const revealProgress = interpolate(frame, [80, 140], [0, totalChars], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        right: '10%',
        top: '30%',
        width: 480,
        height: 320,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: 20,
        padding: 40,
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        opacity,
        transform: `perspective(1000px) rotateY(-5deg) translateX(${translateX}px)`,
        border: '1px solid rgba(255,255,255,0.5)',
        fontFamily,
      }}
    >
      {lines.map((line, i) => {
        const lineStartIndex = lines.slice(0, i).join('\n').length + (i > 0 ? 1 : 0);
        const charsToShow = Math.max(0, Math.min(line.length, revealProgress - lineStartIndex));
        
        return (
          <div
            key={i}
            style={{
              fontSize: i === 0 ? 28 : 20,
              fontWeight: i === 0 ? 800 : 400,
              marginBottom: i === 0 ? 24 : 16,
              color: i === 0 ? '#1E293B' : '#475569',
              lineHeight: 1.4,
            }}
          >
            {line.slice(0, Math.floor(charsToShow))}
          </div>
        );
      })}
    </div>
  );
};

export const AutomatedAnalysisScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Exit animations
  const exitStart = durationInFrames - 15;
  const pillExit = spring({ frame: frame - (exitStart), fps: 30, config: { damping: 200 } });
  const dataExit = spring({ frame: frame - (exitStart + 3), fps: 30, config: { damping: 200 } });
  const insightExit = spring({ frame: frame - (exitStart + 6), fps: 30, config: { damping: 200 } });

  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const finalFade = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ 
      background: 'linear-gradient(135deg, #8BC6EC 0%, #95B4DC 100%)',
      opacity: sceneOpacity * finalFade,
    }}>
      <div style={{ opacity: 1 - pillExit, transform: `scale(${1 - pillExit * 0.1})` }}>
        <FeaturePill text="Automated Data Analysis" frame={frame} />
      </div>
      
      <div style={{ opacity: 1 - dataExit, transform: `scale(${1 - dataExit * 0.05})` }}>
        <DataStreamMockup frame={frame} />
      </div>
      
      <div style={{ opacity: 1 - insightExit, transform: `scale(${1 - insightExit * 0.05})` }}>
        <InsightCardMockup frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

export default AutomatedAnalysisScene;
