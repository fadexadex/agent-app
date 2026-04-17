import type { Scene } from "@/lib/mockData";

interface ExportSceneStatusLike {
  previewSceneId?: string;
  videoUrl?: string;
}

export function getProjectVideoUrl(
  index: number,
  scenes: Scene[],
  sceneStatuses: ExportSceneStatusLike[] | undefined,
  hasProjectId: boolean,
): string {
  const status = sceneStatuses?.[index];
  if (status?.videoUrl) return status.videoUrl;

  // Only use the legacy flat preview path when there's no project context.
  // For project-backed exports, falling back here can accidentally load an
  // unrelated old render with the same scene id (e.g. "the-hook").
  if (hasProjectId) return "";

  const id = status?.previewSceneId || scenes[index]?.id || "";
  return id ? `/previews/${id}.mp4` : "";
}
