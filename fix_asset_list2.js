const fs = require('fs');
let code = fs.readFileSync('client/src/components/editor/AssetList.tsx', 'utf-8');

code = code.replace(/name: \\\`Generated: \\\$\\{ga\.id\.slice\(0, 8\)\\}\\\`,/, 'name: `Generated: ${ga.id.slice(0, 8)}`,');

fs.writeFileSync('client/src/components/editor/AssetList.tsx', code);
