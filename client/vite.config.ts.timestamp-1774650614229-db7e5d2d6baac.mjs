// vite.config.ts
import path from "path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "file:///c:/Users/Ayo/agent-app/node_modules/vite/dist/node/index.js";
import react from "file:///c:/Users/Ayo/agent-app/node_modules/@vitejs/plugin-react-swc/index.js";
import { componentTagger } from "file:///c:/Users/Ayo/agent-app/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///c:/Users/Ayo/agent-app/client/vite.config.ts";
var clientDir = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var remotionDir = path.resolve(clientDir, "../remotion");
function remotionAliasPlugin() {
  return {
    name: "remotion-alias-resolver",
    enforce: "pre",
    resolveId(source, importer) {
      if (!source.startsWith("@/")) return null;
      if (importer) {
        const normalizedImporter = importer.replace(/\\/g, "/");
        if (normalizedImporter.includes("remotion/src")) {
          const resolved = source.replace("@/", `${remotionDir}/src/`);
          return this.resolve(resolved, importer, { skipSelf: true });
        }
      }
      return null;
    }
  };
}
function resolveBackendTargetForServe(raw) {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    throw new Error(
      "[vite] Set VITE_API_PROXY_TARGET in client/.env (see .env.example). Example local: http://localhost:3001 \u2014 or your deployed API URL. Nothing is assumed by default."
    );
  }
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new Error(
        `[vite] VITE_API_PROXY_TARGET must start with http:// or https:// (got: ${trimmed})`
      );
    }
    return trimmed;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("[vite]")) throw e;
    throw new Error(
      `[vite] Invalid VITE_API_PROXY_TARGET "${trimmed}". Use a full URL, e.g. http://localhost:3001`
    );
  }
}
var vite_config_default = defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, clientDir, "");
  const backendTarget = command === "serve" ? resolveBackendTargetForServe(env.VITE_API_PROXY_TARGET) : env.VITE_API_PROXY_TARGET?.trim() || "http://127.0.0.1:9";
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false
      },
      watch: {
        ignored: ["**/remotion/**", "**/server/**"]
      },
      // Allow Vite to serve files from the remotion workspace
      fs: {
        allow: [
          clientDir,
          path.resolve(clientDir, "../remotion")
        ]
      },
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true
        },
        "/previews": {
          target: backendTarget,
          changeOrigin: true
        },
        "/exports": {
          target: backendTarget,
          changeOrigin: true
        },
        "/uploads": {
          target: backendTarget,
          changeOrigin: true
        }
      }
    },
    plugins: [
      remotionAliasPlugin(),
      react(),
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(clientDir, "./src"),
        "@remotion-scenes": path.resolve(clientDir, "../remotion/src/scenes"),
        "@remotion-components": path.resolve(clientDir, "../remotion/src/components")
      }
    },
    optimizeDeps: {
      exclude: ["@remotion-scenes", "@remotion-components"]
    },
    build: {
      outDir: path.resolve(clientDir, "dist"),
      emptyOutDir: true,
      chunkSizeWarningLimit: 1e3,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJjOlxcXFxVc2Vyc1xcXFxBeW9cXFxcYWdlbnQtYXBwXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiYzpcXFxcVXNlcnNcXFxcQXlvXFxcXGFnZW50LWFwcFxcXFxjbGllbnRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2M6L1VzZXJzL0F5by9hZ2VudC1hcHAvY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gXCJub2RlOnVybFwiO1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYsIFBsdWdpbiB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xyXG5cclxuY29uc3QgY2xpZW50RGlyID0gcGF0aC5kaXJuYW1lKGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKSk7XHJcbmNvbnN0IHJlbW90aW9uRGlyID0gcGF0aC5yZXNvbHZlKGNsaWVudERpciwgXCIuLi9yZW1vdGlvblwiKTtcclxuXHJcbi8qKlxyXG4gKiBWaXRlIHBsdWdpbiB0byByZXNvbHZlIEAvIGltcG9ydHMgZnJvbSByZW1vdGlvbiBmaWxlcyBjb3JyZWN0bHlcclxuICogV2hlbiBpbXBvcnRpbmcgZnJvbSByZW1vdGlvbi9zcmMvc2NlbmVzIG9yIHJlbW90aW9uL3NyYy9jb21wb25lbnRzLFxyXG4gKiBALyBzaG91bGQgcmVzb2x2ZSB0byByZW1vdGlvbi9zcmMvLCBub3QgY2xpZW50L3NyYy9cclxuICovXHJcbmZ1bmN0aW9uIHJlbW90aW9uQWxpYXNQbHVnaW4oKTogUGx1Z2luIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogXCJyZW1vdGlvbi1hbGlhcy1yZXNvbHZlclwiLFxyXG4gICAgZW5mb3JjZTogXCJwcmVcIixcclxuICAgIHJlc29sdmVJZChzb3VyY2UsIGltcG9ydGVyKSB7XHJcbiAgICAgIC8vIE9ubHkgaGFuZGxlIEAvIGltcG9ydHNcclxuICAgICAgaWYgKCFzb3VyY2Uuc3RhcnRzV2l0aChcIkAvXCIpKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHRoZSBpbXBvcnRlciBpcyBmcm9tIHRoZSByZW1vdGlvbiB3b3Jrc3BhY2VcclxuICAgICAgLy8gTm9ybWFsaXplIHBhdGhzIGZvciBjcm9zcy1wbGF0Zm9ybSBjb21wYXRpYmlsaXR5IChXaW5kb3dzIHVzZXMgYmFja3NsYXNoZXMpXHJcbiAgICAgIGlmIChpbXBvcnRlcikge1xyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRJbXBvcnRlciA9IGltcG9ydGVyLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpO1xyXG4gICAgICAgIGlmIChub3JtYWxpemVkSW1wb3J0ZXIuaW5jbHVkZXMoXCJyZW1vdGlvbi9zcmNcIikpIHtcclxuICAgICAgICAgIC8vIFJlc29sdmUgQC8gdG8gcmVtb3Rpb24vc3JjLyBmb3IgcmVtb3Rpb24gZmlsZXNcclxuICAgICAgICAgIGNvbnN0IHJlc29sdmVkID0gc291cmNlLnJlcGxhY2UoXCJAL1wiLCBgJHtyZW1vdGlvbkRpcn0vc3JjL2ApO1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMucmVzb2x2ZShyZXNvbHZlZCwgaW1wb3J0ZXIsIHsgc2tpcFNlbGY6IHRydWUgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBPdGhlcndpc2UsIGxldCB0aGUgZGVmYXVsdCBhbGlhcyByZXNvbHV0aW9uIGhhbmRsZSBpdCAoY2xpZW50L3NyYy8pXHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSxcclxuICB9O1xyXG59XHJcblxyXG4vKiogRGV2IHNlcnZlciBvbmx5OiB5b3UgbXVzdCBzZXQgdGhpcyBpbiBgY2xpZW50Ly5lbnZgIFx1MjAxNCBubyBkZWZhdWx0IChsb2NhbCB2cyBkZXBsb3llZCBpcyB5b3VyIGNob2ljZSkuICovXHJcbmZ1bmN0aW9uIHJlc29sdmVCYWNrZW5kVGFyZ2V0Rm9yU2VydmUocmF3OiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmcge1xyXG4gIGNvbnN0IHRyaW1tZWQgPSByYXc/LnRyaW0oKSA/PyBcIlwiO1xyXG4gIGlmICghdHJpbW1lZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICBcIlt2aXRlXSBTZXQgVklURV9BUElfUFJPWFlfVEFSR0VUIGluIGNsaWVudC8uZW52IChzZWUgLmVudi5leGFtcGxlKS4gXCIgK1xyXG4gICAgICAgIFwiRXhhbXBsZSBsb2NhbDogaHR0cDovL2xvY2FsaG9zdDozMDAxIFx1MjAxNCBvciB5b3VyIGRlcGxveWVkIEFQSSBVUkwuIE5vdGhpbmcgaXMgYXNzdW1lZCBieSBkZWZhdWx0LlwiLFxyXG4gICAgKTtcclxuICB9XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHUgPSBuZXcgVVJMKHRyaW1tZWQpO1xyXG4gICAgaWYgKHUucHJvdG9jb2wgIT09IFwiaHR0cDpcIiAmJiB1LnByb3RvY29sICE9PSBcImh0dHBzOlwiKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICBgW3ZpdGVdIFZJVEVfQVBJX1BST1hZX1RBUkdFVCBtdXN0IHN0YXJ0IHdpdGggaHR0cDovLyBvciBodHRwczovLyAoZ290OiAke3RyaW1tZWR9KWAsXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJpbW1lZDtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEVycm9yICYmIGUubWVzc2FnZS5zdGFydHNXaXRoKFwiW3ZpdGVdXCIpKSB0aHJvdyBlO1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICBgW3ZpdGVdIEludmFsaWQgVklURV9BUElfUFJPWFlfVEFSR0VUIFwiJHt0cmltbWVkfVwiLiBVc2UgYSBmdWxsIFVSTCwgZS5nLiBodHRwOi8vbG9jYWxob3N0OjMwMDFgLFxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlLCBjb21tYW5kIH0pID0+IHtcclxuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIGNsaWVudERpciwgXCJcIik7XHJcbiAgLy8gUHJveHkgcnVucyBvbmx5IGluIGRldiAoYHZpdGVgKTsgYHZpdGUgYnVpbGRgIGRvZXMgbm90IG5lZWQgYSByZWFsIHRhcmdldC5cclxuICBjb25zdCBiYWNrZW5kVGFyZ2V0ID1cclxuICAgIGNvbW1hbmQgPT09IFwic2VydmVcIlxyXG4gICAgICA/IHJlc29sdmVCYWNrZW5kVGFyZ2V0Rm9yU2VydmUoZW52LlZJVEVfQVBJX1BST1hZX1RBUkdFVClcclxuICAgICAgOiBlbnYuVklURV9BUElfUFJPWFlfVEFSR0VUPy50cmltKCkgfHwgXCJodHRwOi8vMTI3LjAuMC4xOjlcIjtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICAgIGhtcjoge1xyXG4gICAgICBvdmVybGF5OiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICB3YXRjaDoge1xyXG4gICAgICBpZ25vcmVkOiBbXCIqKi9yZW1vdGlvbi8qKlwiLCBcIioqL3NlcnZlci8qKlwiXVxyXG4gICAgfSxcclxuICAgIC8vIEFsbG93IFZpdGUgdG8gc2VydmUgZmlsZXMgZnJvbSB0aGUgcmVtb3Rpb24gd29ya3NwYWNlXHJcbiAgICBmczoge1xyXG4gICAgICBhbGxvdzogW1xyXG4gICAgICAgIGNsaWVudERpcixcclxuICAgICAgICBwYXRoLnJlc29sdmUoY2xpZW50RGlyLCBcIi4uL3JlbW90aW9uXCIpLFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIFwiL2FwaVwiOiB7XHJcbiAgICAgICAgdGFyZ2V0OiBiYWNrZW5kVGFyZ2V0LFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgXCIvcHJldmlld3NcIjoge1xyXG4gICAgICAgIHRhcmdldDogYmFja2VuZFRhcmdldCxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiL2V4cG9ydHNcIjoge1xyXG4gICAgICAgIHRhcmdldDogYmFja2VuZFRhcmdldCxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiL3VwbG9hZHNcIjoge1xyXG4gICAgICAgIHRhcmdldDogYmFja2VuZFRhcmdldCxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHJlbW90aW9uQWxpYXNQbHVnaW4oKSxcclxuICAgICAgcmVhY3QoKSxcclxuICAgICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gICAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShjbGllbnREaXIsIFwiLi9zcmNcIiksXHJcbiAgICAgICAgXCJAcmVtb3Rpb24tc2NlbmVzXCI6IHBhdGgucmVzb2x2ZShjbGllbnREaXIsIFwiLi4vcmVtb3Rpb24vc3JjL3NjZW5lc1wiKSxcclxuICAgICAgICBcIkByZW1vdGlvbi1jb21wb25lbnRzXCI6IHBhdGgucmVzb2x2ZShjbGllbnREaXIsIFwiLi4vcmVtb3Rpb24vc3JjL2NvbXBvbmVudHNcIiksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGV4Y2x1ZGU6IFtcIkByZW1vdGlvbi1zY2VuZXNcIiwgXCJAcmVtb3Rpb24tY29tcG9uZW50c1wiXSxcclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICBvdXREaXI6IHBhdGgucmVzb2x2ZShjbGllbnREaXIsIFwiZGlzdFwiKSxcclxuICAgICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVIsT0FBTyxVQUFVO0FBQ3BTLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsY0FBYyxlQUF1QjtBQUM5QyxPQUFPLFdBQVc7QUFDbEIsU0FBUyx1QkFBdUI7QUFKMkksSUFBTSwyQ0FBMkM7QUFNNU4sSUFBTSxZQUFZLEtBQUssUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFDN0QsSUFBTSxjQUFjLEtBQUssUUFBUSxXQUFXLGFBQWE7QUFPekQsU0FBUyxzQkFBOEI7QUFDckMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVSxRQUFR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
