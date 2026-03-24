import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background } from '@/components/Global';
import { AnimatedText } from '@/components/AnimatedText';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';

export const IntroAppSolution: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Background layer */}
      <Background 
        layers={[
          { type: 'linear', colors: ['#6EE7B7', '#3B82F6'] }
        ]}
      />

      {/* Main Container */}
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Title Section */}
        <div style={{ marginTop: '80px', width: '100%', height: '120px', display: 'flex', justifyContent: 'center' }}>
          <AnimatedText
            text="Meet UniGuide: Your Campus Companion."
            preset="typewriter"
            animationUnit="character"
            stagger={2}
            startFrame={10}
            anchor="top-center"
            offsetY={80}
            fontSize={56}
            fontWeight={700}
            color="#FFFFFF"
            exit={{
              startFrame: 100, // 5 frames after mockup slides down
              opacity: { from: 1, to: 0, duration: 15 },
            }}
          />
        </div>

        {/* Mockup Section */}
        <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <MotionContainer
            initial="offscreen-bottom"
            delay={15} // Staggered 5 frames after text
            exit="slide-down"
            exitStartFrame={95} // Exits first
            style={{ width: '360px', height: '700px' }} 
          >
            <MockupFrame type="iphone15" theme="light">
              {/* Home Screen Design inside iPhone */}
              <AbsoluteFill style={{ backgroundColor: '#F8FAFC', padding: '16px', paddingTop: '48px', fontFamily: 'sans-serif' }}>
                
                {/* Campus Map Header */}
                <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1E293B' }}>Campus Map</div>
                
                {/* Map Graphic Box */}
                <div style={{ width: '100%', height: '220px', backgroundColor: '#E2E8F0', borderRadius: '16px', overflow: 'hidden', position: 'relative', marginBottom: '24px' }}>
                  <div style={{ position: 'absolute', top: '20px', left: '20px', width: '80px', height: '60px', backgroundColor: '#34D399', borderRadius: '8px', transform: 'rotate(15deg)' }} />
                  <div style={{ position: 'absolute', bottom: '30px', right: '40px', width: '90px', height: '110px', backgroundColor: '#60A5FA', borderRadius: '8px', transform: 'rotate(-5deg)' }} />
                  {/* Pin marker */}
                  <div style={{ position: 'absolute', top: '100px', left: '120px', width: '16px', height: '16px', backgroundColor: '#EF4444', borderRadius: '50%', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                </div>

                {/* Schedule Header */}
                <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1E293B' }}>Today's Schedule</div>
                
                {/* Schedule Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '16px', backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ color: '#3B82F6', fontWeight: 600, width: '60px' }}>09:00</div>
                    <div style={{ color: '#334155', fontWeight: 500 }}>CS101 Intro</div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ color: '#3B82F6', fontWeight: 600, width: '60px' }}>11:30</div>
                    <div style={{ color: '#334155', fontWeight: 500 }}>Math 202</div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ color: '#3B82F6', fontWeight: 600, width: '60px' }}>14:00</div>
                    <div style={{ color: '#334155', fontWeight: 500 }}>Lab Session</div>
                  </div>
                </div>

              </AbsoluteFill>
            </MockupFrame>
          </MotionContainer>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
