const fs = require('fs');
let code = fs.readFileSync('client/src/components/editor/AgentThoughts.tsx', 'utf-8');

// Replace <AnimatePresence mode="popLayout"> with <AnimatePresence>
code = code.replace(/<AnimatePresence mode="popLayout">/g, '<AnimatePresence>');
// Replace <motion.div layout key=... with <motion.div layout={false} key=...
code = code.replace(/<motion\.div\s+layout\s+key/g, '<motion.div layout={false} key');

fs.writeFileSync('client/src/components/editor/AgentThoughts.tsx', code);
