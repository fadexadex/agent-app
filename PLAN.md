# Plan: Group Scenes by Project Folder & Fix AI Looping

## Problem Analysis
1. **Folder Structure**: Currently, the AI places every single scene into its own uniquely named folder (e.g. `HookIntro/HookIntro.tsx`). The user wants all scenes belonging to a specific video/project to go into a single shared folder (e.g. `MyProject/HookIntro.tsx`, `MyProject/FeatureDemo.tsx`).
2. **AI Looping**: The AI gets stuck in an infinite loop (`writeSceneCode` -> `triggerPreview` -> fail -> `writeSceneCode` -> ...). This happens because our safety check (`esbuild src/Root.tsx`) evaluates the *entire* Remotion registry. If the user has *any* pre-existing broken scene in their project, `esbuild` fails. The AI sees the failure, assumes its newly generated code is the culprit, and tries to "fix" it repeatedly, causing the loop.

## Implementation Steps

### 1. Introduce `projectFolder` parameter
- **`server/src/tools/write-scene.ts`**:
  - Add `projectFolder` to the `inputSchema` (string, describe it as the "Folder name to group all scenes for the current video project").
  - Update `safeScenesPath` to sanitize both `projectFolder` and `fileName`.
  - Construct the file path as `remotion/src/scenes/[projectFolder]/[fileName].tsx`.
- **`server/src/tools/trigger-preview.ts`**:
  - Add `projectFolder` to the `inputSchema`.
  - Update `updateScenesIndex` to write the barrel export as: `export { ComponentName } from "./[projectFolder]/[fileName]";`.
  - Fix the regex in `updateScenesIndex` to properly clear old exports based on this new path structure.

### 2. Isolate Compilation Check (Fix Looping)
- Modify the `esbuild` command in `triggerPreviewTool.execute`.
- Instead of checking the whole `Root.tsx` (which catches unrelated errors), check ONLY the newly generated file:
  `npx esbuild src/scenes/${projectFolder}/${fileName}.tsx --bundle --external:remotion --external:react --external:react-dom --external:@remotion/transitions --external:zod --outfile=/dev/null`
- This ensures the AI is only penalized and asked to self-heal if its *own* generated code has syntax/import errors, stopping the false-positive loops.

### 3. Update AI Instructions
- Edit `remotion/prompts/DIRECTOR_SYSTEM_PROMPT.md` to explicitly document the `projectFolder` argument.
- Instruct the AI to choose a descriptive `projectFolder` name (e.g., `app-promo`, `tiktok-hook`) and use it consistently for all scenes in the current request.

### 4. Update Tests
- Update `server/src/__tests__/tools.test.ts` and `integration.test.ts` to include the new `projectFolder` argument in tool calls.