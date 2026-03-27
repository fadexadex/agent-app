import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { mkdir } from "fs/promises";

const router = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), "../remotion/public", "uploads");
// Ensure uploads dir exists
mkdir(UPLOADS_DIR, { recursive: true }).catch((err) =>
  console.warn("[server] Could not create uploads dir:", err)
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // File is saved to public/uploads, serve it via /uploads
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

export default router;
