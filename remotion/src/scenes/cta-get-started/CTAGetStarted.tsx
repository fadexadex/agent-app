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

const CONTAINER_STYLE: React.CSSProperties = {
  backgroundColor: '#6DD5ED',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily,
  color: 'white',
  padding: '60px',
};

const MAIN_TEXT_STYLE: React.CSSProperties = {
  fontSize: '64px',
  fontWeight: 800,
  textAlign: 'center',
  marginBottom: '40px',
  lineHeight: 1.2,
};

const BUTTON_STYLE: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  padding: '24px 48px',
  borderRadius: '16px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
};

const BUTTON_TEXT_STYLE: React.CSSProperties = {
  color: '#6DD5ED',
  fontSize: '32px',
  fontWeight: 700,
};

const SUB_BUTTON_STYLE: React.CSSProperties = {
  color: '#94A3B8',
  fontSize: '18px',
  fontWeight: 500,
};

const URL_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: '50px',
  fontSize: '24px',
  fontWeight: 500,
  opacity: 0.8,
};

export const CTAGetStarted: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance Animations
  const mainTextSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });

  const buttonSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const urlSpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 200 },
  });

  // Exit Animations (Staggered by 3 frames)
  const exitStart = 100;
  const mainTextExit = spring({
    frame: frame - exitStart,
    fps,
    config: { damping: 200 },
  });
  const buttonExit = spring({
    frame: frame - (exitStart + 3),
    fps,
    config: { damping: 200 },
  });
  const urlExit = spring({
    frame: frame - (exitStart + 6),
    fps,
    config: { damping: 200 },
  });

  // Fade transition for the whole scene (requested fade 15 frames)
  const sceneOpacity = interpolate(
    frame,
    [0, 15, 105, 120],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ ...CONTAINER_STYLE, opacity: sceneOpacity }}>
      {/* Main Text Reveal */}
      <div
        style={{
          ...MAIN_TEXT_STYLE,
          opacity: mainTextSpring - mainTextExit,
          transform: `translateY(${interpolate(
            mainTextSpring,
            [0, 1],
            [20, 0]
          )}px)`,
        }}
      >
        Ready to transform your workflow?
      </div>

      {/* CTA Button Card */}
      <div
        style={{
          ...BUTTON_STYLE,
          opacity: buttonSpring - buttonExit,
          transform: `scale(${interpolate(
            buttonSpring,
            [0, 1],
            [0.8, 1]
          )}) translateY(${interpolate(buttonSpring, [0, 1], [30, 0])}px)`,
        }}
      >
        <div style={BUTTON_TEXT_STYLE}>Start Your Free Trial</div>
        <div style={SUB_BUTTON_STYLE}>No credit card required.</div>
      </div>

      {/* Website URL */}
      <div
        style={{
          ...URL_STYLE,
          opacity: (urlSpring - urlExit) * 0.8,
          transform: `translateY(${interpolate(
            urlSpring,
            [0, 1],
            [10, 0]
          )}px)`,
        }}
      >
        testing212.com
      </div>
    </AbsoluteFill>
  );
};
