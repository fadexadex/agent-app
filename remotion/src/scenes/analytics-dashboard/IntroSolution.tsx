import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { AnimatedText } from "@/components/AnimatedText";
import { Background } from "@/components/Global";

const AnimatedGrowthIcon: React.FC<{ delayOffset: number }> = ({ delayOffset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delayOffset,
    fps,
    config: { damping: 15, stiffness: 150 }
  });

  return (
    <div style={{ transform: `scale(${scale})`, display: "flex", justifyContent: "center" }}>
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100" height="100" rx="24" fill="#FFFFFF" style={{ filter: "drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.05))" }} />
        <line x1="20" y1="75" x2="80" y2="75" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="55" x2="80" y2="55" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
        <line x1="20" y1="35" x2="80" y2="35" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
        <path d="M 25 70 L 45 45 L 60 55 L 80 25" stroke="#10B981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="25" cy="70" r="5" fill="#3B82F6" />
        <circle cx="45" cy="45" r="5" fill="#3B82F6" />
        <circle cx="60" cy="55" r="5" fill="#3B82F6" />
        <circle cx="80" cy="25" r="6" fill="#10B981" />
      </svg>
    </div>
  );
};

export const IntroSolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // All content slides out top starting at frame 115 (135 duration - 20 transition)
  const exitProgress = spring({
    frame: frame - 115,
    fps,
    config: { damping: 20, stiffness: 150 }
  });
  
  const exitTranslateY = interpolate(exitProgress, [0, 1], [0, -1080]);

  return (
    <AbsoluteFill>
      <Background layers={[{ type: "solid", color: "#F0F4F8" }]} />

      <AbsoluteFill style={{ transform: `translateY(${exitTranslateY}px)`, justifyContent: "center", alignItems: "center" }}>
        
        {/* Main Headline */}
        <div style={{ position: "absolute", top: "calc(50% - 60px)", width: "100%", display: "flex", justifyContent: "center" }}>
          <AnimatedText
            text="Unleash Your Shopify Store's Full Potential"
            preset="typewriter"
            animationUnit="character"
            delay={10}
            stagger={1.5}
            fontSize={64}
            fontWeight={800}
            color="#1E3A8A"
          />
        </div>

        {/* Sub Headline */}
        <div style={{ position: "absolute", top: "calc(50% + 20px)", width: "100%", display: "flex", justifyContent: "center" }}>
          <AnimatedText
            text="Meet Analytics Dashboard, your data-driven growth partner."
            preset="typewriter"
            animationUnit="character"
            delay={50}
            stagger={1}
            fontSize={32}
            fontWeight={500}
            color="#64748B"
          />
        </div>

        {/* Growth Icon */}
        <div style={{ position: "absolute", top: "calc(50% + 120px)", width: "100%", display: "flex", justifyContent: "center" }}>
          <AnimatedGrowthIcon delayOffset={70} />
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
