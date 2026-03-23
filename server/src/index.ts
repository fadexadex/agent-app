import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { mkdir } from "fs/promises";
import agentRouter from "./routes/agent.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure the previews output directory exists on startup
const PREVIEWS_DIR = path.resolve(process.cwd(), "public", "previews");
mkdir(PREVIEWS_DIR, { recursive: true }).catch((err) =>
  console.warn("[server] Could not create previews dir:", err),
);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());

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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Agent routes
app.use("/api/agent", agentRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Preview videos served from ${PREVIEWS_DIR}`);
});
