import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { mkdir } from "fs/promises";
import agentRouter from "./routes/agent.js";
import scenesRouter from "./routes/scenes.js";
import exportRouter from "./routes/export.js";
import uploadRouter from "./routes/upload.js";
import assetsRouter from "./routes/assets.js";
import brandRouter from "./routes/brand.js";
import { apiErrorHandler, DEFAULT_JSON_BODY_LIMIT } from "./lib/http-errors.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure the previews output directory exists on startup
const PREVIEWS_DIR = path.resolve(process.cwd(), "public", "previews");
const EXPORTS_DIR = path.resolve(process.cwd(), "public", "exports");
mkdir(PREVIEWS_DIR, { recursive: true }).catch((err) =>
  console.warn("[server] Could not create previews dir:", err),
);
mkdir(EXPORTS_DIR, { recursive: true }).catch((err) =>
  console.warn("[server] Could not create exports dir:", err),
);

// Middleware
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
  : ["http://localhost:8080", "http://localhost:5173"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: DEFAULT_JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: DEFAULT_JSON_BODY_LIMIT }));

// Serve rendered Remotion MP4 previews
// Files land at  server/public/previews/<sceneId>.mp4
// Proxied by Vite to  /previews/<sceneId>.mp4  on the client
app.use(
  "/previews",
  express.static(PREVIEWS_DIR, {
    // Allow the browser to cache renders but always revalidate
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  }),
);

// Serve exports
app.use(
  "/exports",
  express.static(EXPORTS_DIR, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  }),
);


const GENERATED_DIR = path.resolve(process.cwd(), "../remotion/public", "generated");
mkdir(GENERATED_DIR, { recursive: true }).catch((err) =>
  console.warn("[server] Could not create generated dir:", err),
);

app.use(
  "/generated",
  express.static(GENERATED_DIR, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  }),
);

const UPLOADS_DIR = path.resolve(process.cwd(), "../remotion/public", "uploads");
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  }),
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Agent routes
app.use("/api/agent", agentRouter);

// Scene generation routes
app.use("/api/scenes", scenesRouter);

// Export routes
app.use("/api/export", exportRouter);

// Upload routes
app.use("/api/upload", uploadRouter);

// Assets routes
app.use("/api/assets", assetsRouter);

// Brand color extraction routes
app.use("/api/brand", brandRouter);

app.use(apiErrorHandler);

// Serve the React frontend (client/dist)
const CLIENT_DIST_DIR = path.resolve(process.cwd(), "../client/dist");
app.use(express.static(CLIENT_DIST_DIR));

// Catch-all route to serve index.html for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(CLIENT_DIST_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Preview videos served from ${PREVIEWS_DIR}`);
});
