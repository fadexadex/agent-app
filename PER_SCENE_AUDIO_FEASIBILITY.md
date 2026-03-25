# Per-Scene Audio Feasibility

Managing audio on a scene-by-scene basis is highly feasible but requires a shift in how audio is processed in this project.

## Current Limitations (Global Audio MVP)
- **Architecture**: Audio is currently stored on the `Project` level. It plays continuously via a single hidden `<audio>` element on the frontend and is mixed with the final concatenated video via `ffmpeg` amix filters in the `/api/export` backend route.
- **Why it's limited**: This makes it impossible to naturally fade out music per-scene, sync music hits to specific scene transitions, or use different tracks per scene without extremely complex `ffmpeg` timeline filtering.

## Path to Per-Scene Audio (Phase 2)
Instead of handling audio via a global HTML element and an `ffmpeg` post-processing pass, we should shift audio management entirely into **Remotion**:

1. **Schema Update**: Move `audioTrack` from `StoredProject` to the `Scene` interface.
2. **Remotion Integration**:
   - The AI agent (or the React app directly) should inject an `<Audio src={...} />` component from Remotion directly into each scene's TSX file.
   - This allows the music to be part of the Remotion build process. It will be naturally clipped to the scene's duration and automatically included in the rendered MP4s for each scene.
3. **Frontend Playback**:
   - The React UI can stop manually syncing a hidden `<audio>` element.
   - We would rely on the `videoUrl` playback which will already have the mixed scene audio baked in. 
   - For the Remotion Studio preview iframe, Remotion natively handles playback of `<Audio>` elements within the canvas.
4. **Export Logic**:
   - Remove the custom `ffmpeg` audio injection in `server/src/routes/export.ts`.
   - The `ffmpeg` concatenation step will simply join the MP4s together, and the scene-by-scene audio will naturally follow.

This would create a significantly more robust, timeline-accurate audio implementation.