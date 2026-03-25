import { Scene } from "./mockData";
import { AgentStep } from "./agentTypes";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface StoredScene extends Scene {
  generationStatus: "queued" | "generating" | "complete";
  videoUrl?: string;
  previewUrl?: string;
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

const STORAGE_KEY = "motionai_projects";
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
  return crypto.randomUUID();
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
