import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

interface SceneProps {}

export const HookRemoteChaos: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background gradient colors
  const backgroundColors = ["#2C3E50", "#4CA1AF"];

  // Main Headline animation timing
  const mainHeadlineExitStart = 90;
  const mainHeadlineExitDuration = 20;

  // Chaos Icons animation timing
  const chaosIconsEntryStart = 10;
  const chaosIconsEntryDuration = 20;
  const chaosIconsExitStart = 93;
  const chaosIconsExitDuration = 20;
  const chaosIconsActiveDuration = chaosIconsExitStart - chaosIconsEntryStart + chaosIconsExitDuration;

  // Overall opacity for the chaos icons group
  const chaosIconsGroupOpacity = interpolate(
    frame,
    [chaosIconsEntryStart, chaosIconsEntryStart + chaosIconsEntryDuration, chaosIconsExitStart, chaosIconsExitStart + chaosIconsExitDuration],
    [0, 0.7, 0.7, 0], // Fades in to 0.7, stays, then fades out
    { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
  );

  // Subtitle animation timing
  const subtitleEntryStart = 40;
  const subtitleExitStart = 96;
  const subtitleExitDuration = 20;

  // Chaos icon configurations (for individual divs)
  const iconConfigs = [
    { color: '#E74C3C', initialOffsetX: -100, initialOffsetY: -50, scale: 0.8 }, // Email
    { color: '#3498DB', initialOffsetX: 50, initialOffsetY: -80, scale: 0.9 }, // Chat
    { color: '#2ECC71', initialOffsetX: -30, initialOffsetY: 70, scale: 0.7 }, // Calendar
    { color: '#F1C40F', initialOffsetX: 80, initialOffsetY: 30, scale: 1.0 }, // Task List
    { color: '#9B59B6', initialOffsetX: -120, initialOffsetY: 80, scale: 0.6 }, // Cloud storage
    { color: '#FF5733', initialOffsetX: 10, initialOffsetY: -120, scale: 0.75 }, // Document
    { color: '#C70039', initialOffsetX: -80, initialOffsetY: 10, scale: 0.85 }, // Project tool
  ];

  return (
    <AbsoluteFill>
      <Background
        layers={[
          {
            type: "linear",
            colors: backgroundColors,
            angle: 45 // Mimics a diagonal preset
          }
        ]}
      />

      {/* Chaos Icons Layer - positioned centrally with overall opacity control */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: chaosIconsGroupOpacity }}>
        {iconConfigs.map((config, index) => {
          const delay = index * 5; // Stagger initial movement
          const iconLocalFrame = frame - chaosIconsEntryStart - delay;

          // Rotation animation throughout the active period
          const rotate = interpolate(
            iconLocalFrame,
            [0, chaosIconsActiveDuration],
            [0, 360 * (index % 2 === 0 ? 1 : -1)], // Alternate rotation direction for variety
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Chaotic movement animation within its active period
          const chaoticX = interpolate(
            iconLocalFrame,
            [0, chaosIconsActiveDuration * 0.25, chaosIconsActiveDuration * 0.5, chaosIconsActiveDuration * 0.75, chaosIconsActiveDuration],
            [config.initialOffsetX, config.initialOffsetX + 20, config.initialOffsetX - 10, config.initialOffsetX + 30, config.initialOffsetX],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const chaoticY = interpolate(
            iconLocalFrame,
            [0, chaosIconsActiveDuration * 0.25, chaosIconsActiveDuration * 0.5, chaosIconsActiveDuration * 0.75, chaosIconsActiveDuration],
            [config.initialOffsetY, config.initialOffsetY + 15, config.initialOffsetY - 25, config.initialOffsetY + 10, config.initialOffsetY],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: 60 * config.scale,
                height: 60 * config.scale,
                backgroundColor: config.color,
                borderRadius: 15, // Soft-edged icon representation
                opacity: 0.7, // Individual icon opacity (within the group's overall opacity)
                transform: `translate(${chaoticX}px, ${chaoticY}px) rotate(${rotate}deg)`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Main Headline */}
      <AnimatedText
        text="Overwhelmed by remote project chaos?"
        preset="typewriter"
        animationUnit="character"
        stagger={1} // Corresponds to typewriter speed 1
        startFrame={0}
        anchor="center"
        offsetY={-60}
        fontSize={64}
        fontWeight={700}
        color="#FFFFFF"
        exit={{
          startFrame: mainHeadlineExitStart,
          opacity: { from: 1, to: 0, duration: mainHeadlineExitDuration },
          blur: { from: 0, to: 10, duration: mainHeadlineExitDuration }
        }}
      />

      {/* Subtitle */}
      <AnimatedText
        text="You're not alone."
        preset="typewriter"
        animationUnit="character"
        stagger={1} // Corresponds to typewriter speed 1
        startFrame={subtitleEntryStart}
        anchor="center"
        offsetY={80}
        fontSize={40}
        fontWeight={500}
        color="#FFFFFF"
        exit={{
          startFrame: subtitleExitStart,
          opacity: { from: 1, to: 0, duration: subtitleExitDuration },
          blur: { from: 0, to: 8, duration: subtitleExitDuration }
        }}
      />
    </AbsoluteFill>
  );
};