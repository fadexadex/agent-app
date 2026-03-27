const fs = require('fs');
const file = 'server/src/routes/agent.ts';
let content = fs.readFileSync(file, 'utf8');

const oldStr = `            parts.push({
              type: "file",
              data: \`data:\${mimeType};base64,\${base64Data}\`,
              mimeType,
            });`;

const newStr = `            const isImage = mimeType && mimeType.startsWith('image/');
            if (isImage) {
              parts.push({
                type: "image",
                image: Buffer.from(base64Data, "base64"),
                mediaType: mimeType,
              });
            } else {
              parts.push({
                type: "file",
                data: Buffer.from(base64Data, "base64"),
                mediaType: mimeType,
              });
            }`;

content = content.replace(oldStr, newStr);
fs.writeFileSync(file, content);
console.log('updated');
