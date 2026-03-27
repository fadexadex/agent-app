import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const IntroProductIntroduction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Background */}
      <Background layers={[{ type: 'solid', color: '#533AFD' }]} />

      {/* Dashboard Icon */}
      <AnimatedText
        text="📊"
        preset="scaleUp"
        startFrame={0}
        animationUnit="full"
        anchor="center"
        fontSize={150} // Approximate 150x150px for an emoji
        color="#FFFFFF"
        fontWeight={700}
      />

      {/* Intro Title */}
      <AnimatedText
        text="Introducing Stripe Analytics:"
        preset="typewriter"
        startFrame={10}
        animationUnit="character"
        stagger={1} // Default stagger for typewriter is fine
        anchor="center"
        offsetY={-80}
        fontSize={56}
        fontWeight={600}
        color="#FFFFFF"
      />

      {/* Intro Subtitle */}
      <AnimatedText
        text="Your Growth Engine for Shopify."
        preset="typewriter"
        startFrame={30}
        animationUnit="character"
        stagger={1} // Default stagger for typewriter is fine
        anchor="center"
        offsetY={0}
        fontSize={36}
        fontWeight={400}
        color="#FFFFFF"
      />
    </AbsoluteFill>
  );
};