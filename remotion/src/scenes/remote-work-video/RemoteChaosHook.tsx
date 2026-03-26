
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';

export const RemoteChaosHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background animation - assuming background is static for this scene
  // The background is a radial gradient: {"type":"gradient","colors":["#1A1A1A","#333333"],"preset":"radial"}
  // Background component uses 'layers' for custom gradients, and 'radial' is a layer type.
  const backgroundLayers = [
    { type: "radial", colors: ["#333333", "#1A1A1A"], centerX: 50, centerY: 50, radius: 100 }
  ];

  // Animation for the mockups to appear and settle
  const mockupEntryProgress = spring({
    frame: frame - 20, // Start mockups after 20 frames
    fps,
    config: { damping: 20, stiffness: 200 }, // Snappy entrance
  });

  // Mockup 1 (Chaotic Task List) animations
  const mockup1Blur = interpolate(mockupEntryProgress, [0, 1], [15, 0], { extrapolateRight: 'clamp' });
  const mockup1Opacity = interpolate(mockupEntryProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  // Initial rotation more extreme, settles to a chaotic but less extreme angle
  const mockup1RotationX = interpolate(mockupEntryProgress, [0, 1], [30, -5], { extrapolateRight: 'clamp' });
  const mockup1RotationY = interpolate(mockupEntryProgress, [0, 1], [-40, 10], { extrapolateRight: 'clamp' });
  const mockup1RotationZ = interpolate(mockupEntryProgress, [0, 1], [20, -10], { extrapolateRight: 'clamp' });

  // Mockup 2 (Chaotic Chat Window) animations
  const mockup2Blur = interpolate(mockupEntryProgress, [0, 1], [15, 0], { extrapolateRight: 'clamp' });
  const mockup2Opacity = interpolate(mockupEntryProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  // Initial rotation more extreme, settles to a chaotic but less extreme angle
  const mockup2RotationX = interpolate(mockupEntryProgress, [0, 1], [-20, 8], { extrapolateRight: 'clamp' });
  const mockup2RotationY = interpolate(mockupEntryProgress, [0, 1], [30, -15], { extrapolateRight: 'clamp' });
  const mockup2RotationZ = interpolate(mockupEntryProgress, [0, 1], [-15, 5], { extrapolateRight: 'clamp' });

  // Global scene blur for the last 15 frames
  const globalBlur = interpolate(
    frame,
    [120 - 15, 120], // Last 15 frames
    [0, 10], // From no blur to 10px blur
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A1A1A', filter: `blur(${globalBlur}px)` }}>
      <Background layers={backgroundLayers} />

      {/* Hook Question Text */}
      <AnimatedText
        text="Feeling overwhelmed by remote project chaos?"
        preset="typewriter"
        startFrame={10}
        anchor="center"
        offsetY={-80}
        fontSize={56}
        fontWeight={600}
        color="#FFFFFF"
        stagger={1} // Default for typewriter is usually character, stagger 1 frame
        style={{
          lineHeight: 1.2,
          textAlign: 'center',
          maxWidth: width * 0.8
        }}
      />

      {/* Chaotic Task List Mockup */}
      <MockupFrame
        type="card"
        theme="dark"
        glass={{ blur: 10, opacity: 0.15 }}
        glare
        width={400}
        height={300}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(${-150 - (width / 2)}px, ${50 - (height / 2)}px)`, // Use absolute positioning then translate
          opacity: mockup1Opacity,
          filter: `blur(${mockup1Blur}px)`,
        }}
        rotate={{
          startAngle: { x: mockup1RotationX, y: mockup1RotationY, z: mockup1RotationZ },
          endAngle: { x: -5, y: 10, z: -10 }, // Settled chaotic state
          startFrame: 20,
          endFrame: 50, // Animation duration for rotation
        }}
      >
        <div style={{ padding: 20, color: 'white', fontSize: 20, fontFamily: 'sans-serif' }}>
          <p style={{ margin: '5px 0' }}>Task A: In progress</p>
          <p style={{ margin: '5px 0' }}>Task B: Overdue</p>
          <p style={{ margin: '5px 0' }}>Task C: Pending review</p>
          <p style={{ margin: '5px 0' }}>Task D: Blocked</p>
        </div>
      </MockupFrame>

      {/* Chaotic Chat Window Mockup */}
      <MockupFrame
        type="card"
        theme="dark"
        glass={{ blur: 10, opacity: 0.15 }}
        glare
        width={350}
        height={250}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(${100 - (width / 2)}px, ${-10 - (height / 2)}px)`, // Use absolute positioning then translate
          opacity: mockup2Opacity,
          filter: `blur(${mockup2Blur}px)`,
        }}
        rotate={{
          startAngle: { x: mockup2RotationX, y: mockup2RotationY, z: mockup2RotationZ },
          endAngle: { x: 8, y: -15, z: 5 }, // Settled chaotic state
          startFrame: 25, // Stagger slightly after first mockup
          endFrame: 55, // Animation duration for rotation
        }}
      >
        <div style={{ padding: 20, color: 'white', fontSize: 18, fontFamily: 'sans-serif' }}>
          <p style={{ margin: '5px 0' }}>John: Did you get my message?</p>
          <p style={{ margin: '5px 0' }}>Sarah: What about the deadline?</p>
          <p style={{ margin: '5px 0' }}>Admin: Reminder: Daily standup!</p>
          <p style={{ margin: '5px 0' }}>Boss: Urgent! Check your DMs!</p>
        </div>
      </MockupFrame>

    </AbsoluteFill>
  );
};
