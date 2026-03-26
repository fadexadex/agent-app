
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { Background } from '@/components/Global';
import { AnimatedText } from '@/components/AnimatedText';
import { MockupFrame } from '@/components/MockupFrame';

interface CtaGetStartedProps {}

export const CtaGetStarted: React.FC<CtaGetStartedProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Define button dimensions
  const buttonWidth = 500;
  const buttonHeight = 100;

  // Calculate the centered position for the MockupFrame
  const ctaButtonTop = (height / 2) + 150 - (buttonHeight / 2); // Center Y + offsetY - half button height

  return (
    <AbsoluteFill>
      <Background type="solid" color="#1976D2" />

      {/* FocusFlow AI Logo */}
      <AnimatedText
        text="FocusFlow AI"
        preset="typewriter"
        animationUnit="character"
        stagger={0} // speed: 0 from spec
        startFrame={0}
        anchor="top-center"
        offsetY={80}
        fontSize={64}
        fontWeight={700}
        color="white"
      />

      {/* CTA URL */}
      <AnimatedText
        text="focusflowai.com"
        preset="typewriter"
        animationUnit="character"
        stagger={2} // speed: 0.5 from spec
        startFrame={30}
        anchor="center"
        offsetY={50}
        fontSize={48}
        fontWeight={600}
        color="white"
      />

      {/* Signup Button MockupFrame */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          top: ctaButtonTop, // Position based on calculated top
          height: buttonHeight, // Fixed height for alignment
        }}
      >
        <MockupFrame
          type="card"
          width={buttonWidth}
          height={buttonHeight}
          glass={false} // No glass effect for a solid button
          glare={false} // No glare for a solid button
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 40px', // Add some internal padding
          }}
        >
          {/* Text inside the button */}
          <AnimatedText
            text="Start Your Free Trial"
            preset="typewriter"
            animationUnit="character"
            stagger={2} // speed: 0.5 from spec
            startFrame={50}
            anchor="center" // Center text within the MockupFrame content area
            fontSize={40}
            fontWeight={700}
            color="#1976D2" // Button text color
          />
        </MockupFrame>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
