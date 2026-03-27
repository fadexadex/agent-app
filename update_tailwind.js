const fs = require('fs');
let code = fs.readFileSync('client/tailwind.config.ts', 'utf-8');

// Replace shimmer 4s with 2s
code = code.replace(/shimmer\s+4s\s+infinite\s+linear/, 'shimmer 2s infinite linear');

fs.writeFileSync('client/tailwind.config.ts', code);
