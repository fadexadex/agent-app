import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// --- Sub-components ---

const BrowserMockup: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  
  // Create a wavy line for the chart
  const points = Array.from({ length: 40 }).map((_, i) => {
    const x = (i / 39) * 800;
    const y = 150 + Math.sin(i * 0.3) * 60 + Math.cos(i * 0.5) * 30;
    return `${x},${y}`;
  }).join(' ');

  const slideY = interpolate(progress, [0, 1], [100, 0]);
  const opacity = interpolate(progress, [0, 0.5], [0, 1]);

  return (
    <div style={{
      width: 900,
      height: 500,
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      border: '1px solid #E5E7EB',
      transform: `translateY(${slideY}px)`,
      opacity,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Browser Header */}
      <div style={{
        height: 40,
        background: '#F9FAFB',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
        <div style={{ 
          marginLeft: 20, 
          height: 20, 
          width: 400, 
          background: '#FFFFFF', 
          borderRadius: 4, 
          border: '1px solid #E5E7EB',
          fontSize: 10,
          color: '#9CA3AF',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 8,
          fontFamily
        }}>
          insightify.app/analytics/sales-trends
        </div>
      </div>
      
      {/* Chart Area */}
      <div style={{ flex: 1, padding: 40, position: 'relative' }}>
        <h2 style={{ fontFamily, fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Revenue Analysis</h2>
        <div style={{ height: 1, width: '100%', background: '#F3F4F6', margin: '20px 0' }} />
        
        <svg width="820" height="300" viewBox="0 0 800 300" style={{ overflow: 'visible' }}>
          <path
            d={`M 0 300 L ${points} L 800 300 Z`}
            fill="url(#gradient)"
            opacity={0.1}
          />
          <path
            d={`M 0 ${150 + Math.sin(0) * 60 + Math.cos(0) * 30} L ${points}`}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
                strokeDasharray: 2000,
                strokeDashoffset: interpolate(frame, [15, 60], [2000, 0], { extrapolateRight: 'clamp' })
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="white" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

const HighlightBox: React.FC<{ 
    text: string, 
    x: number, 
    y: number, 
    showFrame: number,
    color: string 
}> = ({ text, x, y, showFrame, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const progress = spring({
    frame: frame - showFrame,
    fps,
    config: { damping: 15, stiffness: 100 }
  });

  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const opacity = interpolate(progress, [0, 0.5], [0, 1]);
  
  // Word by word reveal
  const words = text.split(' ');
  const wordCount = Math.floor(interpolate(frame - showFrame - 5, [0, 20], [0, words.length], { extrapolateRight: 'clamp' }));

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `scale(${scale})`,
      opacity,
      background: 'white',
      padding: '8px 16px',
      borderRadius: 8,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: `2px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily,
      zIndex: 10,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{ fontWeight: 600, fontSize: 16, color: '#374151' }}>
        {words.slice(0, wordCount + 1).join(' ')}
      </span>
    </div>
  );
};

// --- Main Scene ---

export const SalesTrendsAnalysis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Animations
  const mockupEntrance = spring({
    frame,
    fps,
    config: { damping: 200 }
  });

  // Caption logic
  const captionStart = 90;
  const captionProgress = spring({
    frame: frame - captionStart,
    fps,
    config: { damping: 200 }
  });
  
  const captionText = "Spot high-performing products & seasonal patterns.";
  // Typewriter effect (per char as requested in specs for elements)
  const charCount = Math.floor(interpolate(frame - captionStart, [0, 40], [0, captionText.length], { extrapolateRight: "clamp" }));

  // Global exit logic (Blur out)
  const exitFrame = durationInFrames - 15;
  const exitProgress = interpolate(frame, [exitFrame, durationInFrames], [0, 1], { extrapolateRight: 'clamp' });
  const globalBlur = interpolate(exitProgress, [0, 1], [0, 20]);
  const globalOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#FFFFFF', 
      justifyContent: 'center', 
      alignItems: 'center',
      filter: `blur(${globalBlur}px)`,
      opacity: globalOpacity
    }}>
      {/* Background Grid - subtle touch for 'Insightify' feel */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.5,
      }} />

      {/* Main Mockup */}
      <BrowserMockup progress={mockupEntrance} />

      {/* Peak Highlight */}
      <HighlightBox 
        text="Peak Sales" 
        x={width / 2 + 150} 
        y={height / 2 - 80} 
        showFrame={30} 
        color="#10B981" 
      />

      {/* Dip Highlight */}
      <HighlightBox 
        text="Identify Dips" 
        x={width / 2 - 120} 
        y={height / 2 + 60} 
        showFrame={70} 
        color="#EF4444" 
      />

      {/* Bottom Caption */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        width: '100%',
        textAlign: 'center',
        fontFamily,
        fontSize: 32,
        fontWeight: 600,
        color: '#1F2937',
        opacity: captionProgress,
        transform: `translateY(${interpolate(captionProgress, [0, 1], [20, 0])}px)`
      }}>
        {captionText.slice(0, charCount)}
      </div>
    </AbsoluteFill>
  );
};