# Remotion Component Library - Quick Reference

Use these components when they fit your vision. Use raw Remotion for unique effects.

---

## AnimatedText

**Import:** `import { AnimatedText, LayoutGrid, TextSequence } from "@/components/AnimatedText";`

| Preset | Effect |
|--------|--------|
| `fadeBlurIn` | Fade in with blur |
| `slideInUp/Down/Left/Right` | Slide from direction |
| `scaleUp` | Scale from small |
| `typewriter` | Character reveal |
| `maskSlideUp` | Masked slide |

**Key Props:**
```tsx
text: string;
preset?: PresetType;
animationUnit?: 'full' | 'word' | 'character';
stagger?: number;              // frames between units
startFrame?: number;
anchor?: 'center' | 'top-left' | 'bottom-center' | etc;
fontSize?: number;
fontWeight?: number;
color?: string;
gradient?: { colors: string[], angle?: number };
exit?: {                       // NOT exitPreset!
  startFrame: number;
  opacity?: { from?: number; to: number; duration?: number };
  blur?: { from?: number; to: number; duration?: number };
};
```

**Example:**
```tsx
<AnimatedText
  text="Hello World"
  preset="fadeBlurIn"
  animationUnit="word"
  stagger={4}
  anchor="center"
  fontSize={64}
  exit={{ startFrame: 90, opacity: { to: 0 }, blur: { to: 10 } }}
/>
```

---

## Background

**Import:** `import { Background } from "@/components/Global";`

### Preset (Simplest)
```tsx
<Background preset="deepPurpleAurora" />
<Background preset="midnightOcean" animationSpeed={0.5} />
```

**Presets:** `deepPurpleAurora`, `midnightOcean`, `cosmicNight`, `neonDream`, `sunsetBlaze`, `arcticFrost`, `softLavender`

### Layers (Full Control)
```tsx
<Background
  layers={[
    { type: "solid", color: "#FFFFFF" },
    { type: "glow", color: "#3b82f6", x: 50, y: 50, radius: 60, intensity: 0.3 },
    { type: "noise", opacity: 0.02 },
  ]}
  animated
/>
```

**Layer types:** `solid`, `linear`, `radial`, `mesh`, `noise`, `blur`, `vignette`, `glow`, `grid`

---

## MockupFrame

**Import:** `import { MockupFrame } from "@/components/MockupFrame";`

| Type | Description |
|------|-------------|
| `browser` | Browser with URL bar |
| `iphone15` | iPhone 15 with dynamic island |
| `iphone-notch` | iPhone with notch |
| `card` | Rounded card |
| `plain` | No frame |

```tsx
<MockupFrame
  type="browser"
  src="/screenshot.png"
  preset="springIn"
  browserConfig={{ url: "https://example.com" }}
  glass={{ blur: 12, opacity: 0.1 }}
/>
```

---

## MotionContainer

**Import:** `import { MotionContainer } from "@/components/Layout";`

| Initial States | Exit States |
|----------------|-------------|
| `hidden`, `offscreen-bottom`, `offscreen-top`, `offscreen-left`, `offscreen-right`, `scale-zero`, `blur` | `fade-out`, `slide-down`, `slide-up`, `scale-down`, `blur-out` |

```tsx
<MotionContainer initial="offscreen-bottom" delay={15} duration={30} exit="fade-out" exitStartFrame={100}>
  <YourContent />
</MotionContainer>
```

---

## Patterns (New - Parameterized)

**Import:** `import { IndicatorPill, FeaturePill, IconArc } from "@/components/Patterns";`

### IndicatorPill
Animated pill with icon and voice-style bars.
```tsx
<IndicatorPill
  icon={<EmailIcon />}      // or emoji string
  backgroundColor="#1A1A1A"
  barColor="#FFFFFF"
  barCount={5}
  delay={0}
/>
```

### FeaturePill
Label pill for feature descriptions.
```tsx
<FeaturePill
  text="Instantly replies for you"
  backgroundColor="#1A1A1A"
  textColor="#FFFFFF"
  fontSize={20}
  delay={40}
  exit={{ startFrame: 100 }}
/>
```

### IconArc
Semi-circular arrangement of app icons.
```tsx
<IconArc
  icons={[{ src: "/gmail.png", name: "Gmail" }, { icon: <SlackIcon />, name: "Slack" }]}
  radius={280}
  startAngle={-150}
  endAngle={-30}
  iconSize={52}
  stagger={3}
/>
```

---

## CameraRig

**Import:** `import { CameraRig } from "@/components/Camera";`

```tsx
const zoom = interpolate(frame, [0, 60], [1, 1.5], { extrapolateRight: 'clamp' });
<CameraRig zoom={zoom} x={0} y={0}>
  <YourScene />
</CameraRig>
```

**WARNING:** Don't nest LayoutGrid/AnimatedText with anchor inside CameraRig.

---

## DynamicCursor

**Import:** `import { DynamicCursor, CursorPath } from "@/components/DynamicCursor";`

```tsx
<CursorPath
  path={[
    { x: 100, y: 100, frame: 0 },
    { x: 500, y: 300, frame: 30, action: 'click' },
  ]}
  showTrail
/>
```

---

## IrisTransition

**Import:** `import { IrisTransition } from "@/components/Transitions";`

```tsx
<IrisTransition mode="exit" startFrame={120} duration={30} color="#000" />
```

---

## Critical Mistakes

| Wrong | Correct |
|-------|---------|
| `style={{ font-size: 24 }}` | `style={{ fontSize: 24 }}` |
| `spring({ delay: 10 })` | `spring({ frame: frame - 10 })` |
| `exitPreset="fadeOut"` | `exit={{ startFrame: 90, opacity: { to: 0 } }}` |
| `initial="below"` | `initial="offscreen-bottom"` |
| `animationSpeed` on BackgroundRig | Use `animationSpeed` (correct name) |
| `colors={[...]}` on BackgroundRig | Use `meshColors={{ primary, secondary }}` |
