import { tool } from "ai";
import { z } from "zod";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, resolve } from "path";

const REMOTION_DIR = resolve(process.cwd(), "../remotion");
const SCENES_DIR = join(REMOTION_DIR, "src/scenes");
const ROOT_FILE = join(REMOTION_DIR, "src/Root.tsx");
const SCENES_INDEX = join(SCENES_DIR, "index.ts");

// Tool for registering a scene and triggering preview
export const triggerPreviewTool = tool({
  description:
    "Register a scene in Root.tsx and return the preview URL. Call this after writeSceneCode to make the scene viewable in Remotion Studio.",
  inputSchema: z.object({
    sceneId: z
      .string()
      .describe("The scene ID used in writeSceneCode (e.g., 'hook-intro')"),
    componentName: z
      .string()
      .describe(
        "The exported component name from the scene file (e.g., 'HookIntro')",
      ),
    fileName: z
      .string()
      .describe("The file name without extension (e.g., 'HookIntro')"),
    durationFrames: z
      .number()
      .describe(
        "Duration of the scene in frames (at 30fps, 90 frames = 3 seconds)",
      ),
    width: z
      .number()
      .optional()
      .default(1920)
      .describe("Video width in pixels"),
    height: z
      .number()
      .optional()
      .default(1080)
      .describe("Video height in pixels"),
    fps: z.number().optional().default(30).describe("Frames per second"),
  }),
  execute: async ({
    sceneId,
    componentName,
    fileName,
    durationFrames,
    width = 1920,
    height = 1080,
    fps = 30,
  }) => {
    try {
      // Ensure scenes directory exists
      await mkdir(SCENES_DIR, { recursive: true });

      // Update scenes/index.ts barrel export
      await updateScenesIndex(fileName, componentName);

      // Update Root.tsx to add the composition
      await updateRootFile(
        sceneId,
        componentName,
        durationFrames,
        width,
        height,
        fps,
      );

      const previewUrl = `http://localhost:3100/`;

      return {
        success: true,
        sceneId,
        componentName,
        previewUrl,
        config: {
          durationFrames,
          width,
          height,
          fps,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error triggering preview";
      return {
        success: false,
        sceneId,
        error: message,
      };
    }
  },
});

// Update the scenes barrel export file
async function updateScenesIndex(
  fileName: string,
  componentName: string,
): Promise<void> {
  let content = "";

  try {
    content = await readFile(SCENES_INDEX, "utf-8");
  } catch {
    // File doesn't exist yet, start fresh
    content = "// Auto-generated barrel export for scenes\n";
  }

  const exportLine = `export { ${componentName} } from "./${fileName}";`;

  // Check if export already exists
  if (content.includes(`from "./${fileName}"`)) {
    // Update existing export
    content = content.replace(
      new RegExp(`export \\{[^}]+\\} from "\\./${fileName}";`),
      exportLine,
    );
  } else {
    // Add new export
    content = content.trimEnd() + "\n" + exportLine + "\n";
  }

  await writeFile(SCENES_INDEX, content, "utf-8");
}

// Update Root.tsx to add/update a Composition
async function updateRootFile(
  sceneId: string,
  componentName: string,
  durationFrames: number,
  width: number,
  height: number,
  fps: number,
): Promise<void> {
  let content = await readFile(ROOT_FILE, "utf-8");

  // Check if we need to add the scenes import
  const scenesImportRegex = /import \{([^}]+)\} from "\.\/scenes";/;
  const scenesImportMatch = content.match(scenesImportRegex);

  if (scenesImportMatch) {
    // Update existing scenes import
    const existingImports = scenesImportMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!existingImports.includes(componentName)) {
      existingImports.push(componentName);
      const newImport = `import { ${existingImports.join(", ")} } from "./scenes";`;
      content = content.replace(scenesImportRegex, newImport);
    }
  } else {
    // Add new scenes import after existing imports
    const lastImportIndex = content.lastIndexOf("import ");
    const endOfLastImport = content.indexOf("\n", lastImportIndex);
    const newImport = `\nimport { ${componentName} } from "./scenes";`;
    content =
      content.slice(0, endOfLastImport + 1) +
      newImport +
      content.slice(endOfLastImport + 1);
  }

  // Create the new Composition JSX
  const compositionJSX = `      <Composition
        id="${sceneId}"
        component={${componentName}}
        durationInFrames={${durationFrames}}
        fps={${fps}}
        width={${width}}
        height={${height}}
      />`;

  // Check if this composition already exists
  const compositionRegex = new RegExp(
    `<Composition[^>]*id="${sceneId}"[\\s\\S]*?/>`,
    "g",
  );

  if (compositionRegex.test(content)) {
    // Update existing composition
    content = content.replace(compositionRegex, compositionJSX);
  } else {
    // Add new composition before closing fragment
    const closingFragment = "</>";
    const insertIndex = content.lastIndexOf(closingFragment);
    if (insertIndex !== -1) {
      content =
        content.slice(0, insertIndex) +
        compositionJSX +
        "\n    " +
        content.slice(insertIndex);
    }
  }

  await writeFile(ROOT_FILE, content, "utf-8");
}
