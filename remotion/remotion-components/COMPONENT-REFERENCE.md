# Remotion Component Library - Full Reference

Complete documentation for all components. Load this on-demand when you need detailed prop information.

---

## AnimatedText - Full Props

```typescript
interface AnimatedTextProps {
  // Content
  text: string;                              // Text to display

  // Animation
  preset?: 'fadeBlurIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' |
           'scaleUp' | 'typewriter' | 'glitchReveal' | 'maskSlideUp';
  animationUnit?: 'full' | 'word' | 'character' | 'line';
  stagger?: number;                          // Frames between animation units
  startFrame?: number;                       // When animation begins (default: 0)

  // Positioning
  anchor?: 'center' | 'top-left' | 'top-center' | 'top-right' |
           'bottom-left' | 'bottom-center' | 'bottom-right' |
           'center-left' | 'center-right';
  offsetX?: number;                          // Horizontal offset from anchor
  offsetY?: number;                          // Vertical offset from anchor

  // Typography
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;

  // Gradient (overrides color)
  gradient?: {
    colors: string[];
    angle?: number;                          // Default: 90
  };

  // Exit Animation (NOT exitPreset!)
  exit?: {
    startFrame?: number;                     // When exit begins
    opacity?: { from?: number; to?: number; duration?: number };
    blur?: { from?: number; to?: number; duration?: number };
    scale?: { from?: number; to?: number; duration?: number };
    position?: { fromX?: number; toX?: number; fromY?: number; toY?: number };
  };
}
```

### LayoutGrid
Groups multiple AnimatedText with flexbox:
```tsx
interface LayoutGridProps {
  anchor?: AnchorPosition;
  direction?: 'row' | 'column';
  gap?: number;
  children: ReactNode;
}
```

### TextSequence
Sequential text animations:
```tsx
interface TextSequenceProps {
  texts: string[];
  preset?: PresetType;
  mode?: 'chain' | 'parallel';
  chainOverlap?: number;                     // Frames of overlap between texts
  anchor?: AnchorPosition;
}
```

---

## Background - Full Props

```typescript
// Pattern 1: Preset
interface BackgroundPresetProps {
  preset: string;                            // Named preset
  animated?: boolean;
  animationSpeed?: number;
}

// Pattern 2: Type/Variant (BackgroundRig compatible)
interface BackgroundTypeProps {
  type: 'gradient-mesh' | 'grid-lines' | 'blobs' | 'solid';
  variant?: 'dark' | 'light' | 'brand';
  meshColors?: { primary?: string; secondary?: string };
  animated?: boolean;
  animationSpeed?: number;
}

// Pattern 3: Layers
interface BackgroundLayersProps {
  layers: BackgroundLayerConfig[];
  animated?: boolean;
  animationSpeed?: number;
}

// Layer configurations
type BackgroundLayerConfig =
  | { type: 'solid'; color: string }
  | { type: 'linear'; colors: string[]; angle?: number }
  | { type: 'radial'; colors: string[]; centerX?: number; centerY?: number; radius?: number }
  | { type: 'mesh'; colors?: string[]; points?: number }
  | { type: 'noise'; opacity?: number; scale?: number }
  | { type: 'blur'; intensity?: number }
  | { type: 'vignette'; intensity?: number; radius?: number }
  | { type: 'glow'; color: string; x: number; y: number; radius?: number; intensity?: number }
  | { type: 'grid'; color?: string; size?: number; thickness?: number };
```

### Available Presets
- **Dark**: `deepPurpleAurora`, `midnightOcean`, `cosmicNight`, `darkElegance`
- **Warm**: `sunsetBlaze`, `warmEmber`
- **Cool**: `arcticFrost`
- **Soft**: `softLavender`, `frostedGlass`
- **Bold**: `neonDream`
- **Mesh**: `pastelMesh`, `oceanMesh`

---

## MockupFrame - Full Props

```typescript
interface MockupFrameProps {
  // Frame type
  type?: 'browser' | 'iphone15' | 'iphone-notch' | 'card' | 'plain';

  // Content
  src?: string;                              // Image/video URL
  children?: ReactNode;                      // Or custom content

  // Appearance
  theme?: 'light' | 'dark';
  glass?: boolean | { blur: number; opacity: number };
  glare?: boolean;                           // Screen reflection

  // Size
  width?: number;
  height?: number;

  // Animation
  preset?: 'springIn' | 'fadeIn' | 'slideUp' | 'scaleIn';
  exitPreset?: 'fadeOut' | 'slideDown' | 'scaleOut';
  startFrame?: number;
  exitStartFrame?: number;

  // 3D Rotation
  rotate?: {
    startAngle: { x: number; y: number };
    endAngle: { x: number; y: number };
    startFrame: number;
    endFrame: number;
  };

  // Browser-specific
  browserConfig?: {
    url?: string;
    title?: string;
    showControls?: boolean;
  };
}
```

---

## MotionContainer - Full Props

```typescript
interface MotionContainerProps {
  // Entrance
  initial?: 'hidden' | 'offscreen-bottom' | 'offscreen-top' |
            'offscreen-left' | 'offscreen-right' | 'scale-zero' | 'blur';
  delay?: number;                            // Frames before entrance
  duration?: number;                         // Entrance duration (default: 30)

  // Exit
  exit?: 'fade-out' | 'slide-down' | 'slide-up' |
         'slide-left' | 'slide-right' | 'scale-down' | 'blur-out';
  exitStartFrame?: number;                   // When exit begins
  exitDuration?: number;

  // Content
  children: ReactNode;
  style?: CSSProperties;
}
```

---

## CameraRig - Full Props

```typescript
interface CameraRigProps {
  zoom?: number;                             // Scale (1 = normal)
  x?: number;                                // Camera X position
  y?: number;                                // Camera Y position
  rotation?: number;                         // Rotation in degrees
  focusPoint?: { x: number; y: number };     // Center of zoom/rotation
  children: ReactNode;
}
```

---

## DynamicCursor - Full Props

```typescript
interface DynamicCursorProps {
  x: number;
  y: number;
  variant?: 'arrow' | 'pointer' | 'text' | 'grab' | 'grabbing' | 'crosshair' | 'wait';
  isClicking?: boolean;
  rippleStartFrame?: number;
  color?: string;
  scale?: number;
  label?: string;                            // Floating label
}

interface CursorPathProps {
  path: Array<{
    x: number;
    y: number;
    frame: number;                           // Frame to reach this point
    action?: 'click' | 'double-click';
  }>;
  showTrail?: boolean;
  trailLength?: number;
  variant?: CursorVariant;
}
```

---

## BentoGrid - Full Props

```typescript
interface BentoGridProps {
  columns?: number;                          // Default: 3
  rows?: number;                             // Default: 2
  gap?: number;
  staggerDelay?: number;                     // Frames between cell animations
  cellDuration?: number;
  initial?: InitialState;                    // Default for all cells
  children: ReactNode;
}

interface BentoItemProps {
  colSpan?: number;
  rowSpan?: number;
  initial?: InitialState;                    // Override grid's initial
  children: ReactNode;
}
```

---

## IrisTransition - Full Props

```typescript
interface IrisTransitionProps {
  mode?: 'enter' | 'exit';                   // Expanding or contracting
  color?: string;
  startFrame?: number;
  duration?: number;
}
```

---

## Spring Configurations

| Name | Config | Effect |
|------|--------|--------|
| Smooth | `{ damping: 200 }` | No bounce, professional |
| Snappy | `{ damping: 20, stiffness: 200 }` | Quick and responsive |
| Bouncy | `{ damping: 8 }` | Playful bounce |
| Heavy | `{ damping: 15, mass: 2 }` | Weighty feel |
| Gentle | `{ damping: 30, stiffness: 100 }` | Soft and slow |

---

## Common Patterns

### Staggered Element Entry
```tsx
const elements = ['One', 'Two', 'Three'];
const STAGGER = 10;

{elements.map((text, i) => (
  <AnimatedText
    key={i}
    text={text}
    preset="slideInUp"
    startFrame={i * STAGGER}
  />
))}
```

### Coordinated Exit
```tsx
const EXIT_START = 100;
const EXIT_STAGGER = 5;

// Element 1 exits first
<MotionContainer exit="fade-out" exitStartFrame={EXIT_START}>
  <Element1 />
</MotionContainer>

// Element 2 exits 5 frames later
<MotionContainer exit="fade-out" exitStartFrame={EXIT_START + EXIT_STAGGER}>
  <Element2 />
</MotionContainer>
```

### Feature Scene Template
```tsx
export const FeatureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing constants
  const TIMING = {
    INDICATOR: 0,
    MOCKUP: 15,
    LABEL: 40,
    EXIT: 100,
  };

  return (
    <AbsoluteFill>
      <Background preset="deepPurpleAurora" />

      {/* 1. Indicator pill enters first */}
      <IndicatorPill
        icon="mail"
        delay={TIMING.INDICATOR}
      />

      {/* 2. Mockup slides up */}
      <MotionContainer
        initial="offscreen-bottom"
        delay={TIMING.MOCKUP}
        exit="fade-out"
        exitStartFrame={TIMING.EXIT}
      >
        <MockupFrame type="browser" src="/screenshot.png" />
      </MotionContainer>

      {/* 3. Feature label appears */}
      <FeaturePill
        text="Instantly replies for you"
        delay={TIMING.LABEL}
        exit={{ startFrame: TIMING.EXIT + 5 }}
      />
    </AbsoluteFill>
  );
};
```
