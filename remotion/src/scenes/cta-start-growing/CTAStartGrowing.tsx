import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

const CTAButton: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 8, // Bouncy as requested
    },
    durationInFrames: 30,
  });

  // Pulse effect after entrance
  const pulse = Math.sin((frame - startFrame - 30) / 10) * 0.05;
  const scale = entrance + (frame > startFrame + 30 ? pulse : 0);

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity: entrance,
        backgroundColor: '#007bff',
        padding: '24px 48px',
        borderRadius: '50px',
        boxShadow: '0 10px 30px rgba(0, 123, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          color: 'white',
          fontSize: '32px',
          fontWeight: '700',
          fontFamily,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const CTAStartGrowing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Question Animation (Fade In)
  const questionOpacity = interpolate(
    frame,
    [10, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  const questionY = interpolate(
    frame,
    [10, 30],
    [-80, -100],
    { extrapolateRight: 'clamp' }
  );

  // URL Typewriter
  const urlText = "Visit Insightify.com today!";
  const urlProgress = interpolate(
    frame,
    [70, 100],
    [0, urlText.length],
    { extrapolateRight: 'clamp' }
  );
  const displayedUrl = urlText.slice(0, Math.floor(urlProgress));

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF', fontFamily }}>
      {/* Question */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          top: '50%',
          transform: `translateY(${questionY}px)`,
          textAlign: 'center',
          opacity: questionOpacity,
        }}
      >
        <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>
          Ready to scale your Shopify store?
        </h1>
      </div>

      {/* Button */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <CTAButton text="Start Your Free Trial" startFrame={40} />
      </div>

      {/* URL */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          bottom: '50%',
          transform: 'translateY(120px)',
          textAlign: 'center',
          color: '#666',
          fontSize: '24px',
          fontWeight: '500',
        }}
      >
        {displayedUrl}
        {frame > 70 && frame < 105 && (
           <span style={{ opacity: Math.floor(frame / 10) % 2 ? 0 : 1 }}>|</span>
        )}
      </div>
    </AbsoluteFill>
  );
};
