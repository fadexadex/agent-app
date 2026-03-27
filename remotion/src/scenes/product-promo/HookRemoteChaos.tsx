import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

interface ChaosIconProps {
  icon: string;
  delay: number;
  initialX: number;
  initialY: number;
  rotationSpeed: number;
  size: number;
}

const ChaosIcon: React.FC<ChaosIconProps> = ({ icon, delay, initialX, initialY, rotationSpeed, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const xOffset = interpolate(
    frame - delay,
    [0, 120], // Scene duration
    [initialX, initialX + Math.sin((frame - delay) * 0.05 + delay) * 40 - 20], // Swirling motion
    { extrapolateRight: 'clamp' }
  );
  const yOffset = interpolate(
    frame - delay,
    [0, 120], // Scene duration
    [initialY, initialY + Math.cos((frame - delay) * 0.07 + delay) * 40 + 20], // Swirling motion
    { extrapolateRight: 'clamp' }
  );
  const rotation = interpolate(
    frame - delay,
    [0, 120], // Scene duration
    [0, 360 * rotationSpeed], // Continuous rotation
    { extrapolateRight: 'clamp' }
  );
  const opacity = interpolate(
    frame - delay,
    [0, 30],
    [0, 0.7],
    { extrapolateRight: 'clamp' }
  );
  const scale = interpolate(
    entranceProgress,
    [0, 1],
    [0.5, 1], // Start smaller, grow to full size
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(${xOffset}px, ${yOffset}px) scale(${scale}) rotate(${rotation}deg)`,
        opacity: opacity,
        width: size,
        height: size,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
        borderRadius: 10,
        border: `1px solid rgba(255, 255, 255, ${opacity * 0.2})`,
        color: 'white',
        fontSize: size * 0.6,
        fontWeight: 'bold',
        textShadow: '0px 0px 8px rgba(255,255,255,0.3)',
      }}
    >
      {icon}
    </div>
  );
};


export const HookRemoteChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const iconsData = [
    { icon: '✉️', delay: 10, initialX: -100, initialY: -120, rotationSpeed: 0.2, size: 70 },
    { icon: '💬', delay: 20, initialX: 80, initialY: -80, rotationSpeed: -0.3, size: 60 },
    { icon: '📅', delay: 30, initialX: -150, initialY: 50, rotationSpeed: 0.25, size: 65 },
    { icon: '✅', delay: 40, initialX: 50, initialY: 100, rotationSpeed: -0.2, size: 75 },
    { icon: '🔗', delay: 15, initialX: 180, initialY: -20, rotationSpeed: 0.15, size: 55 },
    { icon: '📁', delay: 25, initialX: -70, initialY: 170, rotationSpeed: -0.1, size: 80 },
    { icon: '📊', delay: 35, initialX: -200, initialY: -50, rotationSpeed: 0.1, size: 68 },
    { icon: '⚙️', delay: 45, initialX: 120, initialY: 150, rotationSpeed: -0.25, size: 72 },
  ];

  return (
    <AbsoluteFill>
      <Background
        layers={[
          {
            type: 'linear',
            colors: ['#2C3E50', '#4CA1AF'],
            angle: 45, // Diagonal gradient
          },
        ]}
      />

      {iconsData.map((data, index) => (
        <ChaosIcon key={index} {...data} />
      ))}

      <AnimatedText
        text="Overwhelmed by remote project chaos?"
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={0}
        anchor="center"
        offsetY={-60}
        fontSize={64}
        fontWeight={700}
        color="#FFFFFF"
      />

      <AnimatedText
        text="You're not alone."
        preset="typewriter"
        animationUnit="character"
        stagger={1}
        startFrame={40}
        anchor="center"
        offsetY={80}
        fontSize={40}
        fontWeight={500}
        color="#FFFFFF"
      />
    </AbsoluteFill>
  );
};