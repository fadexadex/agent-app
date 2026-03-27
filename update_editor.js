const fs = require('fs');
const file = 'client/src/pages/EditorPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /sceneContext: currentScene\s*\?\s*\{\s*title: currentScene\.name,\s*description: currentScene\.notes \|\| currentScene\.elements\.map\(e => e\.description\)\.join\(" "\),\s*duration: currentScene\.duration,\s*\}\s*: undefined/g,
  'sceneContext: currentScene || undefined'
);

content = content.replace(
  /sceneContext: \{\s*title: scene\.name,\s*description: scene\.notes \|\| scene\.elements\.map\(\(e\) => e\.description\)\.join\(" "\),\s*duration: framesToSeconds\(scene\.duration\),\s*\}/g,
  'sceneContext: scene'
);

content = content.replace(
  /sceneContext=\{\s*displayScene\s*\?\s*\{\s*title: displayScene\.name,\s*description: displayScene\.notes \|\| displayScene\.elements\.map\(e => e\.description\)\.join\(" "\),\s*duration: displayScene\.duration,\s*\}\s*: undefined\s*\}/g,
  'sceneContext={displayScene || undefined}'
);

fs.writeFileSync(file, content);
