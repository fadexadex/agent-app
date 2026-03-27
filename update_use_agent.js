const fs = require('fs');
let code = fs.readFileSync('client/src/hooks/useAgent.ts', 'utf-8');

// Add useDeferredValue import if not present
if (!code.includes('useDeferredValue')) {
  code = code.replace(/import \{ useState, useCallback, useEffect, useRef \} from "react";/, 'import { useState, useCallback, useEffect, useRef, useDeferredValue } from "react";');
}

// Replace returned steps with deferredSteps
code = code.replace(/return \{\n\s*steps,/g, `
  const deferredSteps = useDeferredValue(steps);
  
  return {
    steps: deferredSteps,
`);

// Add generateImage case
const newCase = `
    case "generateImage": {
      const imageResult = result as { success?: boolean; imageUrl?: string; prompt?: string } | undefined;
      return {
        id: stepId,
        type: "image",
        label: isComplete ? "Image generated" : "Generating image...",
        timestamp,
        status: isComplete ? "complete" : "active",
        imageUrl: imageResult?.imageUrl,
        imagePrompt: (args as { prompt?: string }).prompt,
      };
    }

    default:
`;

code = code.replace(/default:/, newCase);

fs.writeFileSync('client/src/hooks/useAgent.ts', code);
