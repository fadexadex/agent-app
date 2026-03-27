// In-memory store of generated assets (persists during session)
export const generatedAssets: Array<{ id: string; url: string; prompt: string; createdAt: Date }> = [];

export function addGeneratedAsset(id: string, url: string, prompt: string) {
  generatedAssets.push({ id, url, prompt, createdAt: new Date() });
}

export function getGeneratedAssets() {
  return generatedAssets;
}
