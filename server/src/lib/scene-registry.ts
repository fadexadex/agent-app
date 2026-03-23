import { readFile } from "fs/promises";
import { join, resolve } from "path";

const REMOTION_DIR = resolve(process.cwd(), "../remotion");
const ROOT_FILE = join(REMOTION_DIR, "src/Root.tsx");

export interface SceneConfig {
  id: string;
  componentName: string;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

/**
 * Parse Root.tsx to extract registered scenes/compositions.
 */
export async function getRegisteredScenes(): Promise<SceneConfig[]> {
  try {
    const content = await readFile(ROOT_FILE, "utf-8");
    const scenes: SceneConfig[] = [];

    // Match Composition elements
    const compositionRegex =
      /<Composition[\s\S]*?id="([^"]+)"[\s\S]*?component=\{(\w+)\}[\s\S]*?durationInFrames=\{(\d+)\}[\s\S]*?fps=\{(\d+)\}[\s\S]*?width=\{(\d+)\}[\s\S]*?height=\{(\d+)\}[\s\S]*?\/>/g;

    let match;
    while ((match = compositionRegex.exec(content)) !== null) {
      scenes.push({
        id: match[1],
        componentName: match[2],
        durationInFrames: parseInt(match[3], 10),
        fps: parseInt(match[4], 10),
        width: parseInt(match[5], 10),
        height: parseInt(match[6], 10),
      });
    }

    return scenes;
  } catch (error) {
    console.error("Error reading Root.tsx:", error);
    return [];
  }
}

/**
 * Check if a scene with the given ID already exists.
 */
export async function sceneExists(sceneId: string): Promise<boolean> {
  const scenes = await getRegisteredScenes();
  return scenes.some((scene) => scene.id === sceneId);
}
