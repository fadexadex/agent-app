const fs = require('fs');

const files = [
  'client/src/hooks/useAgent.ts',
  'client/src/components/editor/AgentThoughts.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/sceneContext\?: any/g, 'sceneContext?: Record<string, unknown>');
  fs.writeFileSync(file, content);
}
