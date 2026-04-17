import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdir, rm, writeFile } from "fs/promises";
import { join, resolve } from "path";
import {
  buildReferenceAssetsBlock,
  resolveUploadedAssets,
} from "../lib/uploaded-assets.js";
import { prepareChatMessagesForAgent } from "../lib/chat-request-preparation.js";
import { buildSceneGenerationUserMessage } from "../services/parallel-scene-renderer.js";

const remotionPublicDir = resolve(process.cwd(), "../remotion/public");
const uploadsDir = join(remotionPublicDir, "uploads");
const generatedDir = join(remotionPublicDir, "generated");
const pngPath = join(uploadsDir, "test-logo.png");
const pdfPath = join(generatedDir, "test-spec.pdf");

describe("uploaded asset grounding", () => {
  beforeAll(async () => {
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(generatedDir, { recursive: true });
    await writeFile(pngPath, Buffer.from("fake-png"));
    await writeFile(pdfPath, Buffer.from("%PDF-1.4\nfake"));
  });

  afterAll(async () => {
    await rm(pngPath, { force: true });
    await rm(pdfPath, { force: true });
  });

  it("resolves uploaded assets with exact staticFile paths and de-duplicates repeated urls", async () => {
    const assets = await resolveUploadedAssets([
      { url: "/uploads/test-logo.png", filename: "logo.png" },
      { url: "/uploads/test-logo.png", filename: "logo-duplicate.png" },
      { url: "/generated/test-spec.pdf" },
    ]);

    expect(assets).toHaveLength(2);
    expect(assets[0]).toMatchObject({
      sourceUrl: "/uploads/test-logo.png",
      staticFilePath: "uploads/test-logo.png",
      filename: "logo.png",
      mediaType: "image/png",
      kind: "image",
    });
    expect(assets[0].buffer.equals(Buffer.from("fake-png"))).toBe(true);

    expect(assets[1]).toMatchObject({
      sourceUrl: "/generated/test-spec.pdf",
      staticFilePath: "generated/test-spec.pdf",
      filename: "test-spec.pdf",
      mediaType: "application/pdf",
      kind: "file",
    });
  });

  it("prepares chat messages with grounded inline base64 and one deduplicated reference block", async () => {
    const prepared = await prepareChatMessagesForAgent({
      rawMessages: [
        {
          id: "msg-1",
          role: "user",
          parts: [
            { type: "text", text: "Animate this upload." },
            {
              type: "file",
              url: "/uploads/test-logo.png",
              filename: "logo.png",
              mediaType: "image/png",
            },
          ],
        },
      ],
      legacyAssetUrls: ["/uploads/test-logo.png", "/generated/test-spec.pdf"],
      sceneContext: { id: "scene-123" },
      projectId: "project-abc",
    });

    expect(prepared.referenceAssets).toHaveLength(2);

    const [message] = prepared.messages;
    expect(message.parts[0].type).toBe("text");
    expect(message.parts[0].text).toContain(`[PROJECT_CONTEXT: projectId="project-abc"]`);
    expect(message.parts[0].text).toContain("[SCENE_JSON_PAYLOAD:");
    expect(message.parts[0].text).toContain(
      `staticFile('uploads/test-logo.png')`,
    );
    expect(message.parts[0].text).toContain(
      `staticFile('generated/test-spec.pdf')`,
    );

    const fileParts = message.parts.filter((part: any) => part.type === "file");
    expect(fileParts).toHaveLength(2);
    expect(fileParts[0].url.startsWith("data:")).toBe(false);
    expect(Buffer.from(fileParts[0].url, "base64").equals(Buffer.from("fake-png"))).toBe(true);
    expect(fileParts[1].url.startsWith("data:")).toBe(false);
    expect(
      Buffer.from(fileParts[1].url, "base64").equals(
        Buffer.from("%PDF-1.4\nfake"),
      ),
    ).toBe(true);

    const referenceBlock = buildReferenceAssetsBlock(prepared.referenceAssets);
    expect(referenceBlock.match(/staticFile\('/g)?.length).toBe(2);
  });

  it("adds multimodal asset parts for parallel scene generation instead of prompt text only", async () => {
    const assets = await resolveUploadedAssets([
      { url: "/uploads/test-logo.png" },
      { url: "/generated/test-spec.pdf" },
    ]);

    const message = buildSceneGenerationUserMessage({
      sceneId: "scene-1",
      sceneIndex: 0,
      sceneContext: { title: "Scene One" },
      prompt: "Animate the logo confidently.",
      assets,
    });

    expect(message.content).toHaveLength(3);
    expect(message.content[0]).toMatchObject({ type: "text" });
    expect((message.content[0] as { text: string }).text).toContain(
      `staticFile('uploads/test-logo.png')`,
    );
    expect(message.content[1]).toMatchObject({
      type: "image",
      mediaType: "image/png",
    });
    expect(message.content[2]).toMatchObject({
      type: "file",
      mediaType: "application/pdf",
      filename: "test-spec.pdf",
    });
  });
});
