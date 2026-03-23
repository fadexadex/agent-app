import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '@/components/Global';
import { AnimatedText, LayoutGrid } from '@/components/AnimatedText';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';

export const TheSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background layer */}
      <Background preset="deepPurpleAurora" animated animationSpeed={0.5} />
      
      {/* Centered Main Layout */}
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <LayoutGrid anchor="center" direction="column" gap={60}>
          
          {/* Main Headline */}
          <AnimatedText
            text="Meet Your Product"
            preset="fadeBlurIn"
            animationUnit="word"
            stagger={5}
            startFrame={10}
            fontSize={84}
            fontWeight={800}
            color="#ffffff"
            anchor="center"
          />

          {/* Glass Card containing the description */}
          <div style={{ width: 1000 }}>
            <MotionContainer initial="offscreen-bottom" delay={30} duration={40}>
              <MockupFrame
                type="card"
                glass={{ blur: 30, opacity: 0.2 }}
                glare
                theme="dark"
                rotate={{
                  startAngle: { x: 25, y: -15 },
                  endAngle: { x: 0, y: 0 },
                  startFrame: 30,
                  endFrame: 70,
                }}
              >
                <div style={{ 
                  padding: '80px 60px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 40,
                  alignItems: 'center',
                  textAlign: 'center' 
                }}>
                  {/* First part of description */}
                  <AnimatedText
                    text="Your product brings everything together in one intelligent platform."
                    preset="slideInUp"
                    animationUnit="word"
                    stagger={2}
                    startFrame={50}
                    fontSize={42}
                    fontWeight={500}
                    color="#f8fafc"
                    anchor="center"
                  />
                  
                  {/* AI Subtext emphasizing intelligence */}
                  <div style={{ marginTop: 20 }}>
                    <AnimatedText
                      text="Powered by AI, designed for humans."
                      preset="scaleUp"
                      animationUnit="full"
                      startFrame={90}
                      fontSize={32}
                      fontWeight={700}
                      gradient={{ colors: ['#c084fc', '#ec4899', '#f43f5e'], angle: 135 }}
                      anchor="center"
                    />
                  </div>
                </div>
              </MockupFrame>
            </MotionContainer>
          </div>
          
        </LayoutGrid>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
