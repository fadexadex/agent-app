import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';

export const RemoteChaosHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background
        layers={[
          {
            type: 'radial',
            colors: ['#333333', '#1A1A1A', '#1A1A1A'],
            centerX: 50,
            centerY: 50,
            radius: 120
          }
        ]}
      />

      {/* Task List Mockup - Disarrayed */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(calc(-50% - 150px), calc(-50% + 50px)) rotate(-15deg)',
        width: 360,
        filter: 'blur(3px)',
        opacity: 0.65,
        zIndex: 1
      }}>
        <MotionContainer 
          initial="scale-zero" 
          delay={0} 
          duration={25} 
          exit="blur-out" 
          exitStartFrame={95}
        >
          <MockupFrame type="card" theme="dark" glass glare>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'sans-serif' }}>
              <div style={{ color: '#ffffff', fontSize: 20, fontWeight: 700, borderBottom: '1px solid #444', paddingBottom: 8 }}>
                Task List
              </div>
              <div style={{ color: '#4ade80', fontSize: 16 }}>● Task A: In progress</div>
              <div style={{ color: '#f87171', fontSize: 16 }}>● Task B: Overdue</div>
              <div style={{ color: '#fbbf24', fontSize: 16 }}>● Task C: Pending review</div>
              <div style={{ color: '#f87171', fontSize: 16 }}>● Task D: Blocked</div>
            </div>
          </MockupFrame>
        </MotionContainer>
      </div>

      {/* Chat Window Mockup - Disarrayed */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(calc(-50% + 100px), calc(-50% - 10px)) rotate(10deg)',
        width: 400,
        filter: 'blur(2px)',
        opacity: 0.8,
        zIndex: 2
      }}>
        <MotionContainer 
          initial="scale-zero" 
          delay={5} 
          duration={25} 
          exit="blur-out" 
          exitStartFrame={98}
        >
          <MockupFrame type="card" theme="light" glass glare>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'sans-serif' }}>
              <div style={{ color: '#000000', fontSize: 20, fontWeight: 700, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
                Team Chat
              </div>
              <div style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, fontSize: 15 }}>
                <strong style={{ color: '#2563eb' }}>John:</strong> Did you get my message?
              </div>
              <div style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, fontSize: 15 }}>
                <strong style={{ color: '#db2777' }}>Sarah:</strong> What about the deadline?
              </div>
              <div style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, fontSize: 15, borderLeft: '4px solid #ef4444' }}>
                <strong style={{ color: '#b91c1c' }}>Admin:</strong> Reminder: Daily standup!
              </div>
            </div>
          </MockupFrame>
        </MotionContainer>
      </div>

      {/* Hook Text */}
      <div style={{ zIndex: 10, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <AnimatedText
          text="Feeling overwhelmed by remote project chaos?"
          preset="typewriter"
          startFrame={10}
          stagger={1}
          anchor="center"
          offsetY={-80}
          fontSize={52}
          fontWeight={800}
          color="#FFFFFF"
          exit={{
            startFrame: 101,
            blur: { from: 0, to: 15, duration: 15 },
            opacity: { from: 1, to: 0, duration: 15 }
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
