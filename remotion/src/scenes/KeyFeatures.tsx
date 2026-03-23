import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

interface FeatureCardProps {
  icon: string;
  title: string;
  delay: number;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, delay, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy spring with a subtle bounce for entrance
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 1 },
  });

  const translateY = interpolate(entrance, [0, 1], [80, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1], { 
    extrapolateRight: 'clamp', 
    extrapolateLeft: 'clamp' 
  });
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);

  // Continuous gentle floating animation
  const float = Math.sin((frame + index * 30) / 20) * 8;

  return (
    <div style={{
      opacity,
      transform: `translateY(${translateY + float}px) scale(${scale})`,
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 28,
      padding: '40px 30px',
      width: 320,
      height: 280,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: 80, 
        marginBottom: 24,
        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))'
      }}>
        {icon}
      </div>
      <div style={{ 
        fontSize: 28, 
        fontWeight: 600, 
        color: '#ffffff', 
        lineHeight: 1.3,
        letterSpacing: '-0.01em'
      }}>
        {title}
      </div>
    </div>
  );
};

export const KeyFeatures: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Deep premium background to contrast the glass cards */}
      <Background preset="midnightOcean" />
      
      {/* Main Headline */}
      <AnimatedText
        text="Built for speed & simplicity"
        preset="fadeBlurIn"
        startFrame={0}
        anchor="top-center"
        offsetY={160}
        fontSize={72}
        fontWeight={700}
        gradient={{ colors: ['#ffffff', '#e0f2fe'], angle: 90 }}
      />

      {/* Feature Cards Container */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        gap: 40,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
      }}>
        <FeatureCard 
          icon="⚡️" 
          title="Smart automation." 
          delay={20} 
          index={0}
        />
        <FeatureCard 
          icon="🤝" 
          title="Real-time collaboration." 
          delay={35} 
          index={1}
        />
        <FeatureCard 
          icon="📊" 
          title="Beautiful dashboards." 
          delay={50} 
          index={2}
        />
      </div>

      {/* Conclusion Text */}
      <AnimatedText
        text="Everything you need, nothing you don't."
        preset="slideInUp"
        startFrame={100}
        anchor="bottom-center"
        offsetY={-140}
        fontSize={36}
        fontWeight={500}
        color="rgba(255,255,255,0.7)"
      />
    </AbsoluteFill>
  );
};
