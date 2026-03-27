
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';

export const Scene04CustomerSegments: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Calculate the approximate duration for AnimatedText typewriter effect
  const headingText = "Understand Your Customers Deeply";
  const headingTypewriterDuration = headingText.length * 2; // Estimate 2 frames per character

  const mockupText = 'New Customers: 60%\nReturning Customers: 40%\nAvg LTV: $250\nSegments: High-Value, Repeat, Engaged';
  const mockupTypewriterDuration = mockupText.split('\n').length * 5; // Estimate 5 frames per line

  const pillText = "Actionable Customer Insights & LTV";
  const pillTypewriterDuration = pillText.length * 2; // Estimate 2 frames per character

  return (
    <AbsoluteFill>
      {/* Background */}
      <Background layers={[{ type: 'solid', color: '#A99DFE' }]} />

      {/* Heading - Appears at frame 0 */}
      <AbsoluteFill style={{
        top: 60,
        height: 'auto',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <AnimatedText
          text={headingText}
          preset="typewriter"
          animationUnit="character"
          stagger={1.5}
          startFrame={0}
          anchor="top-center"
          fontSize={60}
          fontWeight={600}
          color="white"
          exit={{
            startFrame: 115, // Exits last (135 - 20 duration)
            opacity: { from: 1, to: 0, duration: 20 },
            blur: { from: 0, to: 8, duration: 20 },
          }}
        />
      </AbsoluteFill>

      {/* Mockup Frame - Slides in after heading, Types content, exits after pill */}
      <MotionContainer
        initial="offscreen-bottom"
        delay={30} // Mockup entrance starts at frame 30
        duration={30}
        exit="slide-down"
        exitStartFrame={85} // Mockup exit starts at frame 85 (115 - 30 duration)
        style={{
          position: 'absolute',
          top: height / 2,
          left: width / 2,
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
        }}
      >
        <MockupFrame
          type="browser"
          theme="dark"
          width={900} // Estimated size
          height={550}
          browserConfig={{ url: "stripe.com/analytics" }}
          glass={{ blur: 10, opacity: 0.15 }} // Subtle glass effect
          glare
        >
          <AbsoluteFill style={{ padding: 20, backgroundColor: 'white' }}>
            <AnimatedText
              text={mockupText}
              preset="typewriter"
              startFrame={40 - 30} // Relative to MotionContainer's start (40 - 30 = 10)
              animationUnit="line"
              stagger={8} // Slower typing per line
              anchor="top-left"
              offsetX={30}
              offsetY={30}
              fontSize={28}
              color="black"
            />
          </AbsoluteFill>
        </MockupFrame>
      </MotionContainer>


      {/* Feature Pill - Animates in last, exits first */}
      <MotionContainer
        initial="offscreen-bottom"
        delay={70} // Pill entrance starts at frame 70
        duration={30}
        exit="slide-down"
        exitStartFrame={55} // Pill exit starts at frame 55 (85 - 30 duration)
        style={{
          position: 'absolute',
          bottom: 80,
          left: width / 2,
          transform: 'translateX(-50%)',
          zIndex: 20,
        }}
      >
        <div
          style={{
            backgroundColor: '#1A1A1A',
            borderRadius: 9999,
            padding: '12px 30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <AnimatedText
            text={pillText}
            preset="typewriter"
            startFrame={80 - 70} // Relative to MotionContainer's start (80 - 70 = 10)
            animationUnit="character"
            stagger={1}
            fontSize={32}
            fontWeight={500}
            color="white"
          />
        </div>
      </MotionContainer>
    </AbsoluteFill>
  );
};