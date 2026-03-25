# Export Feature Implementation Plan

## Overview
The goal is to implement a complete export pipeline for the Remotion video project. Currently, the system can render individual scenes for preview using the `renderScene` tool, but there is no way to export the final consolidated video (or even a specific scene directly from the UI export page) with varying formats and resolutions. 

## Requirements
1. **Render/compile finished video file:** Allow the user to export the full sequence of scenes or a selected scene.
2. **Support formats/codecs:** Support Resolution (720p, 1080p, 4K), Format (MP4, WebM), and Aspect Ratio (16:9, 9:16, 1:1) from the `ExportPage.tsx` UI.
3. **Progress feedback:** Provide real-time or polled progress feedback to the user while the video is rendering.

## Architecture & Steps

### 1. Server-Side Export Endpoint
Create a new API route in the server (e.g., `server/src/routes/export.ts` or add to an existing route) that handles export requests.
- **Input:** `sceneId` (or a special ID like `main-sequence` if exporting all scenes combined), `resolution`, `format`, `aspectRatio`.
- **Process:**
  - Spawn the `remotion render` CLI command, similar to `server/src/tools/render-scene.ts`.
  - Pass the appropriate flags based on the format (`--codec` or `--output` file extension).
  - Manage a rendering queue or active render map to track progress.
- **Progress Tracking:** 
  - Remotion's CLI outputs progress logs. We can parse `stdout` for progress percentages and store them in memory.
  - Create a `/api/export/status/:exportId` endpoint for the client to poll.

### 2. Remotion Master Composition
To export the *entire* video (all generated scenes sequentially), we need a "Master" composition in `remotion/src/Root.tsx` that uses Remotion's `<Series>` component to string all active scenes together.
- A script/tool needs to dynamically update this Master composition whenever scenes are added or modified, or the export endpoint can accept an array of scene IDs to stitch together dynamically.

### 3. Client-Side Export Integration
Update `client/src/pages/ExportPage.tsx`:
- Change the `handleDownload` function to make a POST request to the new export API endpoint.
- Implement polling to the `/api/export/status/:exportId` endpoint.
- Display a progress bar or percentage indicator in the UI while rendering.
- When complete, automatically trigger the file download using a standard `<a>` tag with the `download` attribute pointing to the finished file URL.

### 4. Automated Testing
Include writing and running tests to validate the functionality of the export feature:
- Add unit/integration tests for the new `export` API routes on the server.
- Ensure the server correctly starts the remotion CLI and tracks the progress.
- Verify the format options and aspect ratio conversions behave correctly.

## Technical Details (Remotion CLI)
- **Resolution:** Can be overridden via CLI flags or parameterized composition props.
- **Format/Codec:** 
  - MP4: default.
  - WebM: `--codec=vp8` or `--codec=vp9`.
- **Aspect Ratio:** This usually requires changing the composition's `width` and `height`. We can pass input props to the composition or have specific compositions for different aspect ratios.

## Next Steps (Execution)
Once this plan is approved, I will exit Plan Mode and begin modifying the necessary files:
1. Create/Update server API for exporting and progress tracking.
2. Update `ExportPage.tsx` to call the API and handle the progress UI.
3. Ensure Remotion handles the custom resolutions and formats correctly.