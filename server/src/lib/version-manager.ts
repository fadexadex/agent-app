import { readdir } from "fs/promises";

/**
 * Scans the given directory for versioned MP4 files (v1.mp4, v2.mp4, …)
 * and returns the next version number.
 * Returns 1 if the directory is empty or does not yet exist.
 */
export async function getNextVersion(outputDir: string): Promise<number> {
  try {
    const files = await readdir(outputDir);
    const versionFiles = files.filter((f) => /^v\d+\.mp4$/.test(f));
    if (versionFiles.length === 0) return 1;
    const numbers = versionFiles.map((f) =>
      parseInt(f.replace(/^v/, "").replace(/\.mp4$/, ""), 10)
    );
    return Math.max(...numbers) + 1;
  } catch {
    // Directory doesn't exist yet — first version
    return 1;
  }
}
