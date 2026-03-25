import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { 
  Calendar, 
  MessageCircle, 
  Folder, 
  FileText, 
  Mail, 
  Clock, 
  User, 
  BarChart, 
  Wrench, 
  Coffee 
} from 'lucide-react';

const ICONS = [Calendar, MessageCircle, Folder, FileText, Mail, Clock, User, BarChart, Wrench, Coffee];

const ScatteredWorkIcons: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = 25;
  const exitFrame = 105;

  const exitProgress = interpolate(frame, [exitFrame, exitFrame + 15], [0, 1], { 
    extrapolateLeft: 'clamp', 
    extrapolateRight: 'clamp' 
  });
  
  const opacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const blur = interpolate(exitProgress, [0, 1], [0, 15]);

  return (
    <AbsoluteFill style={{ opacity, filter: `blur(${blur}px)` }}>
      {ICONS.map((Icon, index) => {
        const angle = (index * (360 / ICONS.length)) * (Math.PI / 180);
        const distance = 250 + (index % 3) * 60;
        const targetRotation = (index % 2 === 0 ? 1 : -1) * (45 + index * 20);

        const entrance = spring({
          frame: frame - startFrame - (index * 2), // Stagger the scattering slightly
          fps,
          config: { damping: 14, stiffness: 120 }
        });

        // Starts clustered in center (scale 0), rapidly expands to full scale while moving outward
        const scale = interpolate(entrance, [0, 1], [0, 1.2]);
        const x = interpolate(entrance, [0, 1], [0, Math.cos(angle) * distance]);
        const y = interpolate(entrance, [0, 1], [0, Math.sin(angle) * distance]);
        const rotation = interpolate(entrance, [0, 1], [0, targetRotation]);

        return (
          <AbsoluteFill key={index} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
              color: 'rgba(255, 255, 255, 0.08)',
              position: 'absolute'
            }}>
              <Icon size={80} strokeWidth={1.5} />
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

export const Scene01HookChallenge: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background
        layers={[
          { type: 'solid', color: '#1A1A1A' },
          { type: 'radial', colors: ['#333333', '#1A1A1A', 'transparent'], centerX: 50, centerY: 50, radius: 80 },
          { type: 'noise', opacity: 0.05 }
        ]}
      />

      <ScatteredWorkIcons />

      <AnimatedText
        text="Overwhelmed by remote work chaos?"
        preset="typewriter"
        startFrame={0}
        stagger={1}
        anchor="center"
        offsetY={-60}
        fontSize={56}
        fontWeight={700}
        color="#FFFFFF"
        exit={{
          startFrame: 100,
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 15, duration: 15 }
        }}
      />

      <AnimatedText
        text="Tasks piling up? Deadlines slipping?"
        preset="typewriter"
        startFrame={20}
        stagger={2}
        anchor="center"
        offsetY={20}
        fontSize={36}
        fontWeight={500}
        color="#AAAAAA"
        exit={{
          startFrame: 95,
          opacity: { from: 1, to: 0, duration: 15 },
          blur: { from: 0, to: 15, duration: 15 }
        }}
      />
    </AbsoluteFill>
  );
};
