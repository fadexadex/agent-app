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
    },
  },
  server: {
    port: 3200,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
