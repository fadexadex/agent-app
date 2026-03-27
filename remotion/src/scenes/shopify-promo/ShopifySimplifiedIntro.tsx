import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MotionContainer } from '@/components/Layout';

interface ShopifySimplifiedIntroProps {}

export const ShopifySimplifiedIntro: React.FC<ShopifySimplifiedIntroProps> = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Title entrance (handled by AnimatedText preset)
  const titleStartFrame = 10;

  // Data Flow Animation entrance
  const dataFlowStartFrame = 30;
  const dataFlowEntranceProgress = spring({
    frame: frame - dataFlowStartFrame,
    fps,
    config: { damping: 200 },
  });
  const dataFlowScale = interpolate(dataFlowEntranceProgress, [0, 1], [0.8, 1], { extrapolateRight: 'clamp' });
  const dataFlowOpacity = interpolate(dataFlowEntranceProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // Feature Pill entrance
  const featurePillStartFrame = 40;
  const featurePillEntranceProgress = spring({
    frame: frame - featurePillStartFrame,
    fps,
    config: { damping: 200 },
  });
  const featurePillScale = interpolate(featurePillEntranceProgress, [0, 1], [0.8, 1], { extrapolateRight: 'clamp' });
  const featurePillOpacity = interpolate(featurePillEntranceProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // Exit animations
  const exitStartFrame = 90;
  const exitDuration = 20;

  // Title exit (handled by AnimatedText exit prop)
  const titleExitStart = exitStartFrame;

  // Data Flow Animation exit
  const dataFlowExitStart = exitStartFrame + 3;
  const dataFlowExitProgress = spring({
    frame: frame - dataFlowExitStart,
    fps,
    config: { damping: 200 },
  });
  const dataFlowExitScale = interpolate(dataFlowExitProgress, [0, 1], [1, 0.8], { extrapolateRight: 'clamp' });
  const dataFlowExitOpacity = interpolate(dataFlowExitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
  const dataFlowFinalScale = frame < dataFlowExitStart ? dataFlowScale : interpolate(frame, [dataFlowExitStart, dataFlowExitStart + exitDuration], [dataFlowScale, dataFlowExitScale], {extrapolateRight: 'clamp'});
  const dataFlowFinalOpacity = frame < dataFlowExitStart ? dataFlowOpacity : interpolate(frame, [dataFlowExitStart, dataFlowExitStart + exitDuration], [dataFlowOpacity, dataFlowExitOpacity], {extrapolateRight: 'clamp'});

  // Feature Pill exit
  const featurePillExitStart = exitStartFrame + 6;
  const featurePillExitProgress = spring({
    frame: frame - featurePillExitStart,
    fps,
    config: { damping: 200 },
  });
  const featurePillExitScale = interpolate(featurePillExitProgress, [0, 1], [1, 0.8], { extrapolateRight: 'clamp' });
  const featurePillExitOpacity = interpolate(featurePillExitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });
  const featurePillFinalScale = frame < featurePillExitStart ? featurePillScale : interpolate(frame, [featurePillExitStart, featurePillExitStart + exitDuration], [featurePillScale, featurePillExitScale], {extrapolateRight: 'clamp'});
  const featurePillFinalOpacity = frame < featurePillExitStart ? featurePillOpacity : interpolate(frame, [featurePillExitStart, featurePillExitStart + exitDuration], [featurePillOpacity, featurePillExitOpacity], {extrapolateRight: 'clamp'});


  return (
    <AbsoluteFill style={{ backgroundColor: '#F0F2F5' }}>
      <Background layers={[{ type: 'solid', color: '#F0F2F5' }]} />

      {/* Title */}
      <AnimatedText
        text="Your Shopify Data, Simplified."
        preset="typewriter"
        startFrame={titleStartFrame}
        anchor="top-center"
        offsetY={80}
        fontSize={64}
        fontWeight={700}
        color="#333"
        exit={{
          startFrame: titleExitStart,
          opacity: { from: 1, to: 0, duration: exitDuration },
          blur: { from: 0, to: 10, duration: exitDuration },
        }}
      />

      {/* Data Flow Animation (Placeholder) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${dataFlowFinalScale})`,
          opacity: dataFlowFinalOpacity,
          width: 700,
          height: 400,
          backgroundColor: '#E0E5EC',
          borderRadius: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            border: '2px dashed #99A3B5',
            borderRadius: 15,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#606C82',
            fontSize: 24,
            fontWeight: 500,
          }}
        >
          Data Flow Animation Placeholder
          <div
            style={{
              position: 'absolute',
              top: '10%', left: '10%',
              width: 20, height: 20,
              backgroundColor: '#6366F1',
              borderRadius: '50%',
              opacity: interpolate(frame, [dataFlowStartFrame + 10, dataFlowStartFrame + 30], [0, 1], {extrapolateRight: 'clamp'}),
              transform: `translateY(${interpolate(frame, [dataFlowStartFrame + 10, dataFlowStartFrame + 60], [0, 200], {extrapolateRight: 'clamp'})}px) translateX(${interpolate(frame, [dataFlowStartFrame + 10, dataFlowStartFrame + 60], [0, 200], {extrapolateRight: 'clamp'})}px)`
            }}
          />
           <div
            style={{
              position: 'absolute',
              top: '80%', left: '80%',
              width: 20, height: 20,
              backgroundColor: '#EC4899',
              borderRadius: '50%',
              opacity: interpolate(frame, [dataFlowStartFrame + 20, dataFlowStartFrame + 40], [0, 1], {extrapolateRight: 'clamp'}),
              transform: `translateY(${interpolate(frame, [dataFlowStartFrame + 20, dataFlowStartFrame + 70], [0, -200], {extrapolateRight: 'clamp'})}px) translateX(${interpolate(frame, [dataFlowStartFrame + 20, dataFlowStartFrame + 70], [0, -200], {extrapolateRight: 'clamp'})}px)`
            }}
          />
        </div>
      </div>

      {/* Feature Pill (Placeholder) */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: `translateX(-50%) scale(${featurePillFinalScale})`,
          opacity: featurePillFinalOpacity,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: '12px 30px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          color: '#333',
          fontSize: 20,
          fontWeight: 600,
          zIndex: 2,
        }}
      >
        Connects to Shopify
      </div>
    </AbsoluteFill>
  );
};