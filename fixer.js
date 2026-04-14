const fs = require('fs');
const path = require('path');

const scenesDir = path.join(process.cwd(), 'remotion/src/scenes');
const indexFile = path.join(scenesDir, 'index.ts');
const rootFile = path.join(process.cwd(), 'remotion/src/Root.tsx');

let indexContent = fs.readFileSync(indexFile, 'utf8');
const lines = indexContent.split('\n');
const missingComponents = new Set();
const newLines = [];

for (const line of lines) {
    const match = line.match(/export\s+\{\s*([^}]+)\s*\}\s+from\s+["']([^"']+)["']/);
    if (match) {
        let component = match[1].trim();
        let relPath = match[2];
        let fullPath = path.join(scenesDir, relPath);
        
        if (!fs.existsSync(fullPath + '.tsx') && !fs.existsSync(fullPath + '.ts') && !fs.existsSync(fullPath + '/index.tsx')) {
            console.log('Missing file for export: ' + component + ' -> ' + relPath);
            missingComponents.add(component);
            continue; // line is removed
        }
    }
    newLines.push(line);
}

fs.writeFileSync(indexFile, newLines.join('\n'));

// Now fix Root.tsx
let rootContent = fs.readFileSync(rootFile, 'utf8');

// 1. Remove from the import { ... } from "./scenes";
const importRegex = /(import\s+\{)([^}]+)(\}\s+from\s+["']\.\/scenes["'];)/;
rootContent = rootContent.replace(importRegex, (match, p1, p2, p3) => {
    let imports = p2.split(',').map(s => s.trim()).filter(Boolean);
    let validImports = imports.filter(i => !missingComponents.has(i));
    return p1 + '\n  ' + validImports.join(',\n  ') + '\n' + p3;
});

// 2. Remove composition blocks for missing components
missingComponents.forEach(comp => {
    // Matches something like:
    // <Composition
    //   id="..."
    //   component={CompName}
    //   ...
    // />
    const compRegexStr = '\\s*<Composition[^>]*component=\\{' + comp + '\\}[\\s\\S]*?/>\\s*';
    const regex = new RegExp(compRegexStr, 'g');
    rootContent = rootContent.replace(regex, '\n');
});

fs.writeFileSync(rootFile, rootContent);
console.log('Fixed index.ts and Root.tsx ! Removed components: ' + Array.from(missingComponents).join(', '));
