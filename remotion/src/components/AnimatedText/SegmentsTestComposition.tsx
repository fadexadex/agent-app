/**
 * Test composition for AnimatedText segments and new creative presets.
 * Run: cd remotion && npm run studio
 * Then view SegmentsTest composition.
 *
 * Tests:
 * 1. Spacing Test - VoiceOS style with proper gaps
 * 2. Slide Presets - slideFromRight, slideFromLeft
 * 3. Kinetic Word Reveals - bouncyWordPop, elasticReveal, snappyKinetic
 * 4. Fade/Blur Variants - dreamyFloat, quickFocus, gentleMaterialize
 * 5. Character Effects - waveReveal, cascadeDrop
 * 6. Dramatic Effects - punchIn, riseAndShine
 * 7. Mixed Styles - Icons + highlights + colored words
 * 8. Comparison - Side-by-side old vs new spacing
 */
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AnimatedText } from "./AnimatedText";
import { LayoutGrid } from "./LayoutGrid";

export const SegmentsTestComposition: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        fontFamily: "Golos Text",
      }}
    >
      {/* Test 1: Spacing Test - VoiceOS style with proper gaps */}
      <Sequence from={0} durationInFrames={90}>
        <LayoutGrid anchor="center" direction="column" gap={40} align="center">
          <AnimatedText
            text="Spacing Test (wordGap + iconGap)"
            preset="softFadeIn"
            fontSize={24}
            color="rgba(0,0,0,0.4)"
          />
          <AnimatedText
            segments={[
              { text: "What" },
              { text: "if", color: "#3B82F6" },
              { icon: "circle", color: "#3B82F6" },
              { text: "your" },
              { text: "computer", color: "#EC4899" },
            ]}
            preset="voiceOsReveal"
            fontWeight={600}
            fontSize={64}
            color="#1a1a2e"
            stagger={4}
            wordGap="0.25em"
            iconGap="0.4em"
          />
        </LayoutGrid>
      </Sequence>

      {/* Test 2: Slide Presets */}
      <Sequence from={90} durationInFrames={90}>
        <LayoutGrid anchor="center" direction="column" gap={40} align="center">
          <AnimatedText
            text="Slide Presets"
            preset="softFadeIn"
            fontSize={24}
            color="rgba(0,0,0,0.4)"
          />
          <AnimatedText
            text="Slide from right"
            preset="slideFromRight"
            fontSize={48}
            fontWeight={600}
            color="#1a1a2e"
          />
          <AnimatedText
            text="Slide from left"
            preset="slideFromLeft"
            delay={15}
            fontSize={48}
            fontWeight={600}
            color="#3B82F6"
          />
        </LayoutGrid>
      </Sequence>

      {/* Test 3: Kinetic Word Reveals */}
      <Sequence from={180} durationInFrames={90}>
        <LayoutGrid anchor="center" direction="column" gap={30} align="center">
          <AnimatedText
            text="Kinetic Word Reveals"
            preset="softFadeIn"
            fontSize={24}
            color="rgba(0,0,0,0.4)"
          />
          <AnimatedText
            text="Bouncy word pop"
            preset="bouncyWordPop"
            stagger={6}
            fontSize={40}
            fontWeight={600}
            color="#EC4899"
          />
          <AnimatedText
            text="Elastic reveal"
            preset="elasticReveal"
            delay={10}
            stagger={5}
            fontSize={40}
            fontWeight={600}
            color="#8B5CF6"
          />
          <AnimatedText
            text="Snappy kinetic"
            preset="snappyKinetic"
            delay={20}
            stagger={4}
            fontSize={40}
            fontWeight={600}
            color="#3B82F6"
          />
        </LayoutGrid>
      </Sequence>

      {/* Test 4: Fade/Blur Variants */}
      <Sequence from={270} durationInFrames={90}>
        <LayoutGrid anchor="center" direction="column" gap={30} align="center">
          <AnimatedText
            text="Fade/Blur Variants"
            preset="softFadeIn"
            fontSize={24}
            color="rgba(0,0,0,0.4)"
          />
          <AnimatedText
            text="Dreamy float effect"
            preset="dreamyFloat"
            fontSize={40}
            fontWeight={500}
            color="#1a1a2e"
          />
          <AnimatedText
            text="Quick focus"
            preset="quickFocus"
            delay={15}
            fontSize={40}
            fontWeight={500}
            color="#3B82F6"
          />
          <AnimatedText
            text="Gentle materialize"
            preset="gentleMaterialize"
            delay={25}
            fontSize={40}
            fontWeight={500}
            color="#8B5CF6"
          />
        </LayoutGrid>
      </Sequence>

      {/* Test 5: Character Effects */}
      <Sequence from={360} durationInFrames={90}>
        <LayoutGrid anchor="center" direction="column" gap={40} align="center">
          <AnimatedText
            text="Character Effects"
            preset="softFadeIn"
            fontSize={24}
            color="rgba(0,0,0,0.4)"
          />
          <AnimatedText
            text="WAVE REVEAL"
            preset="waveReveal"
            stagger={2}
            fontSize={56}
            fontWeight={700}
            letterSpacing="0.15em"
            color="#EC4899"
          />
          <AnimatedText
            text="CASCADE DROP"
            preset="cascadeDrop"
            delay={20}
            stagger={2}
            fontSize={56}
            fontWeight={700}
            letterSpacing="0.15em"
            color="#3B82F6"
          />
        </LayoutGrid>
      </Sequence>

      {/* Test 6: Dramatic Effects */}
      <Sequence from={450} durationInFrames={90}>
        <LayoutGrid anchor="center" direction="column" gap={40} align="center">
          <AnimatedText
            text="Dramatic Effects"
            preset="softFadeIn"
            fontSize={24}
            color="rgba(0,0,0,0.4)"
          />
          <AnimatedText
            text="PUNCH IN"
            preset="punchIn"
            fontSize={72}
            fontWeight={800}
            color="#1a1a2e"
          />
          <AnimatedText
            text="Rise and shine"
            preset="riseAndShine"
            delay={20}
            fontSize={48}
            fontWeight={600}
            color="#F59E0B"
          />
        </LayoutGrid>
      </Sequence>

      {/* Test 7: Mixed Styles - Icons + highlights + colored words */}
      <Sequence from={540} durationInFrames={90}>
        <LayoutGrid anchor="center" direction="column" gap={40} align="center">
          <AnimatedText
            text="Mixed Styles Test"
            preset="softFadeIn"
            fontSize={24}
            color="rgba(0,0,0,0.4)"
          />
          <AnimatedText
            segments={[
              { text: "Build" },
              {
                text: "amazing",
                color: "#EC4899",
                fontWeight: 700,
              },
              { text: "products with" },
              {
                text: "AI",
                color: "#8B5CF6",
                highlight: {
                  backgroundColor: "rgba(139, 92, 246, 0.15)",
                  padding: "2px 12px",
                  borderRadius: 6,
                },
              },
              { icon: "sparkle", color: "#F59E0B" },
            ]}
            preset="snappyKinetic"
            fontSize={56}
            fontWeight={500}
            color="#1a1a2e"
            stagger={5}
            wordGap="0.3em"
            iconGap="0.4em"
          />
        </LayoutGrid>
      </Sequence>

      {/* Test 8: Comparison - Side-by-side spacing */}
      <Sequence from={630} durationInFrames={90}>
        <LayoutGrid anchor="center" direction="column" gap={50} align="center">
          <AnimatedText
            text="Spacing Comparison"
            preset="softFadeIn"
            fontSize={24}
            color="rgba(0,0,0,0.4)"
          />
          <LayoutGrid direction="column" gap={20} align="center">
            <AnimatedText
              text="Tight spacing (0.1em)"
              preset="softFadeIn"
              fontSize={18}
              color="rgba(0,0,0,0.5)"
            />
            <AnimatedText
              segments={[
                { icon: "check", color: "#22C55E" },
                { text: "Task" },
                { text: "completed", color: "#3B82F6" },
              ]}
              preset="voiceOsReveal"
              fontSize={36}
              fontWeight={600}
              color="#1a1a2e"
              stagger={4}
              wordGap="0.1em"
              iconGap="0.15em"
            />
          </LayoutGrid>
          <LayoutGrid direction="column" gap={20} align="center">
            <AnimatedText
              text="Wide spacing (0.4em)"
              preset="softFadeIn"
              delay={15}
              fontSize={18}
              color="rgba(0,0,0,0.5)"
            />
            <AnimatedText
              segments={[
                { icon: "check", color: "#22C55E" },
                { text: "Task" },
                { text: "completed", color: "#3B82F6" },
              ]}
              preset="voiceOsReveal"
              delay={15}
              fontSize={36}
              fontWeight={600}
              color="#1a1a2e"
              stagger={4}
              wordGap="0.4em"
              iconGap="0.5em"
            />
          </LayoutGrid>
        </LayoutGrid>
      </Sequence>
    </AbsoluteFill>
  );
};
