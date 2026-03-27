import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

interface AnimatedTextProps {
  text: string;
  startFrame: number;
  type: "word" | "line";
  style: React.CSSProperties;
  exitFrame: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  startFrame,
  type,
  style,
  exitFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split by words or treat as a single line
  const items = type === "word" ? text.split(" ") : [text];

  // Global exit for the entire block
  const exitProgress = spring({
    frame: frame - exitFrame,
    fps,
    config: { damping: 200, mass: 1 },
  });

  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitTranslateY = interpolate(exitProgress, [0, 1], [0, 20]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: type === "word" ? "0.3em" : 0,
        justifyContent: "center",
        opacity: exitOpacity,
        transform: `translateY(${exitTranslateY}px)`,
      }}
    >
      {items.map((item, i) => {
        const delay = startFrame + i * 4; // Stagger words by 4 frames
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 200 }, // Smooth reveal
        });

        const translateY = interpolate(progress, [0, 1], [100, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        return (
          <div key={i} style={{ overflow: "hidden", paddingBottom: "0.1em" }}>
            <div
              style={{
                ...style,
                transform: `translateY(${translateY}%)`,
                opacity,
                display: "inline-block",
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const SceneHook: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F7F7F5",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px",
      }}
    >
      <AnimatedText
        text="Your wiki, docs, & projects."
        startFrame={0}
        type="word"
        exitFrame={73} // Subtitle exits first, then main heading (stagger 3)
        style={{
          fontSize: "80px",
          fontWeight: 700,
          color: "#37352F",
          lineHeight: 1.1,
          margin: 0,
        }}
      />
      <div style={{ height: "30px" }} />
      <AnimatedText
        text="Together at last."
        startFrame={25}
        type="line"
        exitFrame={70} // Exits first
        style={{
          fontSize: "48px",
          fontWeight: 500,
          color: "#6C6C6C",
          lineHeight: 1.2,
          margin: 0,
        }}
      />
    </AbsoluteFill>
  );
};
