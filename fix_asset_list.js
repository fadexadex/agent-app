const fs = require('fs');
let code = fs.readFileSync('client/src/components/editor/AssetList.tsx', 'utf-8');

code = code.replace(/name: \\`Generated: \\\$\\{ga\.id\.slice\(0, 8\)\\}\\`,/, 'name: `Generated: ${ga.id.slice(0, 8)}`,');
// Also checking what it actually is in the file right now
console.log(code.split('\n')[39]);

fs.writeFileSync('client/src/components/editor/AssetList.tsx', code);
