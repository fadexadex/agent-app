import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

interface RemoteCollabFeatureProps {}

export const RemoteCollabFeature: React.FC<RemoteCollabFeatureProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Calculate global exit scale for the zoom transition
  const transitionStartFrame = 135 - 15; // 135 total frames, 15 for transition
  const globalScale = spring({
    frame: frame - transitionStartFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });
  const scale = interpolate(globalScale, [0, 1], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'solid', color: '#E8F5E9' }]} />

      {/* Main content wrapper for global exit transition */}
      <MotionContainer initial="hidden" exit="scale-down" exitStartFrame={transitionStartFrame} duration={15} style={{ width: '100%', height: '100%' }}>
        {/* Task Detail Card Mockup */}
        <AbsoluteFill style={{
          left: width / 2 - 180 - 200 / 2, // Centered X - offset - half of mockup width
          top: height / 2 - 20 - 300 / 2, // Centered Y - offset - half of mockup height
          width: 400,
          height: 300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <MockupFrame type="card" width={400} height={300} preset="springIn">
            <AbsoluteFill style={{ padding: 20, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <AnimatedText
                text="Task: Design Mockups
Assignee: Sarah
Status: In Progress
Comments:
John: Looks great!
Emily: Ready for review."
                preset="typewriter"
                animationUnit="character"
                stagger={0.8 / 30 * fps} // speed 0.8 characters per frame, convert to stagger frames
                startFrame={20}
                fontSize={24}
                lineHeight={32}
                color="#333"
              />
            </AbsoluteFill>
          </MockupFrame>
        </AbsoluteFill>

        {/* Team Chat Card Mockup */}
        <AbsoluteFill style={{
          left: width / 2 + 180 - 350 / 2, // Centered X + offset - half of mockup width
          top: height / 2 + 50 - 250 / 2, // Centered Y + offset - half of mockup height
          width: 350,
          height: 250,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <MockupFrame type="card" width={350} height={250} preset="springIn" startFrame={10}>
            <AbsoluteFill style={{ padding: 20, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <AnimatedText
                text="Team Channel:
John: Design mockups uploaded!
Sarah: Reviewing now.
Admin: Project deadline updated."
                preset="typewriter"
                animationUnit="character"
                stagger={0.8 / 30 * fps} // speed 0.8 characters per frame, convert to stagger frames
                startFrame={40}
                fontSize={20}
                lineHeight={28}
                color="#333"
              />
            </AbsoluteFill>
          </MockupFrame>
        </AbsoluteFill>

        {/* Team Avatars Grid (Placeholder) */}
        {[
          { x: -350, y: -250, delay: 0 }, // Top-left of scene
          { x: 300, y: -200, delay: 5 },  // Top-right of scene
          { x: -50, y: 180, delay: 10 },  // Bottom-center between cards
          { x: -400, y: 100, delay: 15 }, // Mid-left of scene
          { x: 400, y: 150, delay: 20 },  // Mid-right of scene
        ].map((avatar, index) => (
          <AbsoluteFill key={index} style={{
            left: width / 2 + avatar.x - 30 / 2,
            top: height / 2 + avatar.y - 30 / 2,
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <MotionContainer initial="scale-zero" delay={avatar.delay} duration={20}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#6EE7B7', // A nice green for avatars
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                }}
              />
            </MotionContainer>
          </AbsoluteFill>
        ))}


        {/* Collaboration Tagline */}
        <AnimatedText
          text="Keep everyone in sync, no matter the timezone."
          preset="typewriter"
          animationUnit="character"
          stagger={1 / 30 * fps} // speed 1 character per frame
          startFrame={100}
          anchor="center"
          offsetY={-200}
          fontSize={60}
          fontWeight={700}
          color="#222"
          style={{ width: '80%', textAlign: 'center' }}
        />
      </MotionContainer>
    </AbsoluteFill>
  );
};
