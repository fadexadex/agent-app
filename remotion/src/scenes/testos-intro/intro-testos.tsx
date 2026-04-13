import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont();

// --- Components ---

const SunsetBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // Subtle zoom/shift for the background
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)',
        transform: `scale(${scale})`,
      }}
    />
  );
};

const ProductLogo: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Ripple effect logic
  const rippleCount = 3;
  const ripples = Array.from({ length: rippleCount }).map((_, i) => {
    const rippleFrame = frame - startFrame - (i * 15);
    const progress = interpolate(rippleFrame, [0, 60], [0, 1], {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    });
    const opacity = interpolate(progress, [0, 0.5, 1], [0, 0.4, 0]);
    const scale = interpolate(progress, [0, 1], [0.8, 2.5]);
    
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '2px solid white',
          opacity,
          transform: `scale(${scale})`,
        }}
      />
    );
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${entrance})`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {ripples}
      <div
        style={{
          width: 120,
          height: 120,
          backgroundColor: 'white',
          borderRadius: '30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          zIndex: 10,
        }}
      >
        <span style={{ 
          fontFamily, 
          fontSize: 60, 
          fontWeight: 900, 
          color: '#ff5f6d',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        }}>T</span>
      </div>
    </div>
  );
};

const AnimatedText: React.FC<{ 
  text: string; 
  startFrame: number; 
  yOffset: number; 
  fontSize: number; 
  fontWeight: string;
  exitFrame: number;
}> = ({ text, startFrame, yOffset, fontSize, fontWeight, exitFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance
  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [20, 0]);

  // Exit animation (fade out and slide slightly)
  const exitProgress = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitTranslateY = interpolate(exitProgress, [0, 1], [0, -10]);

  // Combined styles
  const finalOpacity = opacity * exitOpacity;
  const finalTranslateY = translateY + exitTranslateY;

  return (
    <div
      style={{
        position: 'absolute',
        top: `calc(50% + ${yOffset}px)`,
        width: '100%',
        textAlign: 'center',
        fontFamily,
        fontSize,
        fontWeight,
        color: 'white',
        opacity: finalOpacity,
        transform: `translateY(${finalTranslateY}px)`,
        textShadow: '0 4px 10px rgba(0,0,0,0.1)',
      }}
    >
      {text}
    </div>
  );
};

export const IntroTestOS: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Scene-wide transition: slideRight for the last 20 frames
  const transitionStart = durationInFrames - 20;
  const slideProgress = interpolate(frame, [transitionStart, durationInFrames], [0, 1], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slideX = interpolate(slideProgress, [0, 1], [0, 100]);

  // Exit frames for staggered departure (Note: Exit elements in order, stagger by 3)
  const exitBase = durationInFrames - 30;

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#000', 
      overflow: 'hidden',
      transform: `translateX(${slideX}%)` 
    }}>
      <SunsetBackground />
      
      {/* Product Logo */}
      <ProductLogo startFrame={0} />

      {/* Product Name: TestOS: Connect Smarter. */}
      <AnimatedText 
        text="TestOS: Connect Smarter." 
        startFrame={30} 
        yOffset={60} 
        fontSize={64} 
        fontWeight="800"
        exitFrame={exitBase}
      />

      {/* Tagline: The intelligent platform for seamless interactions. */}
      <AnimatedText 
        text="The intelligent platform for seamless interactions." 
        startFrame={70} 
        yOffset={130} 
        fontSize={28} 
        fontWeight="400"
        exitFrame={exitBase + 3}
      />
    </AbsoluteFill>
  );
};
