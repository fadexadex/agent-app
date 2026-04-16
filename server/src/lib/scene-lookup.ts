import { readFile } from "fs/promises";
import { resolve, join } from "path";

const REMOTION_DIR = resolve(process.cwd(), "../remotion");

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Given a sceneId, returns the source file path relative to remotion/
 * by parsing Root.tsx (sceneId → componentName) and scenes/index.ts
 * (componentName → file path).
 *
 * Returns null if the scene is not registered or the file cannot be found.
 */
export async function resolveSceneFilePath(sceneId: string): Promise<string | null> {
  try {
    // Step 1: Parse Root.tsx to find the component name for this sceneId
    const rootPath = join(REMOTION_DIR, "src/Root.tsx");
    const rootContent = await readFile(rootPath, "utf-8");

    // Match:  id="scene-id" ... component={ComponentName}
    // The 's' flag makes . match newlines so it works across attribute lines.
    const compositionRegex = new RegExp(
      `id="${escapeRegex(sceneId)}"[^>]*component=\\{(\\w+)\\}`,
      "s"
    );
    const compMatch = rootContent.match(compositionRegex);
    if (!compMatch) return null;
    const componentName = compMatch[1];

    // Step 2: Parse scenes/index.ts to find the file path for that component
    const indexPath = join(REMOTION_DIR, "src/scenes/index.ts");
    const indexContent = await readFile(indexPath, "utf-8");

    // Match:  export { ComponentName } from './folder/FileName'
    const exportRegex = new RegExp(
      `export\\s+\\{\\s*${escapeRegex(componentName)}\\s*\\}\\s+from\\s+['"](\\.[\\/][^'"]+)['"]`
    );
    const exportMatch = indexContent.match(exportRegex);
    if (!exportMatch) return null;

    // exportMatch[1] is like  "./app-promo/HookIntro"
    const relativePath = `src/scenes/${exportMatch[1].replace(/^\.[\\/]/, "")}.tsx`;
    return relativePath;
  } catch {
    return null;
  }
}
