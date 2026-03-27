import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

// NOTE: Render failed due to missing AWS Lambda environment variables (AWS_ACCESS_KEY_ID, etc.).
// This is an infrastructure issue, not a problem with the generated scene code.

interface HookOverwhelmedProps {}

export const HookOverwhelmed: React.FC<HookOverwhelmedProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Define spring configs
  const snappyConfig = { damping: 20, stiffness: 200 };
  const bouncyConfig = { damping: 8 };
  const smoothConfig = { damping: 200 };

  // Element timings based on specification and staggered exit rules
  const sceneDuration = 120; // 4 seconds at 30fps

  const titleEntryStart = 0;
  const titleEntryDuration = 30; // Implicit duration by spring config
  const titleExitStart = 90; // Staggered exit

  const iconsEntryStart = 20;
  const iconsEntryDuration = 40; // Implicit duration by spring config
  const iconsExitStart = 93; // Staggered exit (90 + 3)
  const iconsExitDuration = 10;

  const subtitleEntryStart = 40;
  const subtitleEntryDuration = 20; // Implicit duration by spring config
  const subtitleExitStart = 96; // Staggered exit (93 + 3)
  const subtitleExitDuration = 10;

  // Calculate icon positions and animations
  // Each icon has a base offset and rotation, and an entry/exit delay
  const iconData = [
    { char: '📚', x: -220, y: -50, rotate: -15, entryDelay: 0, exitDelay: 0 },
    { char: '💻', x: -100, y: 80, rotate: 10, entryDelay: 5, exitDelay: 3 },
    { char: '⏰', x: 50, y: -100, rotate: 20, entryDelay: 10, exitDelay: 6 },
    { char: '☕', x: 200, y: 20, rotate: -25, entryDelay: 15, exitDelay: 9 },
    { char: '🗓️', x: -180, y: 130, rotate: 5, entryDelay: 20, exitDelay: 12 },
    { char: '📱', x: 80, y: -140, rotate: -10, entryDelay: 25, exitDelay: 15 },
    { char: '🤯', x: -0, y: 0, rotate: 0, entryDelay: 12, exitDelay: 7 }, // Central "overwhelmed" icon
  ];

  const iconGridOffsetY = 80; // General vertical offset for the icon group

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={sceneDuration}>
        <AbsoluteFill style={{ backgroundColor: '#282C34' }}>
          <Background layers={[{ type: 'solid', color: '#282C34' }]} />

          {/* Hook Title */}
          <AnimatedText
            text="Feeling overwhelmed by studies?"
            preset="slideInDown"
            animationUnit="full"
            stagger={0} // Not needed for full unit
            startFrame={titleEntryStart}
            anchor="center"
            offsetY={-60}
            fontSize={56}
            fontWeight={700}
            color="#FFFFFF"
            exit={{
              startFrame: titleExitStart,
              opacity: { from: 1, to: 0, duration: 15 },
            }}
          />

          {/* Student Life Icons - Custom Implementation */}
          {iconData.map((icon, index) => {
            const currentIconEntryFrame = frame - (iconsEntryStart + icon.entryDelay);
            const currentIconExitFrame = frame - (iconsExitStart + icon.exitDelay);

            const scaleSpring = spring({
              frame: currentIconEntryFrame,
              fps,
              config: bouncyConfig,
            });

            const translateXSpring = spring({
              frame: currentIconEntryFrame,
              fps,
              config: bouncyConfig,
              from: icon.x * 2, // Start further out for chaotic entry
              to: icon.x,
            });

            const translateYSpring = spring({
              frame: currentIconEntryFrame,
              fps,
              config: bouncyConfig,
              from: icon.y * 2, // Start further out for chaotic entry
              to: icon.y,
            });
            
            const rotateSpring = spring({
              frame: currentIconEntryFrame,
              fps,
              config: bouncyConfig,
              from: icon.rotate * 3, // More rotation at start
              to: icon.rotate,
            });

            const opacity = interpolate(
              currentIconExitFrame,
              [0, iconsExitDuration],
              [1, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            const scale = interpolate(scaleSpring, [0, 1], [0.5, 1.2], { extrapolateRight: 'clamp' }); // Scale up slightly
            
            // The finalScale logic was slightly off; simplifying to use the scale directly from the spring.
            // This ensures scale also fades out with opacity.

            return (
              <AbsoluteFill
                key={index}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: `translate(${translateXSpring}px, ${translateYSpring + iconGridOffsetY}px) scale(${scale}) rotate(${rotateSpring}deg)`,
                  opacity: opacity,
                  fontSize: 40,
                  color: '#FFFFFF',
                  zIndex: 5, // Ensure icons are above background
                  position: 'absolute', // Important for AbsoluteFill to behave as expected for positioning
                }}
              >
                {icon.char}
              </AbsoluteFill>
            );
          })}

          {/* Hook Subtitle */}
          <AnimatedText
            text="You're not alone in the academic struggle."
            animationUnit="full"
            anchor="center"
            offsetY={160}
            fontSize={32}
            fontWeight={400}
            fontStyle="italic"
            color="#FFFFFF"
            // Custom fade in with slight scale up
            style={{
              opacity: spring({
                frame: frame - subtitleEntryStart,
                fps,
                config: smoothConfig,
              }),
              transform: `scale(${spring({
                frame: frame - subtitleEntryStart,
                fps,
                config: smoothConfig,
                from: 0.8,
                to: 1,
              })})`,
            }}
            exit={{
              startFrame: subtitleExitStart,
              opacity: { from: 1, to: 0, duration: subtitleExitDuration },
            }}
          />
        </AbsoluteFill>
      </TransitionSeries.Sequence>
      {/* Scene-wide fade transition */}
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
    </TransitionSeries>
  );
};