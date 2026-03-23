import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from 'remotion';
import { AnimatedText, LayoutGrid } from '../AnimatedText';
import { Background } from '../Global';
import { GlowingOrb } from '../VisualAnchor';
import { MockupFrame } from '../MockupFrame';

// ============================================
// Shared Types
// ============================================

export interface BaseSceneProps {
  /** Duration of the scene in frames */
  durationInFrames: number;
  /** Brand colors array */
  brandColors: string[];
  /** Background preset to use */
  backgroundPreset?: string;
}

// ============================================
// Problem Scene
// ============================================

export interface ProblemSceneProps extends BaseSceneProps {
  /** Question or problem statement */
  problemText: string;
  /** Supporting context */
  contextText?: string;
  /** Icon paths for problem visualization */
  problemIcons?: string[];
}

/**
 * Problem Scene: Hook the viewer with a relatable challenge.
 * Use at the start of videos to establish context.
 */
export const ProblemScene: React.FC<ProblemSceneProps> = ({
  durationInFrames,
  brandColors,
  backgroundPreset = 'warmEmber',
  problemText,
  contextText,
  problemIcons,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit animation
  const exitStart = durationInFrames - Math.floor(durationInFrames * 0.15);
  const exitProgress = frame > exitStart
    ? spring({ frame: frame - exitStart, fps, config: { damping: 100 } })
    : 0;

  return (
    <AbsoluteFill style={{ opacity: 1 - exitProgress }}>
      {/* Layer 1: Background */}
      <Background preset={backgroundPreset as any} />

      {/* Layer 2: Visual Anchor */}
      <GlowingOrb color={brandColors[0]} size={400} x={70} y={40} opacity={0.3} blur={80} />
      <GlowingOrb color={brandColors[1] || brandColors[0]} size={250} x={25} y={70} opacity={0.2} blur={60} delay={10} />

      {/* Layer 3: Main Content */}
      <LayoutGrid anchor="center" direction="column" gap={20}>
        {contextText && (
          <AnimatedText
            text={contextText}
            preset="fadeBlurIn"
            fontSize={28}
            color="rgba(255,255,255,0.7)"
          />
        )}
        <AnimatedText
          text={problemText}
          preset="voiceOsReveal"
          delay={contextText ? 15 : 0}
          fontSize={64}
          fontWeight={700}
          color="white"
        />
      </LayoutGrid>

      {/* Layer 4: Accent icons if provided */}
      {problemIcons && problemIcons.length > 0 && (
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 20 }}>
          {problemIcons.map((icon, i) => (
            <Img
              key={i}
              src={staticFile(icon)}
              style={{
                width: 40,
                height: 40,
                opacity: interpolate(frame - 30 - i * 8, [0, 15], [0, 0.6], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }),
              }}
            />
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ============================================
// Solution Scene
// ============================================

export interface SolutionSceneProps extends BaseSceneProps {
  /** Main solution text */
  solutionText: string;
  /** Subtitle or instruction */
  instructionText?: string;
  /** Show a mockup */
  showMockup?: boolean;
  /** Mockup type */
  mockupType?: 'browser' | 'iphone15';
  /** Screenshot path for mockup */
  screenshotPath?: string;
}

/**
 * Solution Scene: Show how simple the answer is.
 * Demonstrates the ease of your product/solution.
 */
export const SolutionScene: React.FC<SolutionSceneProps> = ({
  durationInFrames,
  brandColors,
  backgroundPreset = 'midnightOcean',
  solutionText,
  instructionText,
  showMockup = false,
  mockupType = 'browser',
  screenshotPath,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit animation
  const exitStart = durationInFrames - Math.floor(durationInFrames * 0.15);
  const exitProgress = frame > exitStart
    ? spring({ frame: frame - exitStart, fps, config: { damping: 100 } })
    : 0;

  return (
    <AbsoluteFill style={{ opacity: 1 - exitProgress }}>
      {/* Layer 1: Background */}
      <Background preset={backgroundPreset as any} />

      {/* Layer 2: Visual Anchor */}
      <GlowingOrb color={brandColors[0]} size={350} x={30} y={35} opacity={0.35} blur={70} />

      {/* Layer 3: Main Content */}
      {showMockup && screenshotPath ? (
        // Layout with mockup
        <>
          <LayoutGrid anchor="left" offsetX={100} direction="column" gap={16}>
            {instructionText && (
              <AnimatedText
                text={instructionText}
                preset="fadeBlurIn"
                fontSize={24}
                color="rgba(255,255,255,0.7)"
              />
            )}
            <AnimatedText
              text={solutionText}
              preset="slideInLeft"
              delay={10}
              fontSize={48}
              fontWeight={600}
              color="white"
              maxWidth={600}
            />
          </LayoutGrid>
          <MockupFrame
            type={mockupType}
            width={mockupType === 'browser' ? 550 : 240}
            style={{ position: 'absolute', left: 1350, top: 540 }}
          >
            <Img src={staticFile(screenshotPath)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </MockupFrame>
        </>
      ) : (
        // Text-only layout
        <LayoutGrid anchor="center" direction="column" gap={20}>
          {instructionText && (
            <AnimatedText
              text={instructionText}
              preset="fadeBlurIn"
              fontSize={28}
              color="rgba(255,255,255,0.7)"
            />
          )}
          <AnimatedText
            text={solutionText}
            preset="voiceOsReveal"
            delay={instructionText ? 15 : 0}
            fontSize={56}
            fontWeight={600}
            color="white"
          />
        </LayoutGrid>
      )}
    </AbsoluteFill>
  );
};

// ============================================
// Magic Scene
// ============================================

export interface MagicSceneProps extends BaseSceneProps {
  /** Main capability text */
  capabilityText: string;
  /** Features to highlight */
  features?: string[];
  /** Show visual effect */
  showEffect?: 'multiply' | 'network' | 'transform';
}

/**
 * Magic Scene: Build excitement with the "wow" factor.
 * Shows what makes your product special.
 */
export const MagicScene: React.FC<MagicSceneProps> = ({
  durationInFrames,
  brandColors,
  backgroundPreset = 'neonDream',
  capabilityText,
  features = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit animation
  const exitStart = durationInFrames - Math.floor(durationInFrames * 0.15);
  const exitProgress = frame > exitStart
    ? spring({ frame: frame - exitStart, fps, config: { damping: 100 } })
    : 0;

  return (
    <AbsoluteFill style={{ opacity: 1 - exitProgress }}>
      {/* Layer 1: Background */}
      <Background preset={backgroundPreset as any} />

      {/* Layer 2: Visual Anchor - Multiple glows for energy */}
      <GlowingOrb color={brandColors[0]} size={300} x={25} y={30} opacity={0.4} blur={60} />
      <GlowingOrb color={brandColors[1] || brandColors[0]} size={250} x={75} y={60} opacity={0.35} blur={50} delay={5} />
      <GlowingOrb color={brandColors[2] || brandColors[0]} size={200} x={50} y={80} opacity={0.3} blur={40} delay={10} />

      {/* Layer 3: Main Content */}
      <LayoutGrid anchor="center" direction="column" gap={32}>
        <AnimatedText
          text={capabilityText}
          preset="punchIn"
          fontSize={64}
          fontWeight={700}
          color="white"
        />

        {/* Feature pills */}
        {features.length > 0 && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {features.map((feature, i) => (
              <AnimatedText
                key={feature}
                text={feature}
                preset="bouncyWordPop"
                delay={25 + i * 8}
                fontSize={20}
                fontWeight={600}
                color="white"
                style={{
                  backgroundColor: brandColors[0],
                  padding: '10px 20px',
                  borderRadius: 50,
                }}
              />
            ))}
          </div>
        )}
      </LayoutGrid>
    </AbsoluteFill>
  );
};

// ============================================
// Result Scene
// ============================================

export interface ResultSceneProps extends BaseSceneProps {
  /** Main result/benefit text */
  resultText: string;
  /** Action verbs or benefits */
  benefits?: string[];
}

/**
 * Result Scene: Show the payoff.
 * Summarizes the value delivered.
 */
export const ResultScene: React.FC<ResultSceneProps> = ({
  durationInFrames,
  brandColors,
  backgroundPreset = 'deepPurpleAurora',
  resultText,
  benefits = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit animation
  const exitStart = durationInFrames - Math.floor(durationInFrames * 0.15);
  const exitProgress = frame > exitStart
    ? spring({ frame: frame - exitStart, fps, config: { damping: 100 } })
    : 0;

  return (
    <AbsoluteFill style={{ opacity: 1 - exitProgress }}>
      {/* Layer 1: Background */}
      <Background preset={backgroundPreset as any} />

      {/* Layer 2: Visual Anchor */}
      <GlowingOrb color={brandColors[0]} size={400} x={50} y={45} opacity={0.3} blur={80} />

      {/* Layer 3: Main Content */}
      <LayoutGrid anchor="center" direction="column" gap={28}>
        <AnimatedText
          text={resultText}
          preset="voiceOsReveal"
          fontSize={56}
          fontWeight={700}
          color="white"
        />

        {/* Benefit pills */}
        {benefits.length > 0 && (
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
            {benefits.map((benefit, i) => (
              <AnimatedText
                key={benefit}
                text={benefit}
                preset="slideInUp"
                delay={20 + i * 10}
                fontSize={24}
                fontWeight={600}
                color="white"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: '12px 24px',
                  borderRadius: 50,
                }}
              />
            ))}
          </div>
        )}
      </LayoutGrid>
    </AbsoluteFill>
  );
};

// ============================================
// Brand Reveal Scene
// ============================================

export interface BrandRevealSceneProps extends BaseSceneProps {
  /** Brand name */
  brandName: string;
  /** Brand tagline */
  tagline: string;
  /** Logo path */
  logoPath?: string;
  /** Logo size */
  logoSize?: number;
}

/**
 * Brand Reveal Scene: The triumphant finale.
 * This is where the brand name and logo finally appear.
 */
export const BrandRevealScene: React.FC<BrandRevealSceneProps> = ({
  durationInFrames,
  brandColors,
  backgroundPreset = 'deepPurpleAurora',
  brandName,
  tagline,
  logoPath,
  logoSize = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoEntrance = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill>
      {/* Layer 1: Background */}
      <Background preset={backgroundPreset as any} />

      {/* Layer 2: Visual Anchor - Dramatic glow behind logo */}
      <GlowingOrb color={brandColors[0]} size={500} x={50} y={45} opacity={0.4} blur={100} />
      <GlowingOrb color={brandColors[1] || brandColors[0]} size={300} x={35} y={60} opacity={0.25} blur={60} delay={10} />
      <GlowingOrb color={brandColors[2] || brandColors[0]} size={250} x={65} y={35} opacity={0.2} blur={50} delay={15} />

      {/* Layer 3: Main Content */}
      <LayoutGrid anchor="center" direction="column" gap={32}>
        {/* Logo */}
        {logoPath && (
          <div style={{
            opacity: logoEntrance,
            transform: `scale(${logoEntrance})`,
          }}>
            <Img
              src={staticFile(logoPath)}
              style={{
                width: logoSize,
                height: logoSize,
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Brand Name */}
        <AnimatedText
          text={brandName}
          preset="punchIn"
          delay={logoPath ? 15 : 0}
          fontSize={96}
          fontWeight={800}
          fontFamily="Bebas Neue"
          color="white"
        />

        {/* Tagline */}
        <AnimatedText
          text={tagline}
          preset="fadeBlurIn"
          delay={logoPath ? 35 : 20}
          fontSize={36}
          color="rgba(255,255,255,0.9)"
        />
      </LayoutGrid>

      {/* Layer 4: Subtle accent particles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: brandColors[i % brandColors.length],
            left: `${15 + i * 18}%`,
            top: `${75 + Math.sin(i) * 5}%`,
            opacity: interpolate(frame - 40 - i * 5, [0, 20], [0, 0.5], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }),
            transform: `translateY(${Math.sin((frame + i * 30) * 0.08) * 15}px)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ============================================
// Exports
// ============================================

export default {
  ProblemScene,
  SolutionScene,
  MagicScene,
  ResultScene,
  BrandRevealScene,
};
