import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const backendTarget =
    process.env.VITE_API_PROXY_TARGET ??
    "https://agent-app-b1c979b88941.herokuapp.com";

  return {
    server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    watch: {
      ignored: ["**/remotion/**", "**/server/**"]
    },
    proxy: {
      "/api": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/previews": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/exports": {
        target: backendTarget,
        changeOrigin: true,
      },
      "/uploads": {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
