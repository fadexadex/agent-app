
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';

interface FlowPilotIntroductionProps {}

export const FlowPilotIntroduction: React.FC<FlowPilotIntroductionProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // --- Animation Timings ---
  const logoEntryStart = 0;
  const logoEntryDuration = 30; // Frames
  const headlineEntryStart = 20;
  const mockupEntryStart = 40;
  const mockupEntryDuration = 30; // Frames
  const mockupRotateDuration = 40; // Frames

  const mockupExitStart = 90;
  const mockupExitDuration = 20; // Frames
  const headlineExitStart = mockupExitStart + 7;
  const logoExitStart = headlineExitStart + 7;
  const logoExitDuration = 20; // Frames

  // --- Logo Animations ---
  const logoEntryScale = spring({
    frame: frame - logoEntryStart,
    fps,
    config: { damping: 8, stiffness: 100 }, // Slight bounce
  });
  const logoExitTranslateY = interpolate(
    frame,
    [logoExitStart, logoExitStart + logoExitDuration],
    [0, height * 0.5], // Slide down by half screen height
    { extrapolateRight: 'clamp' }
  );
  const logoExitOpacity = interpolate(
    frame,
    [logoExitStart, logoExitStart + logoExitDuration],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  // --- Mockup Animations (combined entry, hold, and exit) ---
  const mockupFinalOffsetX = 200; // Final X offset from center
  const mockupFinalOffsetY = -100; // Final Y offset from center

  const mockupCurrentX = interpolate(
    frame,
    [mockupEntryStart, mockupEntryStart + mockupEntryDuration],
    [width * 0.5, mockupFinalOffsetX], // Start from right edge (relative to center), move to final offset
    { extrapolateRight: 'clamp' }
  );

  const mockupCurrentY = interpolate(
    frame,
    [mockupEntryStart, mockupEntryStart + mockupEntryDuration, mockupExitStart, mockupExitStart + mockupExitDuration],
    [height * 0.5, mockupFinalOffsetY, mockupFinalOffsetY, height * 0.5], // Enter from bottom, stay, then exit downwards
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const mockupCombinedOpacity = interpolate(
    frame,
    [mockupEntryStart, mockupEntryStart + 10, mockupExitStart, mockupExitStart + mockupExitDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#E0F7FA' }}>
      <Background layers={[{ type: 'solid', color: '#E0F7FA' }]} />

      {/* FlowPilot Logo - Custom element */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${logoEntryScale}) translateY(${logoExitTranslateY}px)`,
          opacity: logoExitOpacity,
          fontSize: 80,
          fontWeight: 800,
          color: '#263238', // Dark blue/grey
          fontFamily: 'sans-serif', // Modern font
          zIndex: 3, // Ensure logo is on top
        }}
      >
        FlowPilot
      </div>

      {/* Intro Headline */}
      <AnimatedText
        text="Meet FlowPilot: Your AI Project Co-Pilot"
        preset="typewriter"
        animationUnit="character"
        stagger={1.2}
        startFrame={headlineEntryStart}
        anchor="center"
        offsetY={120} // Relative to anchor
        fontSize={56}
        fontWeight={600}
        color="#263238" // Dark blue/grey
        exit={{
          startFrame: headlineExitStart,
          opacity: { from: 1, to: 0, duration: mockupExitDuration },
          position: { fromY: 0, toY: height * 0.3, duration: mockupExitDuration } // Slide down
        }}
      />

      {/* Browser Mockup */}
      <MockupFrame
        type="browser"
        width={width * 0.6} // 60% of video width
        height={height * 0.6} // 60% of video height
        browserConfig={{ url: "FlowPilot - Dashboard", title: "FlowPilot - Dashboard" }}
        glass={true}
        theme="light"
        rotate={{
          startAngle: { x: 15, y: -20 }, // Initial slight rotation
          endAngle: { x: 0, y: 0 },    // Ends flat
          startFrame: mockupEntryStart, // Absolute frame for rotation start
          endFrame: mockupEntryStart + mockupRotateDuration, // Absolute frame for rotation end
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          // Use calculated offsets for transform
          transform: `translate(calc(-50% + ${mockupCurrentX}px), calc(-50% + ${mockupCurrentY}px))`,
          opacity: mockupCombinedOpacity,
          zIndex: 2, // Below logo
        }}
      >
         {/* Content area: pristine white, empty canvas */}
        <div style={{ backgroundColor: 'white', flex: 1, borderRadius: 8, overflow: 'hidden' }}>
        </div>
      </MockupFrame>
    </AbsoluteFill>
  );
};
