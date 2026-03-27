import { Scene } from "./mockData";
import { AgentStep } from "./agentTypes";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SceneVersion {
  id: string;
  videoUrl: string;
  previewUrl?: string;
  createdAt: number;
  prompt?: string; // refinement prompt that created this version
}

export interface StoredScene extends Scene {
  generationStatus: "queued" | "generating" | "complete";
  videoUrl?: string;
  previewUrl?: string;
  // Versioning support
  currentVersion?: number;
  versions?: SceneVersion[];
}

export interface AudioTrack {
  trackId: string;
  volume: number; // 0-1
}

export interface StoredProject {
  id: string;
  prompt: string;
  createdAt: number;
  updatedAt: number;
  status: "generating" | "complete" | "partial";
  scenes: StoredScene[];
  thumbnail?: string;
  agentSteps?: Record<number, AgentStep[]>;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "fusion_projects";
const MAX_PROJECTS = 20;

// ─── Core CRUD Operations ──────────────────────────────────────────────────────

export function getAllProjects(): StoredProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const projects: StoredProject[] = JSON.parse(data);
    // Sort by updatedAt descending (most recent first)
    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function getProject(id: string): StoredProject | null {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

export function saveProject(project: StoredProject): void {
  const projects = getAllProjects();
  const existingIndex = projects.findIndex((p) => p.id === project.id);

  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.unshift(project);
  }

  // Prune if over limit
  if (projects.length > MAX_PROJECTS) {
    projects.splice(MAX_PROJECTS);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    // If quota exceeded, try pruning more aggressively
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      projects.splice(Math.floor(MAX_PROJECTS / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }
}

export function deleteProject(id: string): void {
  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function generateProjectId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for HTTP environments (like AWS Beanstalk without SSL)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createProjectFromScenes(
  prompt: string,
  scenes: Scene[],
  sceneStatuses?: Array<{ status: string; videoUrl?: string; previewUrl?: string }>
): StoredProject {
  const now = Date.now();
  const storedScenes: StoredScene[] = scenes.map((scene, i) => ({
    ...scene,
    generationStatus: (sceneStatuses?.[i]?.status as StoredScene["generationStatus"]) || "queued",
    videoUrl: sceneStatuses?.[i]?.videoUrl,
    previewUrl: sceneStatuses?.[i]?.previewUrl,
  }));

  return {
    id: generateProjectId(),
    prompt,
    createdAt: now,
    updatedAt: now,
    status: "generating",
    scenes: storedScenes,
    thumbnail: storedScenes.find((s) => s.videoUrl)?.videoUrl,
  };
}

export function updateProjectSceneStatus(
  projectId: string,
  sceneIndex: number,
  status: StoredScene["generationStatus"],
  videoUrl?: string,
  previewUrl?: string
): void {
  const project = getProject(projectId);
  if (!project || !project.scenes[sceneIndex]) return;

  project.scenes[sceneIndex].generationStatus = status;
  if (videoUrl) project.scenes[sceneIndex].videoUrl = videoUrl;
  if (previewUrl) project.scenes[sceneIndex].previewUrl = previewUrl;
  project.updatedAt = Date.now();

  // Update thumbnail if this is the first scene with a video
  if (videoUrl && !project.thumbnail) {
    project.thumbnail = videoUrl;
  }

  // Check if all scenes are complete
  const allComplete = project.scenes.every((s) => s.generationStatus === "complete");
  const someComplete = project.scenes.some((s) => s.generationStatus === "complete");

  if (allComplete) {
    project.status = "complete";
  } else if (someComplete) {
    project.status = "partial";
  }

  saveProject(project);
}

export function updateProjectAgentSteps(
  projectId: string,
  agentSteps: Record<number, AgentStep[]>
): void {
  const project = getProject(projectId);
  if (!project) return;
  project.agentSteps = { ...project.agentSteps, ...agentSteps };
  project.updatedAt = Date.now();
  saveProject(project);
}

export function updateProjectSceneAudioTrack(
  projectId: string,
  sceneIndex: number,
  audioTrack: AudioTrack | undefined
): void {
  const project = getProject(projectId);
  if (!project || !project.scenes[sceneIndex]) return;
  project.scenes[sceneIndex].audioTrack = audioTrack;
  project.updatedAt = Date.now();
  saveProject(project);
}

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return days === 1 ? "Yesterday" : `${days} days ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

// ─── Scene Versioning ─────────────────────────────────────────────────────────

const MAX_VERSIONS_PER_SCENE = 5;

/**
 * Add a new version to a scene's version history.
 * Called when a refinement completes successfully.
 */
export function addSceneVersion(
  projectId: string,
  sceneIndex: number,
  version: Omit<SceneVersion, "id" | "createdAt">
): void {
  const project = getProject(projectId);
  if (!project || !project.scenes[sceneIndex]) return;

  const scene = project.scenes[sceneIndex];
  const newVersion: SceneVersion = {
    id: generateProjectId(),
    videoUrl: version.videoUrl,
    previewUrl: version.previewUrl,
    createdAt: Date.now(),
    prompt: version.prompt,
  };

  // Initialize versions array if needed
  if (!scene.versions) {
    scene.versions = [];
  }

  // If this is the first version and scene already has a video, save current as v1
  if (scene.versions.length === 0 && scene.videoUrl) {
    scene.versions.push({
      id: generateProjectId(),
      videoUrl: scene.videoUrl,
      previewUrl: scene.previewUrl,
      createdAt: project.createdAt,
      prompt: undefined, // original generation
    });
  }

  // Add new version
  scene.versions.push(newVersion);

  // Prune old versions if exceeding limit
  if (scene.versions.length > MAX_VERSIONS_PER_SCENE) {
    scene.versions = scene.versions.slice(-MAX_VERSIONS_PER_SCENE);
  }

  // Update current version number and video URL
  scene.currentVersion = scene.versions.length;
  scene.videoUrl = version.videoUrl;
  scene.previewUrl = version.previewUrl;

  project.updatedAt = Date.now();
  saveProject(project);
}

/**
 * Restore a scene to a previous version.
 * @param versionIndex 0-based index in the versions array
 */
export function restoreSceneVersion(
  projectId: string,
  sceneIndex: number,
  versionIndex: number
): void {
  const project = getProject(projectId);
  if (!project || !project.scenes[sceneIndex]) return;

  const scene = project.scenes[sceneIndex];
  if (!scene.versions || !scene.versions[versionIndex]) return;

  const targetVersion = scene.versions[versionIndex];

  // Update scene to use the restored version
  scene.videoUrl = targetVersion.videoUrl;
  scene.previewUrl = targetVersion.previewUrl;
  scene.currentVersion = versionIndex + 1;

  project.updatedAt = Date.now();
  saveProject(project);
}

/**
 * Get all versions for a scene.
 */
export function getSceneVersions(
  projectId: string,
  sceneIndex: number
): SceneVersion[] {
  const project = getProject(projectId);
  if (!project || !project.scenes[sceneIndex]) return [];
  return project.scenes[sceneIndex].versions || [];
}

/**
 * Get the current version number for a scene (1-based).
 */
export function getSceneCurrentVersion(
  projectId: string,
  sceneIndex: number
): number {
  const project = getProject(projectId);
  if (!project || !project.scenes[sceneIndex]) return 1;
  return project.scenes[sceneIndex].currentVersion || 1;
}
