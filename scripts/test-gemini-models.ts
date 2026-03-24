/**
 * Gemini Model Evaluation Script
 *
 * Tests multiple Gemini models on scene generation quality.
 * Run with:  npx tsx scripts/test-gemini-models.ts
 *
 * Requires GOOGLE_GENERATIVE_AI_API_KEY in environment (or server/.env).
 */

import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";

// Load server .env
config({ path: resolve(process.cwd(), "server/.env") });

// ─── Schema (mirrors scene-generator.ts) ─────────────────────────────────────

const SceneElementSchema = z.object({
  type: z.enum(["text", "mockup", "shape", "custom", "iconGrid"]),
  id: z.string(),
  component: z.string().optional(),
  description: z.string(),
  props: z.record(z.unknown()).optional(),
  position: z.object({ anchor: z.string(), x: z.number().optional(), y: z.number().optional() }).optional(),
  animation: z.object({
    preset: z.string().optional(),
    timing: z.object({ start: z.number(), duration: z.number(), spring: z.string().optional() }),
    description: z.string().optional(),
  }).optional(),
  exit: z.object({ frame: z.number(), type: z.string(), duration: z.number() }).optional(),
  mockupType: z.string().optional(),
  content: z.string().optional(),
});

const SceneSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["hook", "intro", "feature", "benefit", "cta", "transition"]),
  duration: z.number().min(60).max(300),
  background: z.object({
    type: z.enum(["solid", "gradient", "noise", "mesh"]),
    color: z.string().optional(),
    colors: z.array(z.string()).optional(),
    preset: z.string().optional(),
  }),
  elements: z.array(SceneElementSchema).min(1).max(6),
  transition: z.object({ type: z.string(), duration: z.number() }).optional(),
  notes: z.string().optional(),
});

type GeneratedScene = z.infer<typeof SceneSchema>;

// ─── Models to test ────────────────────────────────────────────────────────────

const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.5-flash-preview-04-17",
  "gemini-2.5-pro-preview-03-25",
];

const TEST_PROMPT =
  "A project management SaaS for remote teams using AI to automate daily standups and surface blockers";

// ─── Load few-shot example ────────────────────────────────────────────────────

let SCENE_EXAMPLE = "";
try {
  SCENE_EXAMPLE = readFileSync(
    resolve(process.cwd(), "remotion/prompts/scene-email-feature.json"),
    "utf-8",
  );
} catch {
  SCENE_EXAMPLE = '{"id":"example","name":"Example","category":"feature","duration":120,"background":{"type":"solid","color":"#fff"},"elements":[{"type":"text","id":"h","description":"headline"}]}';
}

const SYSTEM_PROMPT = `You are a video scene scriptwriter for Remotion animations.
Generate exactly 5-6 scenes for a product demo video. Follow EXACTLY this JSON structure:
${SCENE_EXAMPLE}
Rules:
- category sequence: hook → intro → feature → feature → benefit → cta
- duration: integer frames at 30fps (90–150 typical)
- spring: "snappy" | "smooth" | "bouncy" | "heavy"
- element types: text | mockup | custom | iconGrid
- notes: exit order + stagger timing guidance
- id: unique kebab-case slug`;

// ─── Scoring ──────────────────────────────────────────────────────────────────

interface ModelResult {
  modelId: string;
  latencyMs: number;
  scenes: GeneratedScene[];
  error?: string;
  scores: {
    schema: number;
    narrative: number;
    latency: number;
    efficiency: number;
    total: number;
  };
}

function scoreSchema(scenes: GeneratedScene[]): number {
  if (scenes.length === 0) return 0;
  let points = 0;
  for (const s of scenes) {
    const result = SceneSchema.safeParse(s);
    if (!result.success) continue;
    points += 5; // basic parse success
    if (s.elements.length >= 2) points += 2;
    if (s.duration >= 90 && s.duration <= 150) points += 2;
    if (s.notes && s.notes.length > 10) points += 1;
  }
  return Math.min(40, Math.round((points / (scenes.length * 10)) * 40));
}

function scoreNarrative(scenes: GeneratedScene[]): number {
  if (scenes.length === 0) return 0;
  let points = 0;
  // Scene count in range
  if (scenes.length >= 5 && scenes.length <= 7) points += 8;
  // Has hook and cta
  if (scenes.some((s) => s.category === "hook")) points += 5;
  if (scenes.some((s) => s.category === "cta")) points += 5;
  // All notes non-empty with substance
  const richNotes = scenes.filter((s) => s.notes && s.notes.length > 20);
  points += Math.round((richNotes.length / scenes.length) * 6);
  // Element descriptions have substance (>20 chars)
  const richDescs = scenes.flatMap((s) =>
    s.elements.filter((e) => e.description.length > 20),
  );
  const totalElems = scenes.flatMap((s) => s.elements);
  if (totalElems.length > 0) {
    points += Math.round((richDescs.length / totalElems.length) * 6);
  }
  return Math.min(30, points);
}

function scoreLatency(ms: number): number {
  if (ms < 3000) return 20;
  if (ms < 6000) return 15;
  if (ms < 10000) return 10;
  if (ms < 15000) return 7;
  return 5;
}

function scoreEfficiency(scenes: GeneratedScene[], latencyMs: number): number {
  if (latencyMs === 0 || scenes.length === 0) return 0;
  const totalElements = scenes.reduce((a, s) => a + s.elements.length, 0);
  const ratio = totalElements / (latencyMs / 1000); // elements per second
  if (ratio >= 2) return 10;
  if (ratio >= 1) return 7;
  if (ratio >= 0.5) return 5;
  return 3;
}

// ─── Run one model ─────────────────────────────────────────────────────────────

async function testModel(modelId: string): Promise<ModelResult> {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  const start = Date.now();
  const scenes: GeneratedScene[] = [];
  let error: string | undefined;

  try {
    const result = streamObject({
      model: google(modelId),
      output: "array",
      schema: SceneSchema,
      system: SYSTEM_PROMPT,
      prompt: `Generate 5-6 scenes for: ${TEST_PROMPT}`,
    });

    for await (const scene of result.elementStream) {
      scenes.push(scene);
    }
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : String(err);
  }

  const latencyMs = Date.now() - start;

  const schema = scenes.length > 0 ? scoreSchema(scenes) : 0;
  const narrative = scenes.length > 0 ? scoreNarrative(scenes) : 0;
  const latency = error ? 0 : scoreLatency(latencyMs);
  const efficiency = scenes.length > 0 ? scoreEfficiency(scenes, latencyMs) : 0;
  const total = schema + narrative + latency + efficiency;

  return { modelId, latencyMs, scenes, error, scores: { schema, narrative, latency, efficiency, total } };
}

// ─── Print results ────────────────────────────────────────────────────────────

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

function printResults(results: ModelResult[]) {
  const sorted = [...results].sort((a, b) => b.scores.total - a.scores.total);

  console.log("\n" + "═".repeat(80));
  console.log("  GEMINI MODEL EVALUATION RESULTS");
  console.log("═".repeat(80));
  console.log(
    pad("Model", 36) +
      pad("Schema", 8) +
      pad("Narr.", 8) +
      pad("Latency", 9) +
      pad("Effic.", 8) +
      "Total",
  );
  console.log("─".repeat(80));

  for (const r of sorted) {
    const name = r.error ? `${r.modelId} (ERROR)` : r.modelId;
    const latStr = r.latencyMs > 0 ? `${(r.latencyMs / 1000).toFixed(1)}s` : "–";
    const row =
      pad(name, 36) +
      pad(String(r.scores.schema), 8) +
      pad(String(r.scores.narrative), 8) +
      pad(latStr, 9) +
      pad(String(r.scores.efficiency), 8) +
      `${r.scores.total}/100`;
    console.log(row);
  }

  console.log("═".repeat(80));

  const winner = sorted[0];
  console.log(`\n  Winner: ${winner.modelId} (${winner.scores.total}/100)`);
  console.log(`\n  Recommendation: Set DEFAULT_MODEL="${winner.modelId}" in`);
  console.log(`  server/src/services/scene-generator.ts\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error(
      "ERROR: GOOGLE_GENERATIVE_AI_API_KEY is not set.\n" +
        "Add it to server/.env and re-run.",
    );
    process.exit(1);
  }

  console.log(`\nTesting ${MODELS.length} Gemini models on scene generation...`);
  console.log(`Prompt: "${TEST_PROMPT}"\n`);

  const results: ModelResult[] = [];

  for (const modelId of MODELS) {
    process.stdout.write(`  Testing ${modelId}... `);
    const result = await testModel(modelId);
    results.push(result);
    if (result.error) {
      console.log(`FAILED (${result.error.slice(0, 60)})`);
    } else {
      console.log(
        `✓ ${result.scenes.length} scenes in ${(result.latencyMs / 1000).toFixed(1)}s → ${result.scores.total}/100`,
      );
    }
  }

  printResults(results);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
