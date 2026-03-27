import { execFileSync } from 'child_process';
import fs from 'fs';

// Get env from server/.env
const envContent = fs.readFileSync('./server/.env', 'utf8');
const env = { ...process.env };
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

try {
  console.log("Checking quotas...");
  const stdout = execFileSync('npx', [
    'remotion', 'lambda', 'quotas', '--region=us-east-1'
  ], {
    cwd: './remotion',
    env,
    encoding: 'utf8'
  });
  console.log("STDOUT:", stdout);
} catch(e) {
  console.error("ERROR:", e.stdout);
}
