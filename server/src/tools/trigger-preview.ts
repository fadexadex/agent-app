import { tool } from "ai";
import { z } from "zod";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join, resolve } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const REMOTION_DIR = resolve(process.cwd(), "../remotion");
const SCENES_DIR = join(REMOTION_DIR, "src/scenes");
const ROOT_FILE = join(REMOTION_DIR, "src/Root.tsx");
const SCENES_INDEX = join(SCENES_DIR, "index.ts");

// Tool for registering a scene and triggering preview
export const triggerPreviewTool = tool({
  description:
    "Register a scene in Root.tsx and return the preview URL. Call this after writeSceneCode to make the scene viewable in Remotion Studio. If this tool returns an error, the scene failed to compile and you MUST fix the TypeScript/React code and call writeSceneCode again before retrying this tool.",
  inputSchema: z.object({
    projectFolder: z
      .string()
      .describe(
        "The project folder name used in writeSceneCode to group all scenes for this video (e.g., 'app-promo', 'tiktok-hook')"
      ),
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
    projectFolder,
    sceneId,
    componentName,
    fileName,
    durationFrames,
    width = 1920,
    height = 1080,
    fps = 30,
  }) => {
    // Sanitize folder name
    const sanitizedFolder = projectFolder.replace(/[^a-zA-Z0-9_-]/g, "");
    
    // Store original contents for rollback
    let originalScenesIndex = "";
    let originalRootFile = "";

    try {
      try {
        originalScenesIndex = await readFile(SCENES_INDEX, "utf-8");
      } catch (e) {
        originalScenesIndex = "// Auto-generated barrel export for scenes\n";
      }
      try {
        originalRootFile = await readFile(ROOT_FILE, "utf-8");
      } catch (e) {
        // Assume Root.tsx exists
      }

      // Ensure scenes directory exists
      await mkdir(SCENES_DIR, { recursive: true });

      // Update scenes/index.ts barrel export
      await updateScenesIndex(sanitizedFolder, fileName, componentName);

      // Update Root.tsx to add the composition
      await updateRootFile(
        sceneId,
        componentName,
        durationFrames,
        width,
        height,
        fps,
      );

      // Verify the build - ONLY check the specific newly generated file
      // Checking only the target file prevents the AI from getting stuck in loops 
      // if unrelated files in the project are broken.
      try {
        await execAsync(`npx esbuild src/scenes/${sanitizedFolder}/${fileName}.tsx --bundle --external:remotion --external:react --external:react-dom --external:@remotion/transitions --external:zod --outfile=/dev/null`, { cwd: REMOTION_DIR });
      } catch (checkError: any) {
        // Compilation failed! Rollback the changes to prevent poisoning the registry
        await writeFile(SCENES_INDEX, originalScenesIndex, "utf-8");
        if (originalRootFile) {
          await writeFile(ROOT_FILE, originalRootFile, "utf-8");
        }
        
        console.error("Compilation check failed for scene", sceneId);
        
        const stdoutStr = checkError.stdout ? checkError.stdout.toString() : "";
        const stderrStr = checkError.stderr ? checkError.stderr.toString() : "";
        
        return {
          success: false,
          sceneId,
          error: "Build failed! The generated scene code contains syntax errors or invalid imports/exports. Please fix the TypeScript/React errors and call writeSceneCode again.\n\nError output:\n" + stdoutStr + "\n" + stderrStr,
        };
      }

      const previewUrl = `http://localhost:3100/preview/${sceneId}`;

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
      // In case of any unexpected error during update, rollback
      if (originalScenesIndex) await writeFile(SCENES_INDEX, originalScenesIndex, "utf-8");
      if (originalRootFile) await writeFile(ROOT_FILE, originalRootFile, "utf-8");

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
  folderName: string,
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

  const exportLine = `export { ${componentName} } from "./${folderName}/${fileName}";`;

  // Remove any existing export that uses the exact same componentName to prevent duplicate exports
  const componentRegex = new RegExp(`export\\s+\\{\\s*${componentName}\\s*\\}\\s+from\\s+['"][^'"]+['"];?\\n?`, 'g');
  content = content.replace(componentRegex, '');

  // Remove any existing export from the same path, assuming the file is being overwritten
  const fileRegex = new RegExp(`export\\s+\\{[^}]+\\}\\s+from\\s+['"]\\./${folderName}/${fileName}['"];?\\n?`, 'g');
  content = content.replace(fileRegex, '');

  // Add the fresh export
  content = content.trimEnd() + "\n" + exportLine + "\n";

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
