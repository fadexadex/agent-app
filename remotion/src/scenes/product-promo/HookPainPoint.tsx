import React from "react";
import { AbsoluteFill } from "remotion";
import { AnimatedText } from "@/components/AnimatedText";
import { Background } from "@/components/Global";

export const HookPainPoint: React.FC = () => {
  const exitStartFrame = 120 - 15; // Scene duration 120, fade transition 15 frames

  return (
    <AbsoluteFill>
      <Background
        layers={[
          { type: "radial", colors: ["#1A1A1A", "#333333"] }
        ]}
      />
      <AnimatedText
        text="Struggling to scale your Shopify store?"
        preset="typewriter"
        startFrame={10}
        anchor="center"
        y={-40}
        fontSize={72}
        fontWeight={800}
        color="#FFFFFF"
        stagger={1.5} // speed: 1.5 characters per frame
        exit={{ startFrame: exitStartFrame, opacity: { to: 0 }, blur: { to: 10, duration: 15 } }}
      />
      <AnimatedText
        text="Lost in endless data, not seeing real growth?"
        preset="typewriter"
        startFrame={40}
        anchor="center"
        y={40}
        fontSize={52}
        fontWeight={600}
        color="#FFFFFF"
        stagger={1} // speed: 1 character per frame
        exit={{ startFrame: exitStartFrame, opacity: { to: 0 }, blur: { to: 10, duration: 15 } }}
      />
    </AbsoluteFill>
  );
};
