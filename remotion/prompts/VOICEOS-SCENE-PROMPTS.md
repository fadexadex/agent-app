# VoiceOS Video Recreation - Scene-by-Scene Prompts

## Video Specifications
- **Dimensions:** 994×720px (approximately 16:10 aspect ratio)
- **Frame Rate:** 30fps
- **Total Duration:** 46 seconds (~1380 frames)
- **Style:** Clean, minimal, white background with bold black typography and accent colors

---

## Global Style Guide

### Typography
- **Primary Font:** Inter or SF Pro Display (sans-serif, modern)
- **Headline Size:** 72-96px, font-weight: 700-800
- **Accent Text:** Blue (#2563EB) for keywords, Black (#000) for regular text
- **Feature Labels:** 18-24px inside pill-shaped containers

### Color Palette
```typescript
const colors = {
  background: '#FFFFFF',
  text: {
    primary: '#000000',
    accent: '#2563EB',     // Bright blue for emphasis
    muted: '#6B7280',      // Gray for secondary text
  },
  ui: {
    pill: '#1A1A1A',       // Dark pill background for voice indicator
    pillInner: '#FFFFFF',  // White bars inside pill
    shadow: 'rgba(0,0,0,0.08)', // Subtle shadows
  }
};
```

### Animation Principles
- **Timing:** Use `spring({ damping: 200 })` for smooth, no-bounce motion
- **Stagger:** 3-5 frame delay between sequential elements
- **Transitions:** Quick, snappy (~15-20 frames for most entrances)
- **Easing:** `Easing.out(Easing.cubic)` for exits, spring for entrances

---

## Scene 1: Hook - Morphing Sphere (0:00 - 0:10)
**Duration:** ~300 frames (10 seconds)
**Timeline Position:** Hook section

### Sub-Scene 1A: Animated Sphere (Frames 0-90)

#### Visual Description
A 3D-looking sphere with a sky/cloud texture rotates in the center of the screen. The sphere has a subtle glass-like rim/edge highlight and appears to float.

#### Technical Implementation
```
PROMPT FOR CLAUDE:
Create a Remotion component called `AnimatedSphere` that renders:
1. A circular element (120-150px diameter) centered on screen
2. Use a sky/cloud gradient background image mapped onto the sphere
3. The sphere should have a subtle 3D effect using:
   - `radial-gradient` for inner shading
   - `box-shadow` for depth (inset and outer)
   - A rotating cloud texture using `background-position` animation
4. The sphere rotates continuously (backgroundPosition shifts over time)
5. Entry animation: Scale from 0 → 1 using spring({ damping: 15 }) for slight bounce
6. Add a subtle glow/shadow beneath (20% opacity, blurred)

Animation sequence:
- Frame 0-30: Sphere scales in from 0 with spring bounce
- Frame 30-90: Sphere rotates (cloud texture moves), color shifts from pink/sunset to blue/sky
```

#### Component Mapping
- **Background:** `<Background layers={[{ type: 'solid', color: '#FFFFFF' }]} />`
- **Custom:** Raw Remotion code needed for sphere (not covered by existing components)

---

### Sub-Scene 1B: Sphere → Icon Morph + Text (Frames 90-300)

#### Visual Description
The sphere shrinks and morphs into a solid black circle (the brand icon). Simultaneously, text animates in word-by-word: "What if **your computer** didn't need ⌨️" where the keyboard emoji appears as a stylized icon.

#### Technical Implementation
```
PROMPT FOR CLAUDE:
Create a Remotion scene for the "Hook" section with these exact animations:

1. **Sphere Morph (frames 90-120):**
   - The sky sphere scales down (1 → 0.4)
   - Opacity of cloud texture fades to 0
   - Solid black fill fades in
   - Final size: ~40px solid black circle

2. **Text Reveal (frames 100-200):**
   - Use word-by-word reveal animation
   - Text: "What if your computer didn't need ⌨️"
   - Layout: Horizontal, centered
   - The black circle becomes the icon BEFORE "your" 
   - Format: "What if [●] your computer didn't need [keyboard-icon]"
   
3. **Typography:**
   - "your computer" in bold black (#000)
   - Rest in regular weight
   - Font size: 48-56px
   - Word stagger: 4 frames between each word
   
4. **Keyboard Icon:**
   - Stylized rounded rectangle with dots inside
   - Animates in with scale + opacity
   - Size: ~80px wide, matches text height

5. **Exit Animation (frames 250-300):**
   - All elements fade out with blur (0 → 8px blur, 1 → 0 opacity)
   - Stagger: Text exits first, icon last
```

#### Component Mapping
```tsx
<AnimatedText 
  text="What if" 
  preset="slideInUp" 
  animationUnit="word"
  stagger={4}
  anchor="center"
  fontSize={52}
  exit={{ startFrame: 250, opacity: { to: 0 }, blur: { to: 10 } }}
/>
```

---

## Scene 2: Intro - Brand Reveal (0:10 - 0:17)
**Duration:** ~210 frames (7 seconds)
**Timeline Position:** Intro section

### Sub-Scene 2A: Sphere Zoom + Sky Expansion (Frames 300-420)

#### Visual Description
The brand sphere (now showing blue sky) zooms in dramatically, filling the entire screen with a sky/clouds image. A cyan/blue arc appears at the bottom edge.

#### Technical Implementation
```
PROMPT FOR CLAUDE:
Create a dramatic zoom transition scene:

1. **Starting State (frame 300):**
   - Small sphere (~120px) centered on screen
   - Shows blue sky with white clouds texture
   - Subtle shadow beneath

2. **Zoom Animation (frames 300-400):**
   - Sphere scales from 1 → 8 (fills and exceeds viewport)
   - Use spring({ damping: 20, stiffness: 100 })
   - The cloud texture should feel like we're "entering" the sky
   
3. **Sky Background (frames 380-420):**
   - Full-screen sky image with fluffy white clouds
   - Blue gradient: #87CEEB (top) to #B0E2FF (bottom)
   - A semi-transparent glass orb floats in the center (brand logo)
   
4. **Arc Element (frames 400-420):**
   - Cyan/turquoise arc (#06B6D4) appears at bottom
   - Slides up from below the viewport
   - Height: ~60px, full width, curved top edge
```

---

### Sub-Scene 2B: Voice Indicator Pill (Frames 420-510)

#### Visual Description
A black pill-shaped "voice indicator" appears in the center. It contains animated sound wave bars (4-5 white rectangles) that pulse to suggest audio activity.

#### Technical Implementation
```
PROMPT FOR CLAUDE:
Create a `VoiceIndicatorPill` component:

1. **Container:**
   - Pill shape: 200px × 60px, border-radius: 30px
   - Background: #1A1A1A (near black)
   - Centered on screen
   - Entry: Scale from 0.5 → 1 with spring, slight Y offset (-20 → 0)

2. **Sound Wave Bars:**
   - 4-5 white rounded rectangles inside the pill
   - Arranged horizontally with 8px gap
   - Each bar: 8px wide, varying heights (20-40px)
   - Heights animate sinusoidally, offset by phase:
   ```
   const barHeight = 20 + 20 * Math.sin((frame / 4) + (index * 0.8));
   ```
   
3. **App Icon Slot (left side):**
   - Small rounded square (32px) on left side of pill
   - Can display different app icons (email, calendar, etc.)
   - For this scene: Shows a generic blue square icon

4. **Animation Timing:**
   - Frame 420-450: Pill scales in
   - Frame 450+: Bars animate continuously
```

#### Component Notes
This is a **custom component** - no existing catalog component covers voice waveforms. Consider creating a reusable `VoiceIndicatorPill` component.

---

## Scene 3: Features + Benefits (0:17 - 0:41)
**Duration:** ~720 frames (24 seconds)
**Timeline Position:** Features + Benefits section

This section showcases 5 distinct feature demonstrations. Each follows a similar pattern:
1. Voice indicator pill (with app icon)
2. UI mockup slides in
3. Feature label appears in pill below
4. Exit transition

---

### Feature 3A: Email Reply (Frames 510-630)

#### Visual Description
Shows an email compose window (Gmail-style) that types out a message automatically. A pill below says "Instantly replies for you".

#### Technical Implementation
```
PROMPT FOR CLAUDE:
Create the Email Reply feature scene:

1. **Voice Indicator (frames 510-540):**
   - VoiceIndicatorPill from previous scene
   - App icon slot shows: Email icon (blue envelope or Gmail icon)
   - Position: Center, slightly above middle

2. **Email Mockup (frames 530-600):**
   - Use MockupFrame type="card" or custom email window
   - Email compose window appearance:
     - Header: "New message" with close/expand buttons
     - To field: "Emily@voiceos.com"
     - Subject: "Follow-Up on Project Update"
     - Body text types in using typewriter effect:
       "Hi Emily,
       
       Quick check, would it be easier to move our call to later?
       Happy to work around what's best for you.
       
       Best,
       Jonah"
   - "Send email" button (blue, bottom left)
   - "Attach a file" link
   
3. **Entry Animation:**
   - MockupFrame slides up from below (Y: 200 → 0)
   - Subtle 3D tilt: rotateX starts at 10° → 0°
   - Use spring({ damping: 20 })

4. **Feature Label Pill (frames 570-620):**
   - Black pill with white text: "Instantly replies for you"
   - Position: Below the email mockup
   - Entry: fadeBlurIn or scaleUp
   
5. **Typewriter Effect:**
   - Text reveals character by character
   - Speed: ~2 characters per frame
   - Blinking cursor at end (optional)
```

#### Component Mapping
```tsx
<MockupFrame 
  type="card" 
  theme="light"
  glass={{ blur: 8, opacity: 0.05 }}
  preset="slideUp"
>
  <EmailComposeUI />
</MockupFrame>

<AnimatedText 
  text="Instantly replies for you"
  preset="fadeBlurIn"
  anchor="bottom-center"
  offsetY={-80}
  fontSize={20}
  // Wrap in pill-styled container
/>
```

---

### Feature 3B: AI Assistant Chat (Frames 630-750)

#### Visual Description
A chat-like interface showing "Evening, Jerry" with an AI text input. Below shows "Thought to polished prompt".

#### Technical Implementation
```
PROMPT FOR CLAUDE:
Create the AI Chat feature scene:

1. **UI Mockup:**
   - Card with warm beige/cream background (#F5F0E8)
   - Header: Sparkle emoji (✨) + "Evening, Jerry" in serif font
   - Text input area below with gray placeholder text:
     "Implement a comprehensive payment system with
      transaction handling real time status updates
      mechanisms, multi currency support, and
      receipt generation."
   - Bottom row: "+ ⏰" icons left, "Sonnet 4.5" dropdown + send button right

2. **Animation Sequence:**
   - Frame 630-660: Card slides in from right (X: 100 → 0)
   - Frame 660-720: Text in input area appears with typewriter
   - Frame 700-750: "Sonnet 4.5" badge pulses subtly

3. **Feature Label:**
   - "Thought to polished prompt"
   - Same pill style as previous feature

4. **Exit:**
   - Card scales down (1 → 0.95) and fades out
   - Feature label fades with blur
```

---

### Feature 3C: Social Media Reply (Frames 750-870)

#### Visual Description
A Twitter/X-style reply interface showing a tweet and draft reply. Label says "Sounds just like you".

#### Technical Implementation
```
PROMPT FOR CLAUDE:
Create the Social Reply feature scene:

1. **Twitter/X Mockup:**
   - White card with subtle shadow
   - Header: "X" close button (left), "Drafts" (right, blue)
   - Original tweet:
     - Avatar (small blue circle with avatar)
     - Username: "ちょっとだけモーション @motion_shia_ · Jan 3"
     - Tweet: "#100 pic.x.com/4BxAWOThmv"
   - Reply section:
     - "Replying to @motion_shia_"
     - Avatar + reply text: "This is the kind of energy I'm bringing to 2026."
   - Bottom toolbar: Media, GIF, Poll, Emoji, Schedule, Location icons
   - "Reply" button (gray, right side)

2. **Animation:**
   - Mockup enters with slight rotation (rotateY: -5° → 0°)
   - Text appears with subtle fade
   - Voice indicator shows X/Twitter icon

3. **Feature Label:**
   - "Sounds just like you"
   - Positioned below mockup
```

---

### Feature 3D: Universal Integration (Frames 870-1080)

#### Visual Description
Text says "[VO icon] is universal" then transitions to an arc of app icons surrounding center text "Works across all apps" then "with zero setup required".

#### Technical Implementation
```
PROMPT FOR CLAUDE:
Create the Universal Integration feature scene:

1. **Title Card (frames 870-930):**
   - Centered text: "[VO] is universal"
   - [VO] is the brand icon (black rounded square with two circles inside)
   - "is" in black, "universal" in blue (#2563EB)
   - Entry: Word-by-word fade in

2. **App Icons Arc (frames 930-1050):**
   - 14-16 app icons arranged in a semi-circle/arc
   - Icons include: GitHub, Notion, Figma, Slack, Telegram, Canva, Word,
     Readwise, Google (multicolor), Gemini, ChatGPT, various others
   - Each icon: 48-56px, rounded corners (12px radius), subtle shadow
   
3. **Arc Animation:**
   - Icons appear one by one in arc formation
   - Stagger: 2-3 frames between each
   - Start from top-left, sweep to top-right
   - Use spring for each icon's scale (0 → 1)
   
4. **Center Text Sequence:**
   - Frame 960: "Works across all apps" (center)
   - "apps" highlighted in blue
   - Frame 1000: Transitions to "with zero setup required"
   - "required" highlighted in blue
   - Voice indicator pill between the two text states

5. **Arc Layout Math:**
   ```typescript
   // Position icons in arc
   const arcRadius = 280;
   const arcStartAngle = -150; // degrees
   const arcEndAngle = -30;
   const angleStep = (arcEndAngle - arcStartAngle) / (iconCount - 1);
   
   icons.map((icon, i) => {
     const angle = (arcStartAngle + i * angleStep) * (Math.PI / 180);
     const x = centerX + arcRadius * Math.cos(angle);
     const y = centerY + arcRadius * Math.sin(angle);
   });
   ```
```

#### Component Considerations
The arc of icons requires custom positioning logic. Consider a reusable `IconArc` component:

```tsx
interface IconArcProps {
  icons: Array<{ src: string; alt: string }>;
  radius: number;
  startAngle: number;
  endAngle: number;
  staggerDelay: number;
}
```

---

## Scene 4: CTR - Call to Action (0:41 - 0:46)
**Duration:** ~150 frames (5 seconds)
**Timeline Position:** CTR section

### Sub-Scene 4A: Logo Reveal (Frames 1080-1230)

#### Visual Description
The VoiceOS logo appears in the center, followed by the website URL below.

#### Technical Implementation
```
PROMPT FOR CLAUDE:
Create the final CTA scene:

1. **Transition In (frames 1080-1110):**
   - Quick white flash or blur transition
   - All previous elements have exited

2. **Logo Animation (frames 1110-1170):**
   - "voiceos" wordmark appears centered
   - Typography breakdown:
     - "v" = downward triangle (▼)
     - "oice" = regular lowercase
     - "o" = solid black circle (●)
     - "s" = regular lowercase
   - Animation: Each character scales in sequentially
   - Stagger: 3 frames per character
   - Use spring({ damping: 15 }) for slight bounce

3. **URL Reveal (frames 1160-1200):**
   - "voiceos.com" appears below logo
   - Smaller text (24px), regular weight
   - Entry: fadeBlurIn, starts during logo animation tail

4. **Hold & End (frames 1200-1380):**
   - Static hold for memorability
   - Optional: Subtle ambient animation (logo breathes 1% scale)
```

#### Component Mapping
```tsx
<LayoutGrid anchor="center" direction="column" gap={24}>
  <AnimatedText 
    text="voiceos" 
    preset="scaleUp"
    animationUnit="character"
    stagger={3}
    fontSize={96}
    fontWeight={700}
  />
  <AnimatedText 
    text="voiceos.com"
    preset="fadeBlurIn"
    startFrame={50}
    fontSize={24}
    color="#6B7280"
  />
</LayoutGrid>
```

**Note:** The custom "v" as triangle and "o" as circle requires custom rendering—not achievable with AnimatedText alone. You'll need:

```tsx
const VoiceOSLogo: React.FC<{ frame: number }> = ({ frame }) => {
  // Custom SVG or positioned elements for:
  // ▼ o i c e ● s
  // Where ▼ and ● are separate elements
};
```

---

## Transition Patterns Used

### 1. Blur Fade
```typescript
const blurFade = {
  opacity: interpolate(frame, [start, start + 20], [1, 0], { extrapolateRight: 'clamp' }),
  filter: `blur(${interpolate(frame, [start, start + 20], [0, 12], { extrapolateRight: 'clamp' })}px)`,
};
```

### 2. Scale Spring
```typescript
const scale = spring({
  frame: frame - delay,
  fps,
  config: { damping: 15, stiffness: 100 },
});
```

### 3. Slide Up with Fade
```typescript
const slideUp = {
  transform: `translateY(${interpolate(frame, [start, start + 25], [40, 0], { 
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })}px)`,
  opacity: interpolate(frame, [start, start + 15], [0, 1], { extrapolateRight: 'clamp' }),
};
```

---

## Custom Components Needed

Based on this video, you should create these reusable components:

### 1. `VoiceIndicatorPill`
```typescript
interface VoiceIndicatorPillProps {
  appIcon?: React.ReactNode;
  barCount?: number;
  width?: number;
  isAnimating?: boolean;
}
```

### 2. `AnimatedSphere`
```typescript
interface AnimatedSphereProps {
  size: number;
  texture: 'sky' | 'sunset' | 'solid';
  rotation?: boolean;
}
```

### 3. `IconArc`
```typescript
interface IconArcProps {
  icons: string[];
  radius: number;
  angleRange: [number, number];
  stagger: number;
}
```

### 4. `FeaturePill`
```typescript
interface FeaturePillProps {
  text: string;
  // Black pill with white text for feature labels
}
```

### 5. `VoiceOSLogo`
```typescript
// Custom logo with triangle V and circle O
```

---

## Complete Scene Timeline

| Scene | Frames | Duration | Description |
|-------|--------|----------|-------------|
| 1A | 0-90 | 3s | Animated sphere entrance |
| 1B | 90-300 | 7s | Sphere morph + hook text |
| 2A | 300-420 | 4s | Sky zoom transition |
| 2B | 420-510 | 3s | Voice indicator intro |
| 3A | 510-630 | 4s | Email reply feature |
| 3B | 630-750 | 4s | AI assistant feature |
| 3C | 750-870 | 4s | Social reply feature |
| 3D | 870-1080 | 7s | Universal integration |
| 4A | 1080-1380 | 10s | Logo + CTA |

---

## Prompting Best Practices

When prompting Claude to generate these scenes:

1. **Always specify frame numbers** - "From frame 0 to frame 90, animate X"
2. **Reference your components** - "Use AnimatedText with preset='fadeBlurIn'"
3. **Include spring configs** - "Use spring({ damping: 200 }) for smooth motion"
4. **Specify exact colors** - "Text color #2563EB for accent words"
5. **Define positioning** - "Centered horizontally, 40% from top"
6. **Include exit animations** - "Exit with blur fade starting frame 250"
7. **Note the fps** - "30fps, so 1 second = 30 frames"

---

## Sample Full Prompt for Scene 1

```
Create a Remotion composition for Scene 1 of a product video.

**Composition Settings:**
- Width: 994px, Height: 720px, FPS: 30
- Duration: 300 frames (10 seconds)
- Background: Pure white (#FFFFFF)

**Scene 1A (Frames 0-90): Animated Sphere**
Create a 3D-looking sphere that:
1. Is 140px diameter, centered on screen
2. Has a cloud/sky texture (use CSS radial-gradient with #87CEEB, #B0E2FF, white)
3. Scales in from 0 → 1 using spring({ frame, fps, config: { damping: 15 }})
4. Rotates continuously (backgroundPosition animation)
5. Has subtle drop shadow and inner glow for 3D effect

**Scene 1B (Frames 90-300): Text Reveal**
After the sphere:
1. Sphere shrinks (scale 1 → 0.4) and becomes solid black circle
2. Text reveals word-by-word: "What if your computer didn't need [keyboard]"
3. Use AnimatedText component with:
   - preset="slideInUp"
   - animationUnit="word"
   - stagger={4}
   - anchor="center"
4. "your computer" should be bold
5. Keyboard icon (rounded rectangle with dots) animates in last
6. Exit all elements with blur fade starting frame 250

Use these imports:
- import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
- import { AnimatedText } from '@/components/AnimatedText';
- import { Background } from '@/components/Global';

Follow Remotion best practices:
- NO CSS animations or Tailwind animation classes
- All motion driven by useCurrentFrame()
- Use spring() for entrances, interpolate() for linear motion
- Clamp all interpolations
```

---

## File Organization Suggestion

```
src/
├── compositions/
│   └── VoiceOS/
│       ├── index.tsx           # Main composition
│       ├── Scene1Hook.tsx
│       ├── Scene2Intro.tsx
│       ├── Scene3Features.tsx
│       ├── Scene4CTA.tsx
│       └── components/
│           ├── VoiceIndicatorPill.tsx
│           ├── AnimatedSphere.tsx
│           ├── IconArc.tsx
│           ├── FeaturePill.tsx
│           └── VoiceOSLogo.tsx
```

---

*This document provides the complete breakdown needed to recreate the VoiceOS video in Remotion with high fidelity.*
