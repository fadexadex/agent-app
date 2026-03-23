# Video Generation Framework

A structured framework for generating Remotion video scenes using AI. This framework provides schemas, templates, and tools for consistent, high-quality scene generation.

## Directory Structure

```
video-gen-framework/
├── schema/
│   ├── scene.types.ts      # TypeScript type definitions
│   └── scene.schema.json   # JSON Schema for validation
├── prompts/
│   ├── DIRECTOR_SYSTEM_PROMPT.md   # System prompt for the AI agent
│   └── SCENE_TEMPLATES.md          # Reusable prompt templates
├── examples/
│   ├── voiceos-scenes.ts           # Full TypeScript scene definitions
│   └── scene-email-feature.json    # Simplified JSON example
└── utils/
    └── prompt-builder.ts           # Prompt generation utilities
```

## Quick Start

### 1. Define a Scene (JSON Format)

```json
{
  "scene": {
    "id": "my-scene",
    "name": "My Scene Name",
    "category": "feature",
    "duration": 120,
    "background": {
      "type": "solid",
      "color": "#FFFFFF"
    },
    "elements": [
      {
        "type": "text",
        "id": "main-text",
        "text": "Hello World",
        "style": {
          "size": 56,
          "weight": 700,
          "color": "#000000"
        },
        "position": { "anchor": "center" },
        "animation": {
          "preset": "fadeBlurIn",
          "unit": "word",
          "stagger": 4,
          "timing": { "start": 0, "duration": 30, "spring": "smooth" }
        }
      }
    ]
  }
}
```

### 2. Generate Prompt

Combine the system prompt with your scene definition:

```typescript
import { ScenePromptBuilder } from './utils/prompt-builder';
import { myProject } from './my-project';

const builder = new ScenePromptBuilder(
  './prompts/DIRECTOR_SYSTEM_PROMPT.md',
  './path/to/COMPONENT-CATALOG.md',
  myProject
);

const prompt = builder.buildScenePrompt(myScene);
console.log(prompt.prompt);
```

### 3. Send to AI

Send the generated prompt to Claude or another LLM. The system prompt ensures the AI:
- Uses your component library correctly
- Follows Remotion best practices
- Produces production-ready code

## Scene Schema

### Element Types

| Type | Description | Use When |
|------|-------------|----------|
| `text` | Animated text with presets | Headlines, labels, captions |
| `mockup` | Device/browser frames | UI demos, app screenshots |
| `custom` | Custom components | Complex/unique elements |
| `iconGrid` | Grid/arc of icons | Integration showcases |
| `shape` | Basic shapes | Decorative elements |

### Animation Presets

| Preset | Description |
|--------|-------------|
| `fadeBlurIn` | Fade in with blur clearing |
| `slideInUp` | Slide up from below |
| `slideInDown` | Slide down from above |
| `slideInLeft` | Slide in from left |
| `slideInRight` | Slide in from right |
| `scaleUp` | Scale up from small |
| `typewriter` | Character-by-character reveal |
| `glitchReveal` | Glitch effect reveal |
| `maskSlideUp` | Mask-based slide up |

### Spring Configs

| Config | Use Case |
|--------|----------|
| `smooth` | Standard UI animations (`{ damping: 200 }`) |
| `snappy` | Quick, responsive (`{ damping: 20, stiffness: 200 }`) |
| `bouncy` | Playful entrances (`{ damping: 8 }`) |
| `heavy` | Slow, weighty motion (`{ damping: 15, stiffness: 80, mass: 2 }`) |

## Testing Scene Structures

The framework is designed for iterative testing. Here's how to optimize your prompts:

### 1. Start Simple

Begin with a minimal scene definition:

```json
{
  "scene": {
    "id": "test-001",
    "name": "Test Scene",
    "duration": 60,
    "background": { "type": "solid", "color": "#FFFFFF" },
    "elements": [
      {
        "type": "text",
        "id": "test-text",
        "text": "Test",
        "position": { "anchor": "center" },
        "animation": {
          "preset": "fadeBlurIn",
          "timing": { "start": 0, "duration": 30 }
        }
      }
    ]
  }
}
```

### 2. Add Complexity Incrementally

Add one element at a time and verify output quality.

### 3. Track What Works

Document which combinations produce the best results:

```markdown
## Findings

### Text Animation
- ✅ `fadeBlurIn` + `word` unit + `stagger: 4` = smooth reveals
- ❌ `typewriter` + `stagger` = conflicts, don't combine

### Mockups
- ✅ `rotate3d` with `startX: 10` = nice entrance
- ✅ Glass effect works best with `blur: 8, opacity: 0.05`

### Timing
- ✅ Exit animations work best 15-20 frames before scene end
- ✅ Stagger exits by 3-5 frames for natural feel
```

## System Prompt Customization

The `DIRECTOR_SYSTEM_PROMPT.md` can be customized for your needs:

### Add Custom Components

```markdown
### MyCustomComponent
**Import:** `import { MyCustomComponent } from "@/components/MyCustomComponent";`

**Props:**
- `size`: number (default: 100)
- `color`: string (default: "#000000")

**Example:**
\`\`\`tsx
<MyCustomComponent size={120} color="#2563EB" />
\`\`\`
```

### Add Project-Specific Rules

```markdown
## Project Rules

1. Always use brand colors: primary=#000000, accent=#2563EB
2. Minimum text size: 32px for headlines, 18px for labels
3. All scenes must have 15-frame exit transitions
```

## Validation

The framework includes validation helpers:

```typescript
import { validateGeneratedCode } from './utils/prompt-builder';

const result = validateGeneratedCode(generatedCode, {
  mustInclude: ['useCurrentFrame', 'AbsoluteFill'],
  mustNotInclude: ['CSS animation', '@keyframes']
});

if (!result.valid) {
  console.error('Validation failed:', result.errors);
}
```

## Example Workflow

```typescript
// 1. Load your scene definition
const sceneJson = require('./examples/scene-email-feature.json');

// 2. Build the prompt
const builder = new ScenePromptBuilder(systemPrompt, componentCatalog, project);
const { prompt, validation } = builder.buildScenePrompt(sceneJson.scene);

// 3. Send to AI (pseudo-code)
const generatedCode = await sendToAI(prompt);

// 4. Validate output
const validationResult = validateGeneratedCode(generatedCode, validation);

// 5. If valid, save to file
if (validationResult.valid) {
  writeFileSync(`./scenes/${sceneJson.scene.id}.tsx`, generatedCode);
}
```

## Best Practices

### Scene Definition

1. **Use descriptive IDs**: `feature-email-reply` not `scene1`
2. **Include notes**: Help the AI understand context
3. **Be specific about timing**: Exact frame numbers, not vague durations
4. **Describe custom elements thoroughly**: The AI can't see images

### Prompting

1. **One scene at a time**: Generate scenes individually for better quality
2. **Validate before combining**: Test each scene before composition
3. **Use the component library**: Don't reinvent existing components
4. **Include exit animations**: Every element should have an exit

### Code Quality

1. **Always clamp interpolations**: Prevent animation overshoot
2. **Use springs for entrances**: More natural motion
3. **Use frame subtraction for delays**: Not `delay` parameter
4. **Keep components stateless**: Use frame-based logic

## Troubleshooting

### Animation Not Working

- Check if `useCurrentFrame()` is being called
- Verify interpolation ranges are correct
- Ensure spring config is valid

### Component Not Found

- Check import paths match your project structure
- Verify component exists in the catalog

### Timing Issues

- Remember that `useCurrentFrame()` returns local frame in Sequences
- Account for transition overlaps in TransitionSeries

## Contributing

To improve the framework:

1. Add new element types to `scene.types.ts`
2. Update JSON schema in `scene.schema.json`
3. Add examples to demonstrate usage
4. Document findings in this README

---

*This framework is designed for the Campor video generation pipeline.*
