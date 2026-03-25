
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { CallToActionButton } from './CallToActionButton'; // Assuming same folder for now
import { FlowPilotLogoSmall } from './FlowPilotLogoSmall'; // Assuming same folder for now

interface Scene06CtaSignupProps {}

export const Scene06CtaSignup: React.FC<Scene06CtaSignupProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#007BFF' }}>
      <Background layers={[{ type: 'solid', color: '#007BFF' }]} />

      {/* CTA Headline */}
      <AnimatedText
        text="Ready to streamline your projects?"
        preset="typewriter"
        animationUnit="character"
        stagger={1} // Default speed for typewriter is character-based
        startFrame={0}
        anchor="center"
        offsetY={-100}
        fontSize={56}
        fontWeight={600}
        color="white"
      />

      {/* CTA Subtext */}
      <AnimatedText
        text="Start your free trial today."
        preset="typewriter"
        animationUnit="character"
        stagger={1.5} // Slower typewriter as requested by speed 1.5 in spec
        startFrame={20}
        anchor="center"
        offsetY={-20}
        fontSize={36}
        fontWeight={400}
        color="#ADD8E6" // Light blue
      />

      {/* Signup Button */}
      <CallToActionButton text="Sign Up Now" startFrame={40} />

      {/* FlowPilot Logo */}
      <FlowPilotLogoSmall startFrame={60} />

      {/* Website URL */}
      <AnimatedText
        text="flowpilot.com"
        preset="typewriter"
        animationUnit="character"
        stagger={2} // Slower typewriter as requested by speed 2 in spec
        startFrame={50}
        anchor="bottom-right"
        offsetX={-40}
        offsetY={-40}
        fontSize={24}
        fontWeight={400}
        color="#ADD8E6" // Light blue
      />
    </AbsoluteFill>
  );
};
