const fs = require('fs');
let code = fs.readFileSync('server/src/index.ts', 'utf-8');

const generatedSetup = `
const GENERATED_DIR = path.resolve(process.cwd(), "public", "generated");
mkdir(GENERATED_DIR, { recursive: true }).catch((err) =>
  console.warn("[server] Could not create generated dir:", err),
);

app.use(
  "/generated",
  express.static(GENERATED_DIR, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  }),
);
`;

code = code.replace(
  /const UPLOADS_DIR = path.resolve\(process.cwd\(\), "public", "uploads"\);/,
  generatedSetup + '\nconst UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads");'
);

fs.writeFileSync('server/src/index.ts', code);
