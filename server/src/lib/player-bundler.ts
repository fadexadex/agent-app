/**
 * player-bundler.ts
 *
 * Bundles a single Remotion scene + the PlayerApp shell into a standalone
 * static HTML page served at /previews/player/<sceneId>/index.html.
 *
 * This is the production fallback path — used when the Vite dev server
 * (port 3200) is not running. The bundle takes ~3–5 seconds and is created
 * automatically by triggerPreview after registering each composition.
 *
 * Output layout:
 *   server/public/previews/player/<sceneId>/index.html
 *   server/public/previews/player/<sceneId>/bundle.js
 */

import { build } from "esbuild";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";

const SERVER_DIR = resolve(process.cwd());
const REMOTION_DIR = resolve(SERVER_DIR, "../remotion");
const PUBLIC_PREVIEWS_DIR = resolve(SERVER_DIR, "public/previews");

export interface BundleResult {
  success: boolean;
  playerUrl?: string;
  error?: string;
}

/**
 * Build a standalone player bundle for a single scene.
 *
 * @param sceneId       Remotion composition ID (e.g. "hook-intro")
 * @param componentName Exported React component name (e.g. "HookIntro")
 * @param durationFrames Number of frames in the composition
 * @param width          Composition width in pixels
 * @param height         Composition height in pixels
 * @param fps            Frames per second
 */
export async function buildPlayerBundle(
  sceneId: string,
  componentName: string,
  durationFrames: number,
  width: number,
  height: number,
  fps: number,
): Promise<BundleResult> {
  const outputDir = join(PUBLIC_PREVIEWS_DIR, "player", sceneId);

  try {
    await mkdir(outputDir, { recursive: true });

    // ── Write a tiny entry point that hard-codes the scene params ────────────
    // This avoids the need for URL query-param parsing in the bundle and makes
    // the output fully self-contained.
    const entryPath = join(outputDir, "_entry.tsx");
    const entryCode = `
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { ${componentName} } from "${REMOTION_DIR}/src/scenes";

const root = document.getElementById("root")!;
createRoot(root).render(
  <StrictMode>
    <Player
      component={${componentName}}
      durationInFrames={${durationFrames}}
      fps={${fps}}
      compositionWidth={${width}}
      compositionHeight={${height}}
      style={{ width: "100%", height: "100%" }}
      controls={false}
      inputProps={{}}
    />
  </StrictMode>
);
`.trimStart();

    await writeFile(entryPath, entryCode, "utf-8");

    // ── Run esbuild ──────────────────────────────────────────────────────────
    const bundlePath = join(outputDir, "bundle.js");

    await build({
      entryPoints: [entryPath],
      bundle: true,
      outfile: bundlePath,
      format: "iife",
      platform: "browser",
      jsx: "automatic",
      loader: { ".tsx": "tsx", ".ts": "ts", ".css": "css" },
      alias: {
        "@": join(REMOTION_DIR, "src"),
      },
      external: [
        // Remotion's lambda / server-side modules that shouldn't end up in the browser bundle
        "fs",
        "path",
        "child_process",
        "os",
        "crypto",
      ],
      define: {
        "process.env.NODE_ENV": '"production"',
      },
      minify: true,
      sourcemap: false,
    });

    // ── Write the HTML shell ─────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Player — ${sceneId}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
      #root { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script src="./bundle.js"></script>
  </body>
</html>`;

    await writeFile(join(outputDir, "index.html"), html, "utf-8");

    const playerUrl = `/previews/player/${sceneId}/index.html`;

    console.log(`[player-bundler] ✅ Built player bundle for ${sceneId} → ${playerUrl}`);
    return { success: true, playerUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[player-bundler] ❌ Failed to build bundle for ${sceneId}:`, message);
    return { success: false, error: message };
  }
}

/**
 * Returns true if a production bundle already exists for this sceneId.
 * triggerPreview can skip rebuilding if only re-registering.
 */
export function playerBundleExists(sceneId: string): boolean {
  const htmlPath = join(PUBLIC_PREVIEWS_DIR, "player", sceneId, "index.html");
  return existsSync(htmlPath);
}
