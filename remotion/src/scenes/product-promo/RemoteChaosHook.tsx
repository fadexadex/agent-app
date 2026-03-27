
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { Background } from '@/components/Global';
import { AnimatedText } from '@/components/AnimatedText';
import { MockupFrame } from '@/components/MockupFrame';

export const RemoteChaosHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background gradient setup
  const backgroundLayers = [
    { type: 'radial', colors: ['#1A1A1A', '#333333'], centerX: 50, centerY: 50, radius: 100 },
  ];

  // Typewriter effect duration for the main text
  const mainText = "Feeling overwhelmed by remote project chaos?";
  const typewriterDuration = mainText.length * 1; // 1 frame per character speed

  // Exit animation for the entire scene content
  const exitStartFrame = 120 - 15; // Scene duration 120, transition duration 15
  const exitOpacity = interpolate(frame, [exitStartFrame, 120], [1, 0], { extrapolateRight: 'clamp' });
  const exitBlur = interpolate(frame, [exitStartFrame, 120], [0, 10], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <Background layers={backgroundLayers} />

      <AbsoluteFill style={{ opacity: exitOpacity, filter: `blur(${exitBlur}px)` }}>
        {/* Hook Question Text */}
        <AnimatedText
          text={mainText}
          preset="typewriter"
          animationUnit="character"
          stagger={1} // 1 frame per character
          startFrame={10}
          anchor="center"
          offsetY={-80}
          fontSize={56}
          fontWeight={700}
          color="#FFFFFF"
          style={{
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: width * 0.8,
            wordBreak: 'break-word',
          }}
        />

        {/* Chaotic Task List Mockup */}
        <AbsoluteFill style={{
          transform: 'rotate(-10deg) scale(0.8)',
          filter: 'blur(3px)',
          left: width / 2 - 150 - (width * 0.2), // Adjust for anchor center + X offset + visual size
          top: height / 2 + 50 - (height * 0.2),
          width: width * 0.4,
          height: height * 0.4,
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <MockupFrame
            type="card"
            theme="dark"
            glass={{ blur: 10, opacity: 0.2 }}
            glare
            width={width * 0.4}
            height={height * 0.4}
          >
            <div style={{ padding: 20, color: 'white', fontSize: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: 0 }}>Task A: In progress</p>
              <p style={{ margin: 0, color: '#fca311' }}>Task B: Overdue</p>
              <p style={{ margin: 0 }}>Task C: Pending review</p>
              <p style={{ margin: 0, color: '#ef4444' }}>Task D: Blocked</p>
            </div>
          </MockupFrame>
        </AbsoluteFill>

        {/* Chaotic Chat Window Mockup */}
        <AbsoluteFill style={{
          transform: 'rotate(15deg) scale(0.7)',
          filter: 'blur(4px)',
          left: width / 2 + 100 - (width * 0.15), // Adjust for anchor center + X offset + visual size
          top: height / 2 - 10 - (height * 0.15),
          width: width * 0.3,
          height: height * 0.3,
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <MockupFrame
            type="card"
            theme="dark"
            glass={{ blur: 10, opacity: 0.2 }}
            glare
            width={width * 0.3}
            height={height * 0.3}
          >
            <div style={{ padding: 15, color: 'white', fontSize: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, color: '#a78bfa' }}>John: Did you get my message?</p>
              <p style={{ margin: 0, color: '#60a5fa' }}>Sarah: What about the deadline?</p>
              <p style={{ margin: 0, fontWeight: 600 }}>Admin: Reminder: Daily standup!</p>
            </div>
          </MockupFrame>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
