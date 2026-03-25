import { Trash2, Play, Clock, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoredProject, getRelativeTime } from "@/lib/storage";
import { framesToSeconds } from "@/lib/mockData";

interface ProjectCardProps {
  project: StoredProject;
  onOpen: (project: StoredProject) => void;
  onDelete: (projectId: string) => void;
}

export default function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const totalDuration = project.scenes.reduce(
    (acc, s) => acc + framesToSeconds(s.duration),
    0
  );
  const completedScenes = project.scenes.filter(
    (s) => s.generationStatus === "complete"
  ).length;

  const statusBadge = {
    complete: { label: "Complete", className: "bg-green-500/20 text-green-400" },
    generating: { label: "In Progress", className: "bg-yellow-500/20 text-yellow-400" },
    partial: { label: "Partial", className: "bg-orange-500/20 text-orange-400" },
  }[project.status];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  // Get gradient from first scene or use default
  const gradient = project.scenes[0]?.gradient || "from-primary/20 to-accent/10";

  return (
    <div
      onClick={() => onOpen(project)}
      className="group relative bg-card border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
    >
      {/* Thumbnail / Preview */}
      <div className="aspect-video relative overflow-hidden">
        {project.thumbnail ? (
          <video
            src={project.thumbnail}
            className="w-full h-full object-cover"
            muted
            playsInline
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Film className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="h-5 w-5 text-black ml-0.5" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-red-500/80 text-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">
          {project.prompt.length > 60
            ? project.prompt.slice(0, 60) + "..."
            : project.prompt}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getRelativeTime(project.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Film className="h-3 w-3" />
            {completedScenes}/{project.scenes.length} scenes
          </span>
          <span>{totalDuration}s</span>
        </div>
      </div>
    </div>
  );
}
