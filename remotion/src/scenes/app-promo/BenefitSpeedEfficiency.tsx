import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

// Placeholder for SpeedometerGraphic
interface SpeedometerGraphicProps {
  startFrame: number;
  exitStartFrame: number;
}
const SpeedometerGraphic: React.FC<SpeedometerGraphicProps> = ({ startFrame, exitStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const containerScale = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  // Needle animation (0 to 180 degrees)
  const needleAnimationStartDelay = 15; // Start needle animation slightly after container appears
  const needleRotationProgress = spring({
    frame: frame - (startFrame + needleAnimationStartDelay),
    fps,
    config: { damping: 10, stiffness: 100 },
  });
  const needleRotation = interpolate(needleRotationProgress, [0, 1], [0, 180], { extrapolateRight: 'clamp' });

  // Exit animation
  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200 },
  });
  const opacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
  const scale = interpolate(exitProgress, [0, 1], [1, 0.5], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'relative',
        width: 300,
        height: 150, // Half circle
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: '150px 150px 0 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        overflow: 'hidden',
        transform: `scale(${containerScale * scale})`,
        opacity: opacity,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      }}
    >
        {/* Gauge markings - simplified */}
        <div style={{
            position: 'absolute',
            bottom: 10,
            width: 280,
            height: 140,
            borderRadius: '140px 140px 0 0',
            border: '2px solid #aaa',
            borderBottom: 'none',
        }} />
        {/* Needle */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            width: 6,
            height: 120,
            backgroundColor: '#FF0000',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${needleRotation - 90}deg)`, // Start at -90, sweep to +90 (total 180)
            borderRadius: 3,
            zIndex: 10,
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#FF0000',
          zIndex: 11
        }} />
        <span style={{ position: 'absolute', bottom: 30, right: 30, color: '#2C3E50', fontWeight: 600 }}>5X</span>
        <span style={{ position: 'absolute', bottom: 30, left: 30, color: '#2C3E50', fontWeight: 600 }}>0X</span>
    </div>
  );
};

// Placeholder for TimeSavedChart
interface TimeSavedChartProps {
  startFrame: number;
  exitStartFrame: number;
}
const TimeSavedChart: React.FC<TimeSavedChartProps> = ({ startFrame, exitStartFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerScale = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
  });

  const barGrowthStartDelay = 15;
  const barGrowth = spring({
    frame: frame - (startFrame + barGrowthStartDelay),
    fps,
    config: { damping: 100, stiffness: 100 },
  });

  const manualHeight = interpolate(barGrowth, [0, 1], [0, 150], { extrapolateRight: 'clamp' });
  const aiHeight = interpolate(barGrowth, [0, 1], [0, 75], { extrapolateRight: 'clamp' });

  // Exit animation
  const exitProgress = spring({
    frame: frame - exitStartFrame,
    fps,
    config: { damping: 200 },
  });
  const opacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
  const scale = interpolate(exitProgress, [0, 1], [1, 0.5], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'relative',
        width: 400,
        height: 200,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 15,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        padding: 20,
        boxSizing: 'border-box',
        transform: `scale(${containerScale * scale})`,
        opacity: opacity,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 80, height: manualHeight, backgroundColor: '#E74C3C', borderRadius: 5, transition: 'height 0.3s' }} />
        <span style={{ marginTop: 10, color: '#2C3E50', fontSize: 20, fontWeight: 500 }}>Manual Coding</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 80, height: aiHeight, backgroundColor: '#2ECC71', borderRadius: 5, transition: 'height 0.3s' }} />
        <span style={{ marginTop: 10, color: '#2C3E50', fontSize: 20, fontWeight: 500 }}>DevFlow AI</span>
      </div>
    </div>
  );
};

export const BenefitSpeedEfficiency: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate exit frames for individual elements based on the overall scene blur starting at 115.
  // Exit order: smaller text, chart, speedometer, main text. Stagger 3 frames.
  // Individual exit animation duration: 15 frames.
  const individualExitDuration = 15;
  const overallSceneExitStartFrame = 135 - 20; // Scene blur starts at 115

  const mainTextExitStartFrame = overallSceneExitStartFrame - individualExitDuration; // 115 - 15 = 100
  const speedometerExitStartFrame = mainTextExitStartFrame - 3; // 97
  const chartExitStartFrame = speedometerExitStartFrame - 3; // 94
  const smallerTextExitStartFrame = chartExitStartFrame - 3; // 91

  // Speedometer Graphic Entry Timing
  const speedometerEntryStartFrame = 40;
  // Time Saved Chart Entry Timing
  const chartEntryStartFrame = 70;


  // Scene-wide blur and opacity exit
  const sceneBlur = interpolate(frame, [overallSceneExitStartFrame, 135], [0, 10], {
    extrapolateRight: 'clamp',
  });
  const sceneOpacity = interpolate(frame, [overallSceneExitStartFrame, 135], [1, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ filter: `blur(${sceneBlur}px)`, opacity: sceneOpacity }}>
      <Background type="noise" color="#E0E7FF" preset="subtleBlueNoise" animated />

      {/* "Deliver projects 5x faster." (speed-statement) */}
      <AnimatedText
        text="Deliver projects 5x faster."
        preset="typewriter"
        animationUnit="character"
        stagger={0.6} // typewriter speed interpretation: 1.5 chars/frame -> stagger 1/1.5 = 0.66
        startFrame={10}
        anchor="center"
        offsetY={-120}
        fontSize={56}
        fontWeight={600}
        color="#2C3E50"
        exit={{
          startFrame: mainTextExitStartFrame,
          opacity: { from: 1, to: 0, duration: individualExitDuration },
          scale: { from: 1, to: 0.8, duration: individualExitDuration },
        }}
      />

      {/* Speedometer Graphic Placeholder */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: -20 }}>
        <SpeedometerGraphic
          startFrame={speedometerEntryStartFrame}
          exitStartFrame={speedometerExitStartFrame}
        />
      </div>

      {/* Time Saved Chart Placeholder */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: 130 }}>
        <TimeSavedChart
          startFrame={chartEntryStartFrame}
          exitStartFrame={chartExitStartFrame}
        />
      </div>

      {/* "Focus on innovation, not busywork." (focus-statement) */}
      <AnimatedText
        text="Focus on innovation, not busywork."
        preset="typewriter"
        animationUnit="character"
        stagger={0.6}
        startFrame={90}
        anchor="center"
        offsetY={250}
        fontSize={32}
        color="#2C3E50"
        exit={{
          startFrame: smallerTextExitStartFrame,
          opacity: { from: 1, to: 0, duration: individualExitDuration },
          scale: { from: 1, to: 0.8, duration: individualExitDuration },
        }}
      />
    </AbsoluteFill>
  );
};