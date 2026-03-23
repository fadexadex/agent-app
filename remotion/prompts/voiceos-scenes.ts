/**
 * VoiceOS Video - Scene Definitions
 * 
 * This file contains the structured scene definitions for the VoiceOS
 * product video, using the schema from scene.types.ts
 */

import type { VideoProject, Scene } from './scene.types';

// ============================================================
// PROJECT DEFINITION
// ============================================================

export const voiceOSProject: VideoProject = {
  meta: {
    name: "VoiceOS Product Video",
    description: "A 46-second product video showcasing VoiceOS voice assistant capabilities",
    width: 994,
    height: 720,
    fps: 30,
  },
  
  globalStyles: {
    colors: {
      primary: "#000000",
      secondary: "#1A1A1A",
      accent: "#2563EB",
      background: "#FFFFFF",
      text: "#000000",
    },
    typography: {
      fontFamily: "Inter, SF Pro Display, sans-serif",
      headingWeight: 700,
      bodyWeight: 400,
    },
    animation: {
      defaultSpring: "smooth",
      defaultStagger: 4,
    },
  },
  
  scenes: [
    // Scene definitions below
  ],
};

// ============================================================
// SCENE 1: HOOK - ANIMATED SPHERE
// ============================================================

export const scene1A_AnimatedSphere: Scene = {
  id: "hook-sphere",
  name: "Animated Sky Sphere",
  category: "hook",
  durationFrames: 90,
  
  background: {
    type: "solid",
    color: "#FFFFFF",
  },
  
  elements: [
    {
      type: "custom",
      id: "sky-sphere",
      componentName: "AnimatedSphere",
      description: `
        A 3D-looking sphere (140px diameter) centered on screen.
        
        Visual:
        - Cloud/sky texture mapped onto sphere surface
        - Subtle glass-like rim highlight
        - Soft drop shadow beneath (20% opacity, 20px blur)
        - Inner radial gradient for 3D depth
        
        Animation:
        - Colors shift from pink/sunset palette to blue/sky
        - Cloud texture rotates continuously (backgroundPosition shift)
        - Subtle floating motion (2px up/down oscillation)
      `,
      props: {
        size: 140,
        texture: "sky",
        rotation: true,
        colorShift: {
          from: ["#FFB6C1", "#FFC0CB", "#FFFFFF"], // sunset
          to: ["#87CEEB", "#B0E2FF", "#FFFFFF"],   // sky
          startFrame: 30,
          endFrame: 90,
        },
      },
      position: {
        anchor: "center",
        offsetX: 0,
        offsetY: 0,
      },
      animation: {
        timing: {
          startFrame: 0,
          durationFrames: 30,
          springConfig: "bouncy",
        },
        description: "Scale from 0 to 1 with bouncy spring entrance",
      },
    },
  ],
  
  transitionOut: {
    type: "none",
    durationFrames: 0,
  },
  
  notes: "This sphere will morph into the brand icon in the next scene",
};

// ============================================================
// SCENE 1B: HOOK - TEXT REVEAL
// ============================================================

export const scene1B_HookTextReveal: Scene = {
  id: "hook-text-reveal",
  name: "Hook Text Reveal",
  category: "hook",
  durationFrames: 210, // frames 90-300 of video
  
  background: {
    type: "solid",
    color: "#FFFFFF",
  },
  
  elements: [
    // Morphing sphere → icon
    {
      type: "custom",
      id: "morphing-icon",
      componentName: "MorphingBrandIcon",
      description: `
        The sky sphere from previous scene morphs into a solid black circle.
        
        Animation sequence:
        - Frame 0-30: Scale shrinks (1 → 0.35)
        - Frame 0-30: Cloud texture opacity fades (1 → 0)
        - Frame 10-30: Solid black fill fades in (0 → 1)
        - Final state: 40px solid black circle
        
        Position moves from center to inline with text.
      `,
      props: {
        initialSize: 140,
        finalSize: 40,
        morphDuration: 30,
      },
      position: {
        anchor: "center",
        offsetX: -180, // position before "your" in the text
        offsetY: 0,
      },
      animation: {
        timing: {
          startFrame: 0,
          durationFrames: 30,
          springConfig: "smooth",
        },
      },
      exit: {
        startFrame: 180,
        preset: "blurOut",
        durationFrames: 20,
      },
    },
    
    // Main hook text
    {
      type: "text",
      id: "hook-question-1",
      content: "What if",
      style: {
        fontSize: 52,
        fontWeight: 400,
        color: "#000000",
      },
      position: {
        anchor: "center",
        offsetX: -220,
        offsetY: 0,
      },
      animation: {
        preset: "slideInUp",
        unit: "word",
        stagger: 4,
        timing: {
          startFrame: 10,
          durationFrames: 40,
          springConfig: "smooth",
        },
      },
      exit: {
        startFrame: 180,
        preset: "blurOut",
        durationFrames: 20,
      },
    },
    
    {
      type: "text",
      id: "hook-question-2",
      content: "your computer",
      style: {
        fontSize: 52,
        fontWeight: 700, // bold
        color: "#000000",
      },
      position: {
        anchor: "center",
        offsetX: 0,
        offsetY: 0,
      },
      animation: {
        preset: "slideInUp",
        unit: "word",
        stagger: 4,
        timing: {
          startFrame: 30,
          durationFrames: 40,
          springConfig: "smooth",
        },
      },
      exit: {
        startFrame: 180,
        preset: "blurOut",
        durationFrames: 20,
      },
    },
    
    {
      type: "text",
      id: "hook-question-3",
      content: "didn't need",
      style: {
        fontSize: 52,
        fontWeight: 400,
        color: "#000000",
      },
      position: {
        anchor: "center",
        offsetX: 80,
        offsetY: 0,
      },
      animation: {
        preset: "slideInUp",
        unit: "word",
        stagger: 4,
        timing: {
          startFrame: 60,
          durationFrames: 40,
          springConfig: "smooth",
        },
      },
      exit: {
        startFrame: 180,
        preset: "blurOut",
        durationFrames: 20,
      },
    },
    
    // Keyboard icon
    {
      type: "custom",
      id: "keyboard-icon",
      componentName: "KeyboardIcon",
      description: `
        Stylized keyboard icon (rounded rectangle with dots inside).
        Similar to ⌨️ but custom rendered.
        
        Visual:
        - Rounded rectangle: 80px × 48px
        - Border radius: 12px
        - Background: #2563EB (accent blue)
        - 6 small white dots arranged in 2 rows inside
      `,
      props: {
        width: 80,
        height: 48,
        color: "#2563EB",
      },
      position: {
        anchor: "center",
        offsetX: 220,
        offsetY: 0,
      },
      animation: {
        timing: {
          startFrame: 90,
          durationFrames: 20,
          springConfig: "snappy",
        },
        description: "Scale in with slight bounce",
      },
      exit: {
        startFrame: 180,
        preset: "blurOut",
        durationFrames: 20,
      },
    },
  ],
  
  transitionOut: {
    type: "blur",
    durationFrames: 20,
  },
  
  notes: "Text layout should be inline, wrapping naturally. The brand icon sits between 'if' and 'your'.",
};

// ============================================================
// SCENE 2A: INTRO - SKY ZOOM
// ============================================================

export const scene2A_SkyZoom: Scene = {
  id: "intro-sky-zoom",
  name: "Sky Zoom Transition",
  category: "intro",
  durationFrames: 120, // frames 300-420
  
  background: {
    type: "solid",
    color: "#FFFFFF",
  },
  
  elements: [
    {
      type: "custom",
      id: "zooming-sphere",
      componentName: "ZoomingSphere",
      description: `
        The brand sphere zooms in dramatically, filling the screen with sky.
        
        Animation:
        - Frame 0-80: Scale from 1 → 8 (fills and exceeds viewport)
        - Use spring with low damping for momentum feel
        - Cloud texture should feel like we're "entering" the sky
        - Final frames: Full-screen sky background visible
      `,
      props: {
        startScale: 1,
        endScale: 8,
        springConfig: { damping: 20, stiffness: 100 },
      },
      position: {
        anchor: "center",
      },
      animation: {
        timing: {
          startFrame: 0,
          durationFrames: 80,
          springConfig: "custom",
          customSpring: { damping: 20, stiffness: 100 },
        },
      },
    },
    
    {
      type: "custom",
      id: "glass-orb",
      componentName: "GlassOrb",
      description: `
        A floating glass orb with the brand icon inside.
        Semi-transparent with refraction effects.
        Appears after the zoom completes.
      `,
      props: {
        size: 100,
        opacity: 0.7,
      },
      position: {
        anchor: "center",
      },
      animation: {
        timing: {
          startFrame: 70,
          durationFrames: 30,
          springConfig: "smooth",
        },
        description: "Fade in with scale from 0.8 to 1",
      },
    },
    
    // Cyan arc at bottom
    {
      type: "shape",
      id: "bottom-arc",
      shapeType: "arc",
      style: {
        width: 994,
        height: 60,
        backgroundColor: "#06B6D4",
        borderRadius: "100% 100% 0 0",
      },
      position: {
        anchor: "bottom-center",
        offsetY: 0,
      },
      animation: {
        preset: "slideInUp",
        timing: {
          startFrame: 90,
          durationFrames: 30,
          springConfig: "smooth",
        },
      },
    },
  ],
  
  transitionOut: {
    type: "fade",
    durationFrames: 15,
  },
};

// ============================================================
// SCENE 2B: INTRO - VOICE INDICATOR
// ============================================================

export const scene2B_VoiceIndicator: Scene = {
  id: "intro-voice-indicator",
  name: "Voice Indicator Introduction",
  category: "intro",
  durationFrames: 90, // frames 420-510
  
  background: {
    type: "solid",
    color: "#FFFFFF",
  },
  
  elements: [
    {
      type: "custom",
      id: "voice-pill",
      componentName: "VoiceIndicatorPill",
      description: `
        A pill-shaped voice indicator with animated sound wave bars.
        
        Visual:
        - Container: 200px × 60px, border-radius: 30px
        - Background: #1A1A1A (near black)
        - Left side: App icon slot (32px rounded square)
        - Right side: 4-5 white sound wave bars
        
        Sound Wave Animation:
        - Each bar: 8px wide, varying heights (20-40px)
        - Heights animate sinusoidally with phase offset:
          barHeight = 20 + 20 * Math.sin((frame / 4) + (index * 0.8))
        - Continuous animation throughout scene
        
        Entry:
        - Scale from 0.5 → 1 with spring
        - Y offset: -20 → 0
      `,
      props: {
        width: 200,
        height: 60,
        barCount: 5,
        appIcon: "generic-blue", // placeholder icon
      },
      position: {
        anchor: "center",
      },
      animation: {
        timing: {
          startFrame: 0,
          durationFrames: 30,
          springConfig: "snappy",
        },
        description: "Scale in with Y offset correction",
      },
    },
  ],
};

// ============================================================
// SCENE 3A: FEATURE - EMAIL REPLY
// ============================================================

export const scene3A_EmailFeature: Scene = {
  id: "feature-email",
  name: "Email Reply Feature",
  category: "feature",
  durationFrames: 120, // frames 510-630
  
  background: {
    type: "solid",
    color: "#FFFFFF",
  },
  
  elements: [
    // Voice indicator with email icon
    {
      type: "custom",
      id: "voice-pill-email",
      componentName: "VoiceIndicatorPill",
      description: "Voice pill with email/envelope icon in the app slot",
      props: {
        appIcon: "email",
      },
      position: {
        anchor: "center",
        offsetY: -120,
      },
      animation: {
        timing: {
          startFrame: 0,
          durationFrames: 20,
          springConfig: "smooth",
        },
      },
      exit: {
        startFrame: 100,
        preset: "blurOut",
        durationFrames: 15,
      },
    },
    
    // Email compose mockup
    {
      type: "mockup",
      id: "email-mockup",
      mockupType: "card",
      content: {
        type: "email",
        description: `
          Gmail-style email compose window:
          - Header: "New message" with expand/close buttons
          - To field: "Emily@voiceos.com" with avatar
          - Subject: "Follow-Up on Project Update"
          - Body (typewriter): 
            "Hi Emily,
            
            Quick check, would it be easier to move our call to later?
            Happy to work around what's best for you.
            
            Best,
            Jonah"
          - "Attach a file" link
          - Blue "Send email" button
        `,
        typewriter: {
          text: "Hi Emily,\n\nQuick check, would it be easier to move our call to later? Happy to work around what's best for you.\n\nBest,\nJonah",
          charsPerFrame: 2,
          startFrame: 40,
        },
      },
      style: {
        width: 480,
        height: 320,
        glass: { blur: 8, opacity: 0.05 },
      },
      position: {
        anchor: "center",
        offsetY: 20,
      },
      animation: {
        preset: "slideInUp",
        timing: {
          startFrame: 20,
          durationFrames: 30,
          springConfig: "smooth",
        },
        rotate: {
          startAngle: { x: 10, y: 0 },
          endAngle: { x: 0, y: 0 },
        },
      },
      exit: {
        startFrame: 100,
        preset: "blurOut",
        durationFrames: 15,
      },
    },
    
    // Feature label pill
    {
      type: "custom",
      id: "feature-label-email",
      componentName: "FeaturePill",
      description: "Black pill with white text: 'Instantly replies for you'",
      props: {
        text: "Instantly replies for you",
        backgroundColor: "#1A1A1A",
        textColor: "#FFFFFF",
      },
      position: {
        anchor: "center",
        offsetY: 200,
      },
      animation: {
        timing: {
          startFrame: 60,
          durationFrames: 20,
          springConfig: "smooth",
        },
        description: "fadeBlurIn effect",
      },
      exit: {
        startFrame: 100,
        preset: "blurOut",
        durationFrames: 15,
      },
    },
  ],
};

// ============================================================
// SCENE 3D: FEATURE - UNIVERSAL INTEGRATION
// ============================================================

export const scene3D_UniversalIntegration: Scene = {
  id: "feature-universal",
  name: "Universal Integration",
  category: "feature",
  durationFrames: 210, // frames 870-1080
  
  background: {
    type: "solid",
    color: "#FFFFFF",
  },
  
  elements: [
    // Initial title
    {
      type: "text",
      id: "universal-title",
      content: "[VO] is universal",
      style: {
        fontSize: 56,
        fontWeight: 500,
        segments: [
          { text: "[VO]", color: "#000000", bold: true }, // This is the brand icon
          { text: " is ", color: "#000000", bold: false },
          { text: "universal", color: "#2563EB", bold: false },
        ],
      },
      position: {
        anchor: "center",
      },
      animation: {
        preset: "fadeBlurIn",
        unit: "word",
        stagger: 5,
        timing: {
          startFrame: 0,
          durationFrames: 40,
        },
      },
      exit: {
        startFrame: 50,
        preset: "fadeOut",
        durationFrames: 15,
      },
    },
    
    // App icons arc
    {
      type: "iconGrid",
      id: "app-icons-arc",
      layout: "arc",
      icons: [
        { name: "GitHub" },
        { name: "Notion" },
        { name: "Figma" },
        { name: "Slack" },
        { name: "Telegram" },
        { name: "Canva" },
        { name: "Word" },
        { name: "Readwise" },
        { name: "Google" },
        { name: "Gemini" },
        { name: "ChatGPT" },
        { name: "X/Twitter" },
        { name: "LinkedIn" },
        { name: "Notion" },
      ],
      style: {
        iconSize: 52,
        arcRadius: 280,
        arcStartAngle: -150,
        arcEndAngle: -30,
      },
      position: {
        anchor: "center",
      },
      animation: {
        stagger: 2,
        preset: "scaleUp",
        timing: {
          startFrame: 60,
          durationFrames: 60,
          springConfig: "snappy",
        },
      },
      exit: {
        startFrame: 180,
        preset: "fadeOut",
        durationFrames: 20,
      },
    },
    
    // Center text - "Works across all apps"
    {
      type: "text",
      id: "works-across",
      content: "Works across all apps",
      style: {
        fontSize: 48,
        fontWeight: 500,
        segments: [
          { text: "Works across all ", color: "#000000" },
          { text: "apps", color: "#2563EB" },
        ],
      },
      position: {
        anchor: "center",
      },
      animation: {
        preset: "fadeBlurIn",
        unit: "full",
        timing: {
          startFrame: 90,
          durationFrames: 25,
        },
      },
      exit: {
        startFrame: 130,
        preset: "fadeOut",
        durationFrames: 15,
      },
    },
    
    // Voice indicator in center
    {
      type: "custom",
      id: "voice-pill-center",
      componentName: "VoiceIndicatorPill",
      props: { width: 160, height: 48 },
      position: {
        anchor: "center",
      },
      animation: {
        timing: {
          startFrame: 130,
          durationFrames: 20,
        },
      },
      exit: {
        startFrame: 160,
        preset: "fadeOut",
        durationFrames: 15,
      },
    },
    
    // Center text - "with zero setup required"
    {
      type: "text",
      id: "zero-setup",
      content: "with zero setup required",
      style: {
        fontSize: 48,
        fontWeight: 500,
        segments: [
          { text: "with zero setup ", color: "#000000" },
          { text: "required", color: "#2563EB" },
        ],
      },
      position: {
        anchor: "center",
      },
      animation: {
        preset: "fadeBlurIn",
        unit: "full",
        timing: {
          startFrame: 150,
          durationFrames: 25,
        },
      },
      exit: {
        startFrame: 190,
        preset: "fadeOut",
        durationFrames: 15,
      },
    },
  ],
};

// ============================================================
// SCENE 4: CTA - LOGO REVEAL
// ============================================================

export const scene4_CTALogoReveal: Scene = {
  id: "cta-logo",
  name: "Logo and CTA",
  category: "cta",
  durationFrames: 150, // frames 1080-1230 (then hold)
  
  background: {
    type: "solid",
    color: "#FFFFFF",
  },
  
  elements: [
    // VoiceOS Logo
    {
      type: "custom",
      id: "voiceos-logo",
      componentName: "VoiceOSLogo",
      description: `
        The VoiceOS wordmark with custom typography:
        - "v" = downward triangle (▼)
        - "oice" = regular lowercase
        - "o" = solid black circle (●)
        - "s" = regular lowercase
        
        Animation:
        - Each character/shape scales in sequentially
        - 3 frame stagger between characters
        - Use bouncy spring for playful feel
      `,
      props: {
        fontSize: 96,
        fontWeight: 700,
        color: "#000000",
      },
      position: {
        anchor: "center",
        offsetY: -20,
      },
      animation: {
        timing: {
          startFrame: 30,
          durationFrames: 60,
          springConfig: "bouncy",
        },
        description: "Character-by-character scale in with 3 frame stagger",
      },
    },
    
    // Website URL
    {
      type: "text",
      id: "website-url",
      content: "voiceos.com",
      style: {
        fontSize: 24,
        fontWeight: 400,
        color: "#6B7280",
      },
      position: {
        anchor: "center",
        offsetY: 50,
      },
      animation: {
        preset: "fadeBlurIn",
        unit: "full",
        timing: {
          startFrame: 80,
          durationFrames: 25,
          springConfig: "smooth",
        },
      },
    },
  ],
  
  notes: "After logo appears, hold static until end of video. Optional: subtle 1% scale breathing animation on logo.",
};

// ============================================================
// EXPORT ALL SCENES
// ============================================================

export const allScenes: Scene[] = [
  scene1A_AnimatedSphere,
  scene1B_HookTextReveal,
  scene2A_SkyZoom,
  scene2B_VoiceIndicator,
  scene3A_EmailFeature,
  // scene3B_AIChat, (similar structure)
  // scene3C_SocialReply, (similar structure)
  scene3D_UniversalIntegration,
  scene4_CTALogoReveal,
];

// ============================================================
// HELPER: GENERATE PROMPT FOR SCENE
// ============================================================

export function generateScenePrompt(scene: Scene, globalStyles: typeof voiceOSProject.globalStyles): string {
  const durationSeconds = (scene.durationFrames / 30).toFixed(1);
  
  let prompt = `## Scene: ${scene.name}
**ID:** ${scene.id}
**Duration:** ${scene.durationFrames} frames (${durationSeconds}s at 30fps)
**Category:** ${scene.category}

### Background
- Type: ${scene.background.type}
${scene.background.color ? `- Color: ${scene.background.color}` : ''}
${scene.background.preset ? `- Preset: ${scene.background.preset}` : ''}

### Elements
`;

  scene.elements.forEach((element, index) => {
    prompt += `\n#### ${index + 1}. ${element.type.toUpperCase()}: ${element.id}\n`;
    
    if (element.type === 'text') {
      prompt += `- Content: "${element.content}"
- Font Size: ${element.style.fontSize}px
- Font Weight: ${element.style.fontWeight || 400}
- Color: ${element.style.color || '#000000'}
- Position: ${element.position.anchor}${element.position.offsetX ? `, offsetX: ${element.position.offsetX}` : ''}${element.position.offsetY ? `, offsetY: ${element.position.offsetY}` : ''}
- Animation: ${element.animation.preset}, ${element.animation.unit || 'full'} unit${element.animation.stagger ? `, stagger: ${element.animation.stagger}` : ''}
- Timing: start frame ${element.animation.timing.startFrame}, duration ${element.animation.timing.durationFrames}
`;
    } else if (element.type === 'custom') {
      prompt += `- Component: ${element.componentName}
- Description: ${element.description}
- Position: ${element.position.anchor}
- Timing: start frame ${element.animation.timing.startFrame}, duration ${element.animation.timing.durationFrames}
`;
    } else if (element.type === 'mockup') {
      prompt += `- Type: ${element.mockupType}
- Content: ${element.content?.description || element.src}
- Position: ${element.position.anchor}
- Animation: ${element.animation.preset}
`;
    }
    
    if (element.exit) {
      prompt += `- Exit: ${element.exit.preset || 'custom'} at frame ${element.exit.startFrame}\n`;
    }
  });

  if (scene.notes) {
    prompt += `\n### Notes\n${scene.notes}\n`;
  }
  
  prompt += `\n### Global Styles Reference
- Primary Color: ${globalStyles.colors.primary}
- Accent Color: ${globalStyles.colors.accent}
- Font Family: ${globalStyles.typography.fontFamily}
- Default Spring: ${globalStyles.animation.defaultSpring}
`;

  return prompt;
}
