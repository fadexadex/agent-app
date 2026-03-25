import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Film, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAllProjects, deleteProject, StoredProject } from "@/lib/storage";
import ProjectCard from "@/components/videos/ProjectCard";

export default function VideosPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<StoredProject[]>(getAllProjects);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleOpenProject = (project: StoredProject) => {
    // Navigate to editor with project data
    navigate("/editor", {
      state: {
        projectId: project.id,
        prompt: project.prompt,
        scenes: project.scenes,
        fromVideos: true,
      },
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteTarget(projectId);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteProject(deleteTarget);
      setProjects(getAllProjects());
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Film className="h-4 w-4 text-primary-foreground" />
            </div>
            <span
              className="font-bold text-lg"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              My Videos
            </span>
          </div>
        </div>
        <Button onClick={() => navigate("/")} className="gap-2">
          <Plus className="h-4 w-4" />
          New Video
        </Button>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Film className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first AI-generated video by describing your product or
              brand.
            </p>
            <Button onClick={() => navigate("/")} size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Video
            </Button>
          </div>
        ) : (
          /* Project Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={handleOpenProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this video project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the project from your saved videos.
              The generated video files on the server will remain until the
              server is restarted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
