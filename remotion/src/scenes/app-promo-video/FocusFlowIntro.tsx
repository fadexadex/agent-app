import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';

interface FocusFlowIntroProps {}

export const FocusFlowIntro: React.FC<FocusFlowIntroProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Calculate timing for scene exit (fade out of all content)
  const fadeOutStart = 120 - 15; // Scene duration 120 frames, fade duration 15 frames
  const sceneOpacity = interpolate(frame, [fadeOutStart, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Entry delay for mockup to appear after logo and tagline
  const mockupEntryDelay = 40;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Background */}
      <Background layers={[{ type: 'solid', color: '#F0F2F5' }]} />

      {/* FocusFlow Logo - 'FocusFlow' part */}
      <AnimatedText
        text="FocusFlow"
        preset="scaleUp"
        startFrame={0}
        animationUnit="full"
        fontSize={80}
        fontWeight={700}
        color="#333333"
        anchor="center"
        offsetX={-120} // Adjust manually to align left of center
        offsetY={-120}
        exit={{
          startFrame: 90,
          opacity: { from: 1, to: 0, duration: 15 },
          scale: { from: 1, to: 0.8, duration: 15 },
        }}
      />
      
      {/* FocusFlow Logo - 'AI' part */}
      <AnimatedText
        text="AI"
        preset="fadeBlurIn"
        startFrame={5} // Start slightly after "FocusFlow" for a staggered effect
        animationUnit="full"
        fontSize={80}
        fontWeight={700}
        gradient={{ colors: ['#6366f1', '#a855f7'], angle: 90 }} // Subtle highlight for AI
        anchor="center"
        offsetX={60} // Adjust manually to align right of "FocusFlow"
        offsetY={-120}
        exit={{
          startFrame: 93, // Staggered 3 frames after FocusFlow exit
          opacity: { from: 1, to: 0, duration: 15 },
          scale: { from: 1, to: 0.8, duration: 15 },
        }}
      />

      {/* Intro Tagline */}
      <AnimatedText
        text="Your AI-powered copilot for remote project success."
        preset="typewriter"
        startFrame={30}
        animationUnit="word"
        stagger={2}
        anchor="center"
        offsetY={20}
        fontSize={40}
        fontWeight={500}
        color="#555555" // Darker text for contrast against light background
        exit={{
          startFrame: 96, // Staggered 3 frames after 'AI' exit
          opacity: { from: 1, to: 0, duration: 15 },
          scale: { from: 1, to: 0.8, duration: 15 },
        }}
      />

      {/* Clean Dashboard Mockup */}
      <MockupFrame
        type="browser"
        src={"https://via.placeholder.com/800x450/4B5563/FFFFFF?text=Project+Dashboard"} // Placeholder image for the dashboard
        preset="springIn"
        startFrame={mockupEntryDelay} // Delay for mockup entrance
        anchor="center"
        offsetY={180}
        width={800}
        height={450}
        glass={{ blur: 10, opacity: 0.1 }} // Subtle glass effect
        glare // Screen glare
        exit={{
          startFrame: 99, // Staggered 3 frames after tagline exit
          opacity: { from: 1, to: 0, duration: 15 },
          scale: { from: 1, to: 0.8, duration: 15 },
        }}
      />
    </AbsoluteFill>
  );
};