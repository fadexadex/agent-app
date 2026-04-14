import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    rollupOptions: {
      input: {
        player: path.resolve(__dirname, "player.html"),
      },
      output: {
        dir: path.resolve(__dirname, "dist-player"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force the workspace-local React 18 for both the app and @remotion/player,
      // preventing the root node_modules React 19 from leaking into this bundle.
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom", "remotion", "@remotion/player", "@remotion/core"],
  },
  server: {
    port: 3200,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
