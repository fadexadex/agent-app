import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MotionContainer } from '@/components/Layout';

interface DataFlowAnimatorProps {
  startFrame: number;
  durationFrames: number;
}

const DataFlowAnimator: React.FC<DataFlowAnimatorProps> = ({ startFrame, durationFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const scale = interpolate(entrance, [0, 1], [0.5, 1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(entrance, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // Subtle glow animation for the border
  const glowIntensity = interpolate(
    frame,
    [startFrame, startFrame + durationFrames / 2, startFrame + durationFrames],
    [0.1, 0.3, 0.1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        width: 700,
        height: 400,
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '2px solid rgba(120,120,255,0.3)',
        borderRadius: 20,
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity: opacity,
        boxShadow: `0 0 20px rgba(120,120,255,${glowIntensity})`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // To contain internal animations if added later
      }}
    >
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 24 }}>
        Data Flow Animation Placeholder
      </div>
      {/* Could add more complex internal animations here later */}
    </div>
  );
};


interface FeaturePillProps {
  text: string;
  startFrame: number;
}

const FeaturePill: React.FC<FeaturePillProps> = ({ text, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200, stiffness: 100 },
  });

  const scale = interpolate(entrance, [0, 1], [0.8, 1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(entrance, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(entrance, [0,1], [20,0], { extrapolateRight: 'clamp' });


  return (
    <div
      style={{
        position: 'absolute',
        width: 250,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24, // Half of height for rounded ends
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        left: '50%',
        top: '50%', // Adjusted later
        transform: `translate(-50%, -50%) scale(${scale}) translateY(${translateY}px)`,
        opacity: opacity,
      }}
    >
      <AnimatedText
        text={text}
        preset="typewriter"
        animationUnit="character"
        stagger={1} // Corresponds to speed: 1 in spec
        startFrame={0} // Relative to pill's own sequence
        fontSize={20}
        fontWeight={600}
        color="#333333"
        anchor="center" // Center within the pill
        offsetY={0} // No vertical offset needed for centering
        offsetX={0} // No horizontal offset needed for centering
      />
    </div>
  );
};


export const IntroShopifySimplified: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const durationFrames = 120; // As per scene spec

  // Adjust positioning for elements
  const titleY = 80;
  const dataFlowAnimatorY = height / 2 - 50; // Center, slightly up
  const featurePillY = dataFlowAnimatorY + 400 / 2 + 30; // Below DataFlowAnimator

  return (
    <AbsoluteFill style={{ backgroundColor: '#F0F2F5' }}>
      <Background layers={[{ type: 'solid', color: '#F0F2F5' }]} />

      {/* Intro Title */}
      <Sequence from={0} durationInFrames={durationFrames}>
        <AnimatedText
          text="Your Shopify Data, Simplified."
          preset="typewriter"
          animationUnit="character"
          stagger={1.5} // Speed 1.5 chars/frame
          startFrame={10}
          anchor="top-center"
          offsetY={titleY}
          fontSize={56}
          fontWeight={600}
          color="#333333"
        />
      </Sequence>

      {/* Data Flow Animation */}
      <Sequence from={25} durationInFrames={durationFrames - 25}>
         <DataFlowAnimator startFrame={0} durationFrames={durationFrames - 25} />
      </Sequence>


      {/* Feature Pill */}
      <Sequence from={50} durationInFrames={durationFrames - 50}>
        <div style={{
            position: 'absolute',
            left: '50%',
            top: featurePillY,
            transform: 'translate(-50%, -50%)'
        }}>
            <FeaturePill text="Connects to Shopify" startFrame={0} />
        </div>
      </Sequence>

    </AbsoluteFill>
  );
};
