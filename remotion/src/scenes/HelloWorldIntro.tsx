import { AbsoluteFill } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';

export const HelloWorldIntro: React.FC = () => {


  return (
    <AbsoluteFill>
      {/* Dark gradient background */}
      <Background preset="darkElegance" />
      
      {/* Hello World text with fade blur in animation */}
      <AnimatedText
        text="Hello World"
        preset="fadeBlurIn"
        anchor="center"
        fontSize={72}
        fontWeight={600}
        color="#ffffff"
        delay={0}
      />
    </AbsoluteFill>
  );
};