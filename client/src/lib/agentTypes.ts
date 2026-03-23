// Shared types for agent communication

export interface AgentStep {
  id: number;
  type:
    | "thinking"
    | "explore"
    | "generate"
    | "update"
    | "preview"
    | "render"
    | "complete";
  label: string;
  detail?: string;
  timestamp: number;
  duration?: number;
  status: "pending" | "active" | "complete";
  fileCount?: number;
  files?: string[];
  streamingContent?: string[];
  brief?: string;
  previewUrl?: string; // For triggerPreview results
  videoUrl?: string; // For renderScene results
  renderSceneId?: string; // The Remotion composition ID being rendered
}
