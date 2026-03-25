import { Router, Request, Response } from "express";
import { readdir, stat } from "fs/promises";
import path from "path";
import mime from "mime-types";

const router = Router();
const UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads");

router.get("/", async (req: Request, res: Response) => {
  try {
    const files = await readdir(UPLOADS_DIR);
    
    const assets = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const fileStat = await stat(filePath);
        
        if (fileStat.isDirectory()) return null;
        
        const mimeType = mime.lookup(filename) || "application/octet-stream";
        
        return {
          name: filename,
          url: `/uploads/${filename}`,
          mimeType,
          size: fileStat.size,
          createdAt: fileStat.birthtime.toISOString()
        };
      })
    );
    
    res.json(assets.filter(Boolean));
  } catch (error) {
    if ((error as any).code === "ENOENT") {
      return res.json([]);
    }
    console.error("[server] Error reading assets:", error);
    res.status(500).json({ error: "Failed to read assets" });
  }
});

export default router;
