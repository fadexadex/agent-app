
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import { CameraRig } from '@/components/Camera';
import React from 'react';

// Custom VoiceIndicatorPill Component
const VoiceIndicatorPill: React.FC<{ startFrame: number; exitStartFrame: number }> = ({ startFrame, exitStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(
    entranceProgress,
    [0, 1],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const exitOpacity = interpolate(
    exitProgress,
    [0, 1],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  const scale = interpolate(
    entranceProgress,
    [0, 1],
    [0.5, 1],
    { extrapolateRight: 'clamp' }
  );

  const exitScale = interpolate(
    exitProgress,
    [0, 1],
    [1, 0.5],
    { extrapolateRight: 'clamp' }
  );

  if (frame < startFrame || frame > exitStartFrame + 30) { // Add some buffer for exit animation
    return null;
  }

  const currentOpacity = opacity * exitOpacity;
  const currentScale = scale * exitScale;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${currentScale})`,
        opacity: currentOpacity,
        backgroundColor: "#333",
        borderRadius: 9999,
        padding: "10px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 250,
        height: 50,
        zIndex: 20
      }}
    >
      <AnimatedText
        text="AI Analyzing..."
        fontSize={28}
        color="white"
        startFrame={startFrame + 5} // Stagger text entry slightly
        anchor="center"
        preset="fadeBlurIn"
      />
    </div>
  );
};

// Custom FeaturePill Component
const FeaturePill: React.FC<{ startFrame: number; exitStartFrame: number }> = ({ startFrame, exitStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(
    entranceProgress,
    [0, 1],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const exitOpacity = interpolate(
    exitProgress,
    [0, 1],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    entranceProgress,
    [0, 1],
    [50, 0],
    { extrapolateRight: 'clamp' }
  );

  const exitTranslateY = interpolate(
    exitProgress,
    [0, 1],
    [0, 50],
    { extrapolateRight: 'clamp' }
  );

  if (frame < startFrame || frame > exitStartFrame + 30) {
    return null;
  }

  const currentOpacity = opacity * exitOpacity;
  const currentTranslateY = translateY + exitTranslateY;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, calc(-50% + 180px + ${currentTranslateY}px))`,
        opacity: currentOpacity,
        backgroundColor: "#1E88E5",
        borderRadius: 9999,
        padding: "10px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 300,
        height: 55,
        zIndex: 20
      }}
    >
      <AnimatedText
        text="Smart Task Prioritization"
        fontSize={32}
        color="white"
        startFrame={startFrame + 5} // Stagger text entry slightly
        anchor="center"
        preset="slideInUp"
      />
    </div>
  );
};


export const FeatureAiPrioritization: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timing
  const unsortedTasksExitStart = 50;
  const aiPillExitStart = 65;
  const sortedTasksEntryStart = 70;
  const featureLabelEntryStart = 80;

  const featureLabelExitStart = 110;
  const sortedTasksExitStart = 113; // Staggered by 3 frames

  // Camera Zoom for scene transition
  const zoomEndFrame = 135;
  const zoomStartFrame = zoomEndFrame - 15;
  const cameraZoom = interpolate(frame, [zoomStartFrame, zoomEndFrame], [1, 0.95], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      <Background layers={[{ type: 'solid', color: '#FFFFFF' }]} />

      <CameraRig zoom={cameraZoom}>
        {/* Unsorted Tasks Mockup */}
        {frame < unsortedTasksExitStart + 30 && ( // Keep mounted for exit animation
          <MotionContainer
            initial="scale-zero"
            duration={20}
            exit="fade-out"
            exitStartFrame={unsortedTasksExitStart}
          >
            <MockupFrame
              type="card"
              width={600}
              height={350}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
              glass={{ blur: 10, opacity: 0.1 }}
              glare
              theme="light"
            >
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatedText
                  text="Unsorted Task List"
                  fontSize={36}
                  fontWeight={600}
                  color="#333"
                  startFrame={0}
                  preset="fadeBlurIn"
                />
                <AnimatedText
                  text="Design UI [Medium]"
                  fontSize={28}
                  color="#555"
                  startFrame={10}
                  preset="slideInRight"
                />
                <AnimatedText
                  text="Write Copy [Medium]"
                  fontSize={28}
                  color="#555"
                  startFrame={15}
                  preset="slideInRight"
                />
                <AnimatedText
                  text="Develop Backend [Medium]"
                  fontSize={28}
                  color="#555"
                  startFrame={20}
                  preset="slideInRight"
                />
                <AnimatedText
                  text="Marketing Campaign [Medium]"
                  fontSize={28}
                  color="#555"
                  startFrame={25}
                  preset="slideInRight"
                />
              </div>
            </MockupFrame>
          </MotionContainer>
        )}

        {/* AI Analyzing Pill */}
        <VoiceIndicatorPill startFrame={30} exitStartFrame={aiPillExitStart} />

        {/* Sorted Tasks Mockup */}
        {frame >= sortedTasksEntryStart && (
          <MotionContainer
            initial="scale-zero"
            delay={sortedTasksEntryStart - sortedTasksEntryStart} // delay relative to its own appearance
            duration={20}
            exit="fade-out"
            exitStartFrame={sortedTasksExitStart}
          >
            <MockupFrame
              type="card"
              width={600}
              height={350}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
              glass={{ blur: 10, opacity: 0.1 }}
              glare
              theme="light"
            >
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatedText
                  text="Sorted Task List by AI Priority"
                  fontSize={36}
                  fontWeight={600}
                  color="#333"
                  startFrame={sortedTasksEntryStart + 5}
                  preset="fadeBlurIn"
                />
                <AnimatedText
                  text="Develop Backend [High Priority]"
                  fontSize={28}
                  color="#E53935" // Red for high
                  startFrame={sortedTasksEntryStart + 15}
                  preset="slideInRight"
                />
                <AnimatedText
                  text="Design UI [Medium Priority]"
                  fontSize={28}
                  color="#FFB300" // Orange for medium
                  startFrame={sortedTasksEntryStart + 20}
                  preset="slideInRight"
                />
                <AnimatedText
                  text="Write Copy [Low Priority]"
                  fontSize={28}
                  color="#4CAF50" // Green for low
                  startFrame={sortedTasksEntryStart + 25}
                  preset="slideInRight"
                />
                <AnimatedText
                  text="Marketing Campaign [Deferred]"
                  fontSize={28}
                  color="#757575" // Grey for deferred
                  startFrame={sortedTasksEntryStart + 30}
                  preset="slideInRight"
                />
              </div>
            </MockupFrame>
          </MotionContainer>
        )}

        {/* Smart Task Prioritization Label */}
        <FeaturePill startFrame={featureLabelEntryStart} exitStartFrame={featureLabelExitStart} />

      </CameraRig>
    </AbsoluteFill>
  );
};
