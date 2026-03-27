import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const CleanTestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Background preset="deepPurpleAurora" />
      <AnimatedText
        text="Integration Test"
        preset="fadeBlurIn"
        anchor="center"
        fontSize={72}
        color="#ffffff"
      />
    </AbsoluteFill>
  );
};
