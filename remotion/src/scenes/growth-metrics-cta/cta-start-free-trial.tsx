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

// --- Subcomponents ---

const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle, #FF7F50 0%, #FF6347 100%)',
      }}
    />
  );
};

const ProductLogo: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  // Entrance: Fade in (Note: "Logo fades in")
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  // Exit: Fade out (Note: "Exit order: logo, ...")
  // Using frame 90 as start of exit sequence based on 120 total duration
  const exitOpacity = interpolate(frame, [90, 105], [1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 100,
        height: 100,
        backgroundColor: 'white',
        borderRadius: '20%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        opacity: opacity * exitOpacity,
      }}
    >
      <div style={{ fontSize: 40 }}>📈</div>
    </div>
  );
};

const CallToActionButton: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  
  // Entrance: Scale in (Note: "button scales in")
  // Staggered slightly after text (starts at frame 40)
  const scale = spring({
    frame: frame - 40,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Pulse animation (Subtle hover-like pulse)
  const pulse = Math.sin(frame / 10) * 0.03 + 1;

  // Exit: Fade out (last in exit order)
  const exitOpacity = interpolate(frame, [105, 115], [1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale * pulse})`,
        backgroundColor: '#007AFF',
        color: 'white',
        padding: '20px 40px',
        borderRadius: '12px',
        fontSize: '28px',
        fontWeight: 'bold',
        fontFamily,
        boxShadow: '0 10px 25px rgba(0,122,255,0.4)',
        opacity: exitOpacity,
        whiteSpace: 'nowrap',
      }}
    >
      Start Your Free Trial Now
    </div>
  );
};

// --- Main Scene ---

export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Question Text (cta-question)
  // Entrance: Start frame 20 (from JSON typewriter start)
  const questionCharCount = Math.floor(
    interpolate(frame - 20, [0, 30], [0, 46], { extrapolateRight: 'clamp' })
  );
  const questionText = "Ready to accelerate your Shopify store's growth?";
  const questionOpacity = interpolate(frame - 20, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const questionExitOpacity = interpolate(frame, [93, 108], [1, 0], {
    extrapolateRight: 'clamp',
  });

  // URL Text (website-url)
  // Entrance: Start frame 80 (from JSON typewriter start)
  const urlText = "Visit GrowthMetrics.com";
  const urlCharCount = Math.floor(
    interpolate(frame - 80, [0, 20], [0, urlText.length], {
      extrapolateRight: 'clamp',
    })
  );
  const urlExitOpacity = interpolate(frame, [96, 111], [1, 0], {
    extrapolateRight: 'clamp',
  });

  // Global Scene Fade (Transition: fade, duration 10)
  const sceneOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', opacity: sceneOpacity }}>
      <Background />
      
      <ProductLogo frame={frame} />

      {/* Question Text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -120px)', // y: -80 from anchor center
          width: '80%',
          textAlign: 'center',
          color: 'white',
          fontSize: '36px',
          fontWeight: 600,
          fontFamily,
          opacity: questionOpacity * questionExitOpacity,
        }}
      >
        {questionText.slice(0, questionCharCount)}
      </div>

      <CallToActionButton frame={frame} />

      {/* Website URL */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, 100px)', // y: 100 from anchor center
          color: 'white',
          fontSize: '24px',
          fontFamily,
          opacity: urlExitOpacity,
          letterSpacing: '1px',
        }}
      >
        {urlText.slice(0, urlCharCount)}
      </div>
    </AbsoluteFill>
  );
};
