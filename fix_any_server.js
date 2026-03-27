const fs = require('fs');

const file = 'server/src/routes/agent.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/sceneContext\?: any/g, 'sceneContext?: Record<string, unknown>');
fs.writeFileSync(file, content);

