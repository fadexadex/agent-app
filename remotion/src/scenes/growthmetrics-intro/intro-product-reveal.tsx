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

const ProductLogo: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div
      style={{
        width: 200,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        borderRadius: '24%',
        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
        transform: `scale(${progress})`,
        marginBottom: 40,
      }}
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    </div>
  );
};

export const IntroProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animations
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const taglineMainStart = 40;
  const taglineMainText = "GrowthMetrics: Your E-commerce Growth Engine";
  const taglineMainProgress = interpolate(
    frame,
    [taglineMainStart, taglineMainStart + 30],
    [0, taglineMainText.length],
    { extrapolateRight: 'clamp' }
  );

  const taglineSupportStart = 80;
  const taglineSupportOpacity = interpolate(
    frame,
    [taglineSupportStart, taglineSupportStart + 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Global Scene Fade Exit
  const exitDuration = 10;
  const exitStart = 120 - exitDuration;
  const sceneOpacity = interpolate(
    frame,
    [exitStart, 120],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        fontFamily,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: sceneOpacity,
      }}
    >
      {/* Product Logo */}
      <ProductLogo progress={logoSpring} />

      {/* Main Tagline */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 600,
          color: '#1F2937',
          textAlign: 'center',
          maxWidth: '80%',
          height: 60, // Fixed height to prevent layout shift
          marginTop: 20,
        }}
      >
        {taglineMainText.slice(0, Math.floor(taglineMainProgress))}
      </div>

      {/* Supporting Tagline */}
      <div
        style={{
          fontSize: 24,
          color: '#6B7280',
          textAlign: 'center',
          marginTop: 20,
          opacity: taglineSupportOpacity,
          transform: `translateY(${interpolate(taglineSupportOpacity, [0, 1], [10, 0])}px)`,
        }}
      >
        Unlock Your Shopify Store's Full Potential
      </div>
    </AbsoluteFill>
  );
};
