
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

interface FeatureRealtimeCollaborationProps {}

export const FeatureRealtimeCollaboration: React.FC<FeatureRealtimeCollaborationProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timings
  const mockupEntranceDelay = 0;
  const avatarsEntranceDelay = 30;
  const featureLabelEntranceDelay = 60;

  // Exit animations: elements exit in reverse order of appearance, staggered by 3 frames.
  // Scene duration is 140 frames. Let's assume an exit duration of 20 frames for each.
  // The last element to finish exiting is the mockup, it should end by frame 140.
  // Mockup exit starts: 140 (end) - 20 (duration) = 120
  // Avatars exit starts: 120 - 3 (stagger) = 117
  // Feature Label exit starts: 117 - 3 (stagger) = 114

  const featureLabelExitStartFrame = 114;
  const avatarsExitStartFrame = 117;
  const mockupExitStartFrame = 120;
  const exitDuration = 20;


  // For the custom avatar component, defining positions for 4 avatars
  const avatarPositions = [
    { x: width * 0.15, y: height * 0.2, delay: 0 },
    { x: width * 0.85, y: height * 0.15, delay: 5 },
    { x: width * 0.2, y: height * 0.8, delay: 10 },
    { x: width * 0.8, y: height * 0.85, delay: 15 },
  ];

  return (
    <AbsoluteFill>
      <Background preset="blue_purple_blend" animated />

      {/* Feature Label: "Seamless Team Sync" */}
      <MotionContainer
        initial="scale-zero"
        delay={featureLabelEntranceDelay}
        duration={25}
        exit="scale-down"
        exitStartFrame={featureLabelExitStartFrame}
        style={{
          position: 'absolute',
          top: height / 2 + 200, // anchor center, y: 200 means 200px down from center
          left: width / 2,
          transform: 'translate(-50%, -50%)', // Center the element itself
          backgroundColor: '#4CAF50', // Vibrant green
          borderRadius: 999, // Pill shape
          padding: '10px 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 280,
          height: 55,
          zIndex: 3, // Above mockup
        }}
      >
        <span style={{ color: 'white', fontSize: 32, fontWeight: 600, whiteSpace: 'nowrap' }}>
          Seamless Team Sync
        </span>
      </MotionContainer>

      {/* Mockup Frame: Web browser showing ProjectPilot AI task detail */}
      <MotionContainer
         initial="scale-zero"
         delay={mockupEntranceDelay}
         duration={30}
         exit="fade-out" // Using MotionContainer's exit for MockupFrame
         exitStartFrame={mockupExitStartFrame}
         style={{
            position: 'absolute',
            top: height / 2,
            left: width / 2,
            transform: 'translate(-50%, -50%)',
            width: 900, // Example width
            height: 600, // Example height
            zIndex: 2,
         }}
      >
        <MockupFrame
          type="browser"
          width={900}
          height={600}
          preset="springIn" // MockupFrame handles its own entrance at startFrame 0
          browserConfig={{ url: "projectpilot.ai/task/123" }}
          theme="dark"
          glass={{ blur: 5, opacity: 0.1 }}
        >
          {/* Placeholder content for ProjectPilot AI Task Detail */}
          <div style={{ padding: 20, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 15 }}>
            <h3 style={{ color: 'white', fontSize: 28, marginBottom: 5 }}>Task: Implement Feature X</h3>
            <p style={{ color: '#ccc', fontSize: 18 }}>Assigned to: Alice, Bob</p>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 8 }}>
              <p style={{ color: 'white', fontWeight: 'bold' }}>Comments (Live):</p>
              <p style={{ color: '#eee', marginTop: 5 }}><strong style={{ color: '#88f' }}>Alice:</strong> Looks good, ready for review!</p>
              <p style={{ color: '#eee', marginTop: 5 }}><strong style={{ color: '#f88' }}>Bob:</strong> Just uploaded the new designs.</p>
              <p style={{ color: '#eee', marginTop: 5 }}><strong style={{ color: '#8f8' }}>You:</strong> Got it, checking now.</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 8 }}>
              <p style={{ color: 'white', fontWeight: 'bold' }}>Attachments:</p>
              <p style={{ color: '#eee', marginTop: 5 }}>- design-v2.sketch</p>
              <p style={{ color: '#eee', marginTop: 5 }}>- feature-spec.pdf</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 8 }}>
              <p style={{ color: 'white', fontWeight: 'bold', marginBottom: 5 }}>Progress:</p>
              <div style={{ width: '100%', height: 10, backgroundColor: '#333', borderRadius: 5 }}>
                <div style={{ width: '75%', height: '100%', backgroundColor: '#4CAF50', borderRadius: 5 }}></div>
              </div>
              <p style={{ color: '#eee', marginTop: 5 }}>75% Complete</p>
            </div>
          </div>
        </MockupFrame>
      </MotionContainer>

      {/* Team Avatars: Dynamic grid of small, circular user avatars */}
      {avatarPositions.map((pos, index) => (
        <MotionContainer
          key={index}
          initial="scale-zero"
          delay={avatarsEntranceDelay + pos.delay} // Staggered entrance
          duration={20}
          exit="scale-down"
          exitStartFrame={avatarsExitStartFrame + (index * 3)} // Staggered exit
          style={{
            position: 'absolute',
            top: pos.y,
            left: pos.x,
            transform: 'translate(-50%, -50%)',
            zIndex: 1, // Below mockup and label
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: `hsl(${index * 60 + 200}, 70%, 70%)`, // Diverse colors
              border: '3px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            }}
          >
            {String.fromCharCode(65 + index)} {/* Displays A, B, C, D */}
          </div>
        </MotionContainer>
      ))}

    </AbsoluteFill>
  );
};
