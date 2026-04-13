import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

// --- Components ---

const FeaturePill: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  const exit = spring({
    frame: frame - 135,
    fps,
    config: { damping: 200 },
    durationInFrames: 15,
  });

  const opacity = entrance - exit;
  const translateY = interpolate(entrance, [0, 1], [-20, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        width: 350,
        height: 50,
        backgroundColor: '#6DD5ED',
        borderRadius: 25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        opacity,
        fontFamily,
        color: 'white',
        fontWeight: 600,
        fontSize: 18,
        letterSpacing: '0.5px',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      Automated Data Analysis
    </div>
  );
};

const DataStreamMockup: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - 20,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const exit = spring({
    frame: frame - 138,
    fps,
    config: { damping: 200 },
  });

  const opacity = entrance - exit;
  const scale = interpolate(entrance, [0, 1], [0.9, 1]);
  const x = interpolate(entrance, [0, 1], [-50, 0]);

  // Scrolling data effect
  const scrollY = (frame * 2) % 200;

  // Processing bar
  const progress = interpolate(frame, [40, 100], [0, 100], {
    extrapolateRight: 'clamp',
  });
  
  const isComplete = frame >= 100;

  return (
    <div
      style={{
        position: 'absolute',
        left: '15%',
        top: '50%',
        transform: `translateY(-50%) scale(${scale}) translateX(${x}px)`,
        width: 400,
        height: 500,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        opacity,
        fontFamily: 'monospace',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.4)',
      }}
    >
      <div style={{ color: '#666', fontSize: 12, marginBottom: 15 }}>RAW_DATA_STREAM</div>
      <div style={{ transform: `translateY(-${scrollY}px)`, opacity: 0.7 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 8, fontSize: 13, color: '#333' }}>
            {`{ "id": "${Math.random().toString(36).substr(2, 5)}", "status": "processing", "val": ${Math.random().toFixed(4)} }`}
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: 'linear-gradient(transparent, white)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 20,
      }}>
        <div style={{
          fontSize: 12,
          fontFamily,
          color: isComplete ? '#4CAF50' : '#6DD5ED',
          marginBottom: 8,
          fontWeight: 'bold',
          transition: 'color 0.3s'
        }}>
          {isComplete ? 'Processing complete' : 'Analyzing Stream...'}
        </div>
        <div style={{ width: '100%', height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: isComplete ? '#4CAF50' : '#6DD5ED', transition: 'background-color 0.3s' }} />
        </div>
      </div>
    </div>
  );
};

const InsightCard: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const exit = spring({
    frame: frame - 141,
    fps,
    config: { damping: 200 },
  });

  const opacity = entrance - exit;
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const x = interpolate(entrance, [0, 1], [50, 0]);

  const text = "Key Insight\n• Critical error rate increased by 5% in module X\n• Performance bottleneck identified in API Y\n• 3 new vulnerabilities detected";
  
  // Typewriter timing
  const charsShown = Math.floor(interpolate(frame, [70, 130], [0, text.length], {
    extrapolateRight: 'clamp',
  }));
  const displayedText = text.slice(0, charsShown);

  return (
    <div
      style={{
        position: 'absolute',
        right: '15%',
        top: '50%',
        transform: `translateY(-50%) scale(${scale}) translateX(${x}px)`,
        width: 420,
        height: 320,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 40,
        boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
        opacity,
        fontFamily,
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.6,
      }}>
        {displayedText.split('\n').map((line, i) => (
          <div key={i} style={{ 
            fontSize: i === 0 ? 24 : 18, 
            fontWeight: i === 0 ? 800 : 400,
            marginBottom: i === 0 ? 24 : 12,
            color: i === 0 ? '#1A1A1A' : '#4A4A4A',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            {line}
          </div>
        ))}
      </div>
      
      {/* Decorative pulse element */}
      {entrance > 0.9 && (
        <div style={{
          position: 'absolute',
          top: 40,
          right: 40,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#FF4B2B',
          opacity: Math.sin(frame * 0.2) * 0.5 + 0.5,
        }} />
      )}
    </div>
  );
};

export const AutomatedAnalysis: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Scene transition fade
  const sceneOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#8BC6EC',
      backgroundImage: 'linear-gradient(135deg, #8BC6EC 0%, #95B4DC 100%)',
      opacity: sceneOpacity,
    }}>
      <FeaturePill frame={frame} />
      <DataStreamMockup frame={frame} />
      <InsightCard frame={frame} />
    </AbsoluteFill>
  );
};

export default AutomatedAnalysis;
