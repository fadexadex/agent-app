
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimatedText } from '@/components/AnimatedText';
import { Background } from '@/components/Global';
import { MockupFrame } from '@/components/MockupFrame';
import { MotionContainer } from '@/components/Layout';
import React from 'react';

interface FeaturePillProps {
  text: string;
  delay: number;
  exitStartFrame: number;
}

const FeaturePill: React.FC<FeaturePillProps> = ({ text, delay, exitStartFrame }) => {
  return (
    <MotionContainer
      initial="scale-zero"
      delay={delay}
      duration={30} // Default entrance duration
      exit="fade-out"
      exitStartFrame={exitStartFrame}
      style={{
        position: 'absolute',
        top: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1A1A1A',
        color: 'white',
        borderRadius: 9999,
        padding: '12px 24px',
        fontSize: 32,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {text}
    </MotionContainer>
  );
};

interface IconGridProps {
  startDelay: number;
  stagger: number;
  exitStartFrame: number;
}

const techIcons = [
  { id: 'react', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', alt: 'React' },
  { id: 'typescript', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', alt: 'TypeScript' },
  { id: 'tailwind', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg', alt: 'Tailwind CSS' },
  { id: 'storybook', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/storybook/storybook-original.svg', alt: 'Storybook' },
];

const IconGrid: React.FC<IconGridProps> = ({ startDelay, stagger, exitStartFrame }) => {
  return (
    <AbsoluteFill
      style={{
        top: 400, // Position below mockups
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        width: '100%',
        height: 100, // Give it some height for positioning
      }}
    >
      {techIcons.map((icon, index) => (
        <MotionContainer
          key={icon.id}
          initial="scale-zero"
          delay={startDelay + index * stagger}
          duration={30}
          exit="fade-out"
          exitStartFrame={exitStartFrame}
          style={{ width: 60, height: 60 }} // Icon size
        >
          <img src={icon.src} alt={icon.alt} style={{ width: '100%', height: '100%' }} />
        </MotionContainer>
      ))}
    </AbsoluteFill>
  );
};

export const FeatureComponentLibrary: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit timings
  const iconGridExit = 120;
  const captionExit = 124;
  const pillExit = 128;
  const iphoneMockupExit = 132;
  const vscodeMockupExit = 136; // Including AnimatedText inside

  const cardComponentCode = `import React from 'react';

interface CardProps {
  title: string;
  description: string;
  imageUrl?: string;
}

const Card: React.FC<CardProps> = ({ title, description, imageUrl }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {imageUrl && <img src={imageUrl} alt={title} className="w-full h-32 object-cover rounded-md mb-2" />}
      <h3 className="font-bold text-lg mb-1">Title</h3>
      <p className="text-gray-600 text-sm">Description</p>
    </div>
  );
};
`;

  return (
    <AbsoluteFill>
      <Background layers={[{ type: 'solid', color: '#F0F4F8' }]} />

      {/* Feature Pill: Reusable & Modular Code */}
      <FeaturePill text="Reusable & Modular Code" delay={0} exitStartFrame={pillExit} />

      {/* iPhone 15 Mockup */}
      <MotionContainer
        initial="offscreen-bottom"
        delay={10}
        duration={40}
        exit="fade-out" // Using fade-out as a consistent exit
        exitStartFrame={iphoneMockupExit}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(calc(-250px - 50%), calc(50px - 50%))', // x: -250, y: 50
        }}
      >
        <MockupFrame type="iphone15" width={300} height={500} >
          <div style={{ flex: 1, backgroundColor: 'white', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ height: 60, backgroundColor: '#F0F0F0', borderRadius: 8 }}></div>
            <div style={{ height: 60, backgroundColor: '#E0E0E0', borderRadius: 8 }}></div>
            <div style={{ height: 60, backgroundColor: '#F0F0F0', borderRadius: 8 }}></div>
            <div style={{ height: 60, backgroundColor: '#E0E0E0', borderRadius: 8 }}></div>
          </div>
        </MockupFrame>
      </MotionContainer>


      {/* VS Code Card Mockup */}
      <MotionContainer
        initial="scale-zero"
        delay={20} // Slightly after iPhone
        duration={40}
        exit="fade-out" // Using fade-out as a consistent exit
        exitStartFrame={vscodeMockupExit}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(calc(250px - 50%), calc(50px - 50%))', // x: 250, y: 50
        }}
      >
        <MockupFrame type="card" theme="dark" glass={{ blur: 10, opacity: 0.1 }} width={500} height={400}>
          <AbsoluteFill style={{ padding: 20, fontFamily: 'monospace', color: 'white', fontSize: 18, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <AnimatedText
              text={cardComponentCode}
              preset="typewriter"
              animationUnit="character"
              stagger={0.6}
              startFrame={50}
              color="white"
              fontSize={18}
              anchor="top-left" 
              offsetX={0}
              offsetY={0}
              exit={{
                startFrame: vscodeMockupExit, 
                opacity: { from: 1, to: 0, duration: 20 },
              }}
            />
          </AbsoluteFill>
        </MockupFrame>
      </MotionContainer>

      {/* Tech Stack Icons Grid */}
      <IconGrid startDelay={90} stagger={8} exitStartFrame={iconGridExit} />

      {/* Caption Text */}
      <AnimatedText
        text="Built with best practices and your preferred stack."
        preset="typewriter"
        animationUnit="character"
        stagger={1.5} // From spec speed: 1.5
        startFrame={110}
        anchor="center"
        offsetY={250}
        fontSize={28}
        fontWeight={500}
        color="#1A1A1A"
        exit={{
          startFrame: captionExit,
          opacity: { from: 1, to: 0, duration: 20 },
        }}
      />
    </AbsoluteFill>
  );
};
