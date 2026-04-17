import { readFile } from "fs/promises";
import { basename, join, resolve } from "path";
import mime from "mime-types";

export interface UploadedAssetDescriptor {
  sourceUrl: string;
  staticFilePath: string;
  filename: string;
  mediaType: string;
  buffer: Buffer;
  kind: "image" | "file";
}

export interface UploadedAssetInput {
  url: string;
  filename?: string;
  mediaType?: string;
}

const REMOTION_PUBLIC_DIR = resolve(process.cwd(), "../remotion/public");
const SUPPORTED_ASSET_PREFIXES = ["/uploads/", "/generated/"] as const;

export function isSupportedUploadedAssetUrl(url: string): boolean {
  return SUPPORTED_ASSET_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export function normalizeUploadedAssetUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return isSupportedUploadedAssetUrl(normalized) ? normalized : null;
}

export function createAssetInlineBase64(
  asset: UploadedAssetDescriptor,
): string {
  return asset.buffer.toString("base64");
}

export function buildReferenceAssetsBlock(
  assets: UploadedAssetDescriptor[],
): string {
  if (assets.length === 0) {
    return "";
  }

  const assetLines = assets
    .map(
      (asset) =>
        `- "${asset.filename}" -> staticFile('${asset.staticFilePath}')`,
    )
    .join("\n");

  return (
    `[REFERENCE_ASSETS]\n` +
    `The user uploaded reference asset(s) that are already saved in the Remotion public folder.\n` +
    `Use the exact staticFile() path listed below when writing scene code.\n` +
    `Do not invent alternate filenames, placeholder assets, or replacement logos.\n\n` +
    `${assetLines}\n` +
    `[/REFERENCE_ASSETS]\n\n`
  );
}

export function toModelAssetPart(asset: UploadedAssetDescriptor) {
  if (asset.kind === "image") {
    return {
      type: "image" as const,
      image: asset.buffer,
      mediaType: asset.mediaType,
    };
  }

  return {
    type: "file" as const,
    data: asset.buffer,
    mediaType: asset.mediaType,
    filename: asset.filename,
  };
}

export async function resolveUploadedAsset(
  input: UploadedAssetInput,
): Promise<UploadedAssetDescriptor | null> {
  const sourceUrl = normalizeUploadedAssetUrl(input.url);
  if (!sourceUrl) {
    return null;
  }

  const staticFilePath = sourceUrl.replace(/^\//, "");
  const absolutePath = join(REMOTION_PUBLIC_DIR, staticFilePath);
  const buffer = await readFile(absolutePath);
  const mediaType =
    input.mediaType ||
    mime.lookup(absolutePath) ||
    "application/octet-stream";

  return {
    sourceUrl,
    staticFilePath,
    filename: input.filename || basename(staticFilePath),
    mediaType,
    buffer,
    kind: mediaType.startsWith("image/") ? "image" : "file",
  };
}

export async function resolveUploadedAssets(
  inputs: UploadedAssetInput[],
): Promise<UploadedAssetDescriptor[]> {
  const dedupedInputs = new Map<string, UploadedAssetInput>();

  for (const input of inputs) {
    const normalizedUrl = normalizeUploadedAssetUrl(input.url);
    if (!normalizedUrl || dedupedInputs.has(normalizedUrl)) {
      continue;
    }

    dedupedInputs.set(normalizedUrl, {
      ...input,
      url: normalizedUrl,
    });
  }

  const assets = await Promise.all(
    Array.from(dedupedInputs.values()).map((input) =>
      resolveUploadedAsset(input),
    ),
  );

  return assets.filter(
    (asset): asset is UploadedAssetDescriptor => asset !== null,
  );
}
