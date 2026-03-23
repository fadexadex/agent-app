import { Config } from "@remotion/cli/config";
import path from "path";

Config.setEntryPoint("./src/index.ts");
Config.setPublicDir("./public");

// Remotion uses webpack to bundle, which doesn't read tsconfig paths automatically.
// We need to mirror the "@/*" → "src/*" alias so imports like
// `import { Background } from "@/components/Global"` resolve correctly.
Config.overrideWebpackConfig((currentConfig) => {
  return {
    ...currentConfig,
    resolve: {
      ...currentConfig.resolve,
      alias: {
        ...(currentConfig.resolve?.alias ?? {}),
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
  };
});
