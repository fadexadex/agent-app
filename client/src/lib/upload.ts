export interface UploadedAsset {
  url: string;
  filename: string;
  mediaType: string;
  size: number;
}

export type UploadedAssetLike = UploadedAsset | string;

export function getUploadedAssetUrl(asset: UploadedAssetLike): string {
  return typeof asset === "string" ? asset : asset.url;
}

export function getUploadedAssetFilename(
  asset: UploadedAssetLike,
): string | undefined {
  if (typeof asset !== "string") {
    return asset.filename;
  }

  return asset.split("/").pop();
}

export function getUploadedAssetMediaType(
  asset: UploadedAssetLike,
): string | undefined {
  return typeof asset === "string" ? undefined : asset.mediaType;
}

export function isUploadedAssetObject(
  asset: UploadedAssetLike,
): asset is UploadedAsset {
  return typeof asset !== "string";
}

export async function uploadFile(file: File): Promise<UploadedAsset> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to upload: ${error}`);
  }

  const data = await res.json();
  return {
    url: data.url,
    filename: data.filename,
    mediaType: data.mimetype,
    size: data.size,
  };
}
