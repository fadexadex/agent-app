const fs = require('fs');

// We'll just reset Root.tsx to a clean state for the test
const rootContent = `import React from "react";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
`;

fs.writeFileSync('remotion/src/Root.tsx', rootContent);
fs.writeFileSync('remotion/src/scenes/index.ts', '// Auto-generated barrel export for scenes\n');

// Update integration.test.ts to use a unique component name
let code = fs.readFileSync('server/src/__tests__/integration.test.ts', 'utf-8');
code = code.replace(/IntegrationTestScene/g, 'CleanTestScene');
code = code.replace(/integration-test-scene/g, 'clean-test-scene');
fs.writeFileSync('server/src/__tests__/integration.test.ts', code);
