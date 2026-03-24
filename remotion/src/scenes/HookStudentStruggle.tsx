import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "@/components/Global";
import { AnimatedText } from "@/components/AnimatedText";
import { MotionContainer } from "@/components/Layout";

export const HookStudentStruggle: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 30,
      }}
    >
      <Background type="solid" color="#1A1A1A" />
      
      <div 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: 20, 
          zIndex: 1,
          marginTop: -40 
        }}
      >
        <AnimatedText
          text="Lost on campus?"
          preset="typewriter"
          startFrame={10}
          fontSize={64}
          fontWeight={700}
          color="#FFFFFF"
          exit={{
            startFrame: 70,
            opacity: { from: 1, to: 0, duration: 15 },
            blur: { from: 0, to: 10, duration: 15 },
          }}
        />
        
        <AnimatedText
          text="Overwhelmed by deadlines?"
          preset="typewriter"
          startFrame={30}
          fontSize={48}
          fontWeight={700}
          color="#FFFFFF"
          exit={{
            startFrame: 75,
            opacity: { from: 1, to: 0, duration: 15 },
            blur: { from: 0, to: 10, duration: 15 },
          }}
        />
      </div>

      <MotionContainer
        initial="hidden"
        delay={0}
        duration={30}
        exit="blur-out"
        exitStartFrame={80}
        exitDuration={15}
        style={{ zIndex: 1 }}
      >
        <div 
          style={{ 
            display: "flex", 
            gap: 40, 
            fontSize: 72,
            justifyContent: "center"
          }}
        >
          <span>❓</span>
          <span>📌</span>
          <span>⏰</span>
        </div>
      </MotionContainer>
    </AbsoluteFill>
  );
};
