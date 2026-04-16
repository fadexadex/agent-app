<!-- 
  This section was removed from DIRECTOR_SYSTEM_PROMPT.md for demo speed.
  To restore: paste from "## Scene Assets" through the end of the staticFile explanation
  back into DIRECTOR_SYSTEM_PROMPT.md after line 10 (Core Animation Rules section).
-->

## Scene Assets — When and How to Use `generateImage`

### When to call it
Call `generateImage` whenever the scene needs a **real-world visual element** that Remotion code cannot produce:
- A physical product, device, or object
- A person or character
- A brand logo or icon that doesn't exist in code
- A realistic background texture or surface
- A UI screenshot / app mockup rendered as a flat image
- An infographic or chart that needs a photorealistic look

Do **NOT** call it for shapes, gradients, animated bars, typographic effects, or anything buildable with `div` + CSS — build those with code.

### Asset types available
| assetType | Best for |
|---|---|
| `product` | Isolated product on white — phones, bottles, packaging |
| `logo` | Brand marks, logomarks |
| `icon` | Single UI or concept icons |
| `person` | Portraits, full-body cutouts |
| `illustration` | Flat vector-style artwork |
| `texture` | Seamless materials, fabric, surfaces |
| `screenshot` | App / website UI mockups |
| `background` | Abstract graphic backdrops |
| `chart` | Data visualisations, infographics |
| `other` | Anything else — describe fully |

### How to use the result in scene code
The tool returns `staticFilePath` (e.g. `"generated/abc123.png"`). Always use `staticFile()`:

```tsx
import { staticFile } from 'remotion';

// ✅ CORRECT — works for both local render and Lambda
<img
  src={staticFile('generated/abc123.png')}
  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
/>

// ❌ WRONG — never use imageUrl directly
<img src="/generated/abc123.png" />

// ❌ WRONG — never use just the UUID without the folder
<img src={staticFile('abc123.png')} />
```

The tool also returns a ready-to-paste `usageExample` string — copy it into the scene directly.

`staticFile('generated/uuid.png')` resolves to `remotion/public/generated/uuid.png` on disk.
That directory is included when `deploySite` uploads to S3, so Lambda renders work too.
