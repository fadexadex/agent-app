import { Router, Request, Response } from "express";
import { spawn, ChildProcess } from "child_process";
import { mkdir, access, writeFile, unlink } from "fs/promises";
import { join, resolve } from "path";
import { randomUUID } from "crypto";

const router = Router();

const REMOTION_DIR = resolve(process.cwd(), "../remotion");
const EXPORTS_DIR = resolve(process.cwd(), "public", "exports");
const PREVIEWS_DIR = resolve(process.cwd(), "public", "previews");

// Track export jobs
interface ExportJob {
  id: string;
  status: "rendering" | "complete" | "error";
  progress: number;
  outputFile?: string;
  url?: string;
  error?: string;
  process?: ChildProcess;
  totalScenes?: number;
}

export const activeExports = new Map<string, ExportJob>();

// Ensure exports directory exists
mkdir(EXPORTS_DIR, { recursive: true }).catch((err) =>
  console.warn("[export] Could not create exports dir:", err),
);

interface ExportRequest {
  sceneIds: string[]; // Array of scene IDs (legacy, used if videoUrls absent)
  videoUrls?: string[]; // Full versioned video paths e.g. /previews/projId/sceneId/v2.mp4
  resolution: string; // "720p" | "1080p" | "4K"
  format: string; // "MP4" | "WebM" | "GIF"
  aspectRatio: string; // "16:9" | "9:16" | "1:1"
  audioTrackId?: string;
  audioVolume?: number;
}

/**
 * Resolve a client-facing video URL to an absolute filesystem path.
 * Handles both new versioned paths (/previews/proj/scene/v1.mp4)
 * and legacy flat paths (/previews/scene.mp4).
 */
function resolveVideoPath(url: string): string {
  // Strip leading /previews/ and resolve under PREVIEWS_DIR
  const relative = url.replace(/^\/previews\//, "");
  return join(PREVIEWS_DIR, relative);
}

// Create FFmpeg concat file
async function createConcatFile(videoPaths: string[], exportId: string): Promise<string> {
  const concatFilePath = join(EXPORTS_DIR, `concat-${exportId}.txt`);
  const lines = videoPaths.map(p => `file '${p}'`);
  await writeFile(concatFilePath, lines.join('\n'));
  return concatFilePath;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { sceneIds, videoUrls, resolution, format, aspectRatio } = req.body as ExportRequest;

    if ((!sceneIds || sceneIds.length === 0) && (!videoUrls || videoUrls.length === 0)) {
      return res.status(400).json({ error: "sceneIds or videoUrls array is required" });
    }

    const exportId = randomUUID();
    let extension = "mp4";

    if (format === "WebM") {
      extension = "webm";
    } else if (format === "GIF") {
      extension = "gif";
    }

    const outputFileName = `export-${exportId}.${extension}`;
    const outputFile = join(EXPORTS_DIR, outputFileName);
    const videoUrl = `/exports/${outputFileName}`;

    // Resolve absolute filesystem paths for each scene's video
    // Prefer videoUrls (versioned) over legacy sceneIds
    const resolvedPaths: string[] = videoUrls && videoUrls.length > 0
      ? videoUrls.map(resolveVideoPath)
      : sceneIds.map(id => join(PREVIEWS_DIR, `${id}.mp4`));

    const job: ExportJob = {
      id: exportId,
      status: "rendering",
      progress: 0,
      outputFile,
      totalScenes: resolvedPaths.length,
    };

    activeExports.set(exportId, job);

    res.json({ exportId, status: "rendering", progress: 0 });

    // Verify all preview videos exist
    for (const videoPath of resolvedPaths) {
      try {
        await access(videoPath);
      } catch {
        job.status = "error";
        job.error = `Preview video not found: ${videoPath}. Please render all scenes first.`;
        console.error(`[export/${exportId}] Missing preview: ${videoPath}`);
        return;
      }
    }

    // Create FFmpeg concat file
    const concatFile = await createConcatFile(resolvedPaths, exportId);
    console.log(`[export/${exportId}] Created concat file: ${concatFile}`);

    // FFmpeg command for concatenation
    const ffmpegArgs = [
      "-f", "concat",
      "-safe", "0",
      "-i", concatFile
    ];

    // Add audio track if provided
    // PER-SCENE AUDIO PHASE 2: This is no longer needed since audio is injected natively in Remotion scenes.
    // Kept the parameter for backward compatibility, but we just use copy/re-encode
    
    // For WebM, we need to re-encode since concat copy may not work
    if (format === "WebM") {
      ffmpegArgs.push("-c:v", "libvpx", "-c:a", "libvorbis");
    } else {
      ffmpegArgs.push("-c", "copy");  // Copy without re-encoding for speed
    }

    ffmpegArgs.push("-y", outputFile); // Overwrite output

    console.log(`[export/${exportId}] FFmpeg: ffmpeg ${ffmpegArgs.join(" ")}`);

    const child = spawn("ffmpeg", ffmpegArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    job.process = child;

    // FFmpeg outputs progress to stderr
    child.stderr?.on("data", (chunk: Buffer) => {
      const output = chunk.toString();
      // Log progress for debugging
      if (output.includes("frame=") || output.includes("time=")) {
        console.log(`[export/${exportId}]`, output.trim().substring(0, 100));
      }

      // FFmpeg progress: "time=00:00:04.00"
      const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (timeMatch) {
        // Increment progress gradually - FFmpeg concat is usually fast
        job.progress = Math.min(95, job.progress + 5);
      }
    });

    child.stdout?.on("data", (chunk: Buffer) => {
      console.log(`[export/${exportId}] stdout:`, chunk.toString().trim());
    });

    child.on("error", (err: Error) => {
      console.error(`[export/${exportId}] spawn error:`, err);
      job.status = "error";
      job.error = err.message;
      // Clean up concat file
      unlink(concatFile).catch(() => {});
    });

    child.on("close", async (code: number | null) => {
      // Clean up concat file
      try {
        await unlink(concatFile);
      } catch {}

      if (code === 0) {
        console.log(`[export/${exportId}] complete -> ${outputFile}`);
        job.status = "complete";
        job.progress = 100;
        job.url = videoUrl;
      } else {
        console.error(`[export/${exportId}] failed with code ${code}`);
        job.status = "error";
        job.error = `FFmpeg exited with code ${code}`;
      }
    });

  } catch (error) {
    console.error("[export] Error starting export:", error);
    res.status(500).json({ error: "Failed to start export" });
  }
});

router.get("/status/:exportId", (req: Request, res: Response) => {
  const { exportId } = req.params as { exportId: string };
  const job = activeExports.get(exportId);
  
  if (!job) {
    return res.status(404).json({ error: "Export job not found" });
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    url: job.url,
    error: job.error
  });
});

export default router;
