const fs = require('fs');
const file = 'server/src/routes/agent.ts';
let content = fs.readFileSync(file, 'utf8');

// Update sceneContext typing to any
content = content.replace(
  /sceneContext\?: \{\s*title\?: string;\s*description\?: string;\s*duration\?: number;\s*\};/g,
  'sceneContext?: any;'
);

// We want to replace the current context block logic:
const oldContextLogic = `    // Build context to include in the agent's context
    let contextInfo = "";
    if (sceneId) {
      contextInfo = \`[Scene: \${sceneId}]\`;
      if (sceneContext?.title) {
        contextInfo += \` Title: "\${sceneContext.title}"\`;
      }
      if (sceneContext?.description) {
        contextInfo += \` - \${sceneContext.description}\`;
      }
      if (sceneContext?.duration) {
        contextInfo += \` (\${sceneContext.duration}s)\`;
      }
    }

    if (contextInfo) {
      console.log(\`[API] Scene context: \${contextInfo}\`);
    }`;

const newContextLogic = `    // Build context to include in the agent's context
    if (sceneContext && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        const payloadText = \`[SCENE_JSON_PAYLOAD:\\n\\\`\\\`\\\`json\\n\${JSON.stringify(sceneContext, null, 2)}\\n\\\`\\\`\\\`\\n]\`;
        
        if (typeof lastMessage.content === "string") {
          lastMessage.content = payloadText + "\\n\\n" + lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
          const textPartIndex = lastMessage.content.findIndex((p: any) => p.type === "text");
          if (textPartIndex !== -1) {
            lastMessage.content[textPartIndex].text = payloadText + "\\n\\n" + lastMessage.content[textPartIndex].text;
          } else {
            lastMessage.content.unshift({ type: "text", text: payloadText + "\\n\\n" });
          }
        }
      }
    }

    if (sceneContext) {
      console.log(\`[API] Injected Scene context JSON payload\`);
    }`;

content = content.replace(oldContextLogic, newContextLogic);

fs.writeFileSync(file, content);
