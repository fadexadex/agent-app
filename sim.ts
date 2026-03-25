import { writeSceneCodeTool } from "./server/src/tools/write-scene.js";
import { triggerPreviewTool } from "./server/src/tools/trigger-preview.js";

async function run() {
  const writeRes = await writeSceneCodeTool.execute({
    sceneId: "hook-manual-coding-pain",
    fileName: "HookManualCodingPain",
    content: "import React from 'react'; export const HookManualCodingPain = () => { return <div>Test</div>; }"
  }, { toolCallId: "1", messages: [] } as any);
  console.log("Write:", writeRes);

  const previewRes = await triggerPreviewTool.execute({
    sceneId: "hook-manual-coding-pain",
    componentName: "HookManualCodingPain",
    fileName: "HookManualCodingPain",
    durationFrames: 90,
    width: 1920,
    height: 1080,
    fps: 30
  }, { toolCallId: "2", messages: [] } as any);
  console.log("Preview:", previewRes);
}
run();
