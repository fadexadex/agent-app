const fs = require('fs');
let code = fs.readFileSync('server/src/tools/trigger-preview.ts', 'utf-8');

code = code.replace(
  /sceneId:\s*z\s*\.string\(\)\s*\.describe\("The scene ID used in writeSceneCode \(e\.g\., 'hook-intro'\)"\),/,
  `sceneId: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, "sceneId must be alphanumeric").max(64).describe("The scene ID used in writeSceneCode (e.g., 'hook-intro')"),`
);

code = code.replace(
  /componentName:\s*z\s*\.string\(\)\s*\.describe\([\s\S]*?\),/,
  `componentName: z.string().regex(/^[A-Z][a-zA-Z0-9]*$/, "componentName must be PascalCase").max(64).describe("The exported component name from the scene file (e.g., 'HookIntro')"),`
);

code = code.replace(
  /const componentRegex = new RegExp\(`export\\\\s\+\\\{\\\\s\*\$\{componentName\}\\\\s\*\\\\\}\\s\+from\\s\+\['"\]\[\^'"\]\+\['"\];\?\\\\n\?`, 'g'\);/,
  `function escapeRegex(str: string): string { return str.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'); }\n  const componentRegex = new RegExp(\`export\\\\s+\\\\{\\\\s*\${escapeRegex(componentName)}\\\\s*\\\\}\\\\s+from\\\\s+['"][^'"]+['"];?\\\\n?\`, 'g');`
);

fs.writeFileSync('server/src/tools/trigger-preview.ts', code);
