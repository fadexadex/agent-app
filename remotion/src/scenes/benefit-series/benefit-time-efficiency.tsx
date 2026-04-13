import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';
import { Clock, CheckCircle, Lightbulb } from 'lucide-react';

const { fontFamily } = loadFont();

const ICON_SIZE = 80;
const BLUE = '#1E88E5';
const DARK_BLUE = '#0D47A1';
const DARK_GREY = '#455A64';

const BenefitIcon = ({ 
  icon: Icon, 
  label, 
  delay, 
  exitFrame 
}: { 
  icon: any, 
  label: string, 
  delay: number,
  exitFrame: number
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const exit = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(entrance - exit, [0, 1], [0, 1]);
  const scale = interpolate(entrance - exit, [0, 1], [0.5, 1]);
  const translateY = interpolate(entrance - exit, [0, 1], [20, 0]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
      opacity,
      transform: `scale(${scale}) translateY(${translateY}px)`,
    }}>
      <div style={{
        width: 140,
        height: 140,
        borderRadius: '50%',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        border: `2px solid ${BLUE}22`,
      }}>
        <Icon size={ICON_SIZE} color={BLUE} strokeWidth={1.5} />
      </div>
      <span style={{
        fontFamily,
        fontSize: 28,
        fontWeight: 600,
        color: DARK_GREY,
        textAlign: 'center',
      }}>
        {label}
      </span>
    </div>
  );
};

export const BenefitTimeEfficiency: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Heading Animation (Word-by-word reveal)
  const headingText = "Save Hours, Gain Clarity.";
  const words = headingText.split(' ');
  
  const exitStart = 100;

  return (
    <AbsoluteFill style={{ backgroundColor: '#E3F2FD', fontFamily }}>
      {/* Central Content Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '0 100px',
      }}>
        
        {/* Heading */}
        <div style={{ 
          marginBottom: 100,
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {words.map((word, i) => {
            const wordDelay = 10 + i * 5;
            const wordEntrance = spring({
              frame: frame - wordDelay,
              fps,
              config: { damping: 200 },
            });
            const wordExit = interpolate(frame, [exitStart, exitStart + 15], [1, 0], { extrapolateRight: 'clamp' });
            
            return (
              <span key={i} style={{
                fontSize: 80,
                fontWeight: 800,
                color: DARK_BLUE,
                opacity: wordEntrance * wordExit,
                transform: `translateY(${interpolate(wordEntrance, [0, 1], [30, 0])}px)`,
                display: 'inline-block',
              }}>
                {word}
              </span>
            );
          })}
        </div>

        {/* Icons Grid */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 120,
          width: '100%',
        }}>
          <BenefitIcon 
            icon={Clock} 
            label="Time Saved" 
            delay={40} 
            exitFrame={exitStart + 3} 
          />
          <BenefitIcon 
            icon={CheckCircle} 
            label="Accuracy Boost" 
            delay={50} 
            exitFrame={exitStart + 6} 
          />
          <BenefitIcon 
            icon={Lightbulb} 
            label="Faster Decisions" 
            delay={60} 
            exitFrame={exitStart + 9} 
          />
        </div>
      </div>

      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${BLUE}11 0%, transparent 70%)`,
      }} />
      <div style={{
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${BLUE}08 0%, transparent 70%)`,
      }} />
    </AbsoluteFill>
  );
};
