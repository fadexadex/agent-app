const fs = require('fs');
const file = 'server/src/tools/render-scene.ts';
let content = fs.readFileSync(file, 'utf8');

// Insert child_process import
content = content.replace(
  'import { finished } from "stream/promises";',
  `import { finished } from "stream/promises";\nimport { spawn } from "child_process";`
);

// We need to alter the block inside the (async () => { ... })()
const originalRenderBlock = `// 3. Run the Lambda render process in the background
    (async () => {
      try {
        const region = (process.env.REMOTION_AWS_REGION || process.env.AWS_REGION || "us-east-1") as any;`;

const newRenderBlock = `// 3. Run the render process in the background
    (async () => {
      try {
        const useLocalRender = process.env.USE_LOCAL_RENDER === "true";

        if (useLocalRender) {
          appendOutputLog(sceneId, \`Starting LOCAL render process for \${sceneId}...\`);
          
          const remotionProcess = spawn(
            "npx",
            [
              "remotion",
              "render",
              "src/index.ts",
              sceneId,
              outputFile,
              "--log=verbose"
            ],
            {
              cwd: REMOTION_DIR,
              env: { ...process.env },
            }
          );

          remotionProcess.stdout.on("data", (data) => {
            appendOutputLog(sceneId, data.toString());
          });

          remotionProcess.stderr.on("data", (data) => {
            appendErrorOutput(sceneId, data.toString());
          });

          await new Promise<void>((resolve, reject) => {
            remotionProcess.on("close", (code) => {
              if (code === 0) {
                resolve();
              } else {
                reject(new Error(\`Local render exited with code \${code}\`));
              }
            });
            remotionProcess.on("error", (err) => {
              reject(err);
            });
          });

          appendOutputLog(sceneId, \`Successfully rendered to \${outputFile}\`);
          markRenderComplete(sceneId, \`/previews/\${sceneId}.mp4\`);
          return;
        }

        const region = (process.env.REMOTION_AWS_REGION || process.env.AWS_REGION || "us-east-1") as any;`;

content = content.replace(originalRenderBlock, newRenderBlock);

fs.writeFileSync(file, content);
