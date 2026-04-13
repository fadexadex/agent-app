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

const CallToActionButton: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = spring({
    frame: frame - 45,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const exit = spring({
    frame: frame - 86,
    fps,
    config: { damping: 200 },
  });

  const scale = interpolate(entrance - exit, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        backgroundColor: '#8BC34A',
        padding: '20px 60px',
        borderRadius: '50px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        marginTop: '80px',
      }}
    >
      <span
        style={{
          color: 'white',
          fontSize: '32px',
          fontWeight: 'bold',
          fontFamily,
        }}
      >
        Get Started Now
      </span>
    </div>
  );
};

export const CtaGetStarted: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations for Question
  const questionEntrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 200 },
  });
  const questionExit = interpolate(frame, [80, 95], [1, 0], { extrapolateRight: 'clamp' });

  // Animations for Website URL
  const urlEntrance = spring({
    frame: frame - 25,
    fps,
    config: { damping: 200 },
  });
  const urlExit = interpolate(frame, [83, 98], [1, 0], { extrapolateRight: 'clamp' });

  // Animations for Logo
  const logoEntrance = interpolate(frame, [50, 65], [0, 1], { extrapolateRight: 'clamp' });
  const logoExit = interpolate(frame, [89, 100], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#303F9F', fontFamily }}>
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(48,63,159,0) 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Question Text */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          width: '100%',
          textAlign: 'center',
          opacity: questionEntrance * questionExit,
          transform: `translateY(${interpolate(questionEntrance, [0, 1], [20, 0])}px)`,
          color: 'white',
          fontSize: '48px',
          fontWeight: 500,
        }}
      >
        Ready to Experience True Productivity?
      </div>

      {/* Main Content Area */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            opacity: urlEntrance * urlExit,
            transform: `scale(${interpolate(urlEntrance, [0, 1], [0.95, 1])})`,
            color: 'white',
            fontSize: '72px',
            fontWeight: 'bold',
          }}
        >
          Visit VoiceOS.com
        </div>

        <CallToActionButton frame={frame} fps={fps} />
      </div>

      {/* Small Logo Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '30px',
          opacity: logoEntrance * logoExit,
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '24px',
          fontWeight: 600,
          letterSpacing: '1px',
        }}
      >
        VoiceOS
      </div>
    </AbsoluteFill>
  );
};
