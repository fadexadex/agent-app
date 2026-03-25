# Plan: Improve Preview UX

## Objective
Enhance the video preview experience by providing a dedicated, clean, full-screen (or near full-screen) modal. This will allow users to play the entire generated video start-to-finish without the cramped confines of the editor UI, ensuring they can verify output quality before exporting.

## Proposed Changes

### 1. Create a `FullscreenPreviewModal` Component
- **Location**: `client/src/components/editor/FullscreenPreviewModal.tsx`
- **Purpose**: A dialog/modal that takes up 90-100% of the screen.
- **Features**:
  - Dark/cinematic backdrop.
  - Large video player element to play the concatenated scenes or a unified video preview.
  - Custom playback controls (Play/Pause, Timeline Scrubber, Mute/Unmute, Fullscreen toggle).
  - "Close" button to return to the editor.
  - "Export" button directly in the modal for quick access if the quality is satisfactory.

### 2. Update the Video Playback Logic
- Currently, `EditorPage` stitches scenes together with a custom `setInterval` timeline.
- In the modal, we can either:
  - Render a unified `<video>` element if the backend provides a combined preview (or use `@remotion/player` if we integrate it).
  - Re-use the existing scene-stitching logic but map it to a large, prominent player view inside the modal.

### 3. Update the Editor UI Trigger
- Change the current "Preview" button in `EditorPage.tsx` header (which plays in the small `VideoOutput` panel).
- When the user clicks "Preview Video" (or a new "Fullscreen Preview" icon), it opens the `FullscreenPreviewModal` and automatically starts playing from the beginning.

### 4. Integration with Export Flow
- Add a clear Call-to-Action (CTA) inside the preview modal: "Looks good? Continue to Export".
- This bridges the gap between verifying the quality and navigating to `ExportPage.tsx`.

## Technical Implementation Steps
1. Scaffold `FullscreenPreviewModal.tsx` using `shadcn/ui` Dialog or a custom fixed overlay.
2. Port the playback state (`isPlaying`, `playheadTime`) from `EditorPage.tsx` into the modal (or pass via props/context).
3. Ensure the video elements scale correctly (`object-contain`, `w-full`, `h-full`) to support different aspect ratios in a near-full-screen view.
4. Add keyboard shortcuts (e.g., `Space` to play/pause, `Esc` to close, `F` for native browser fullscreen).
