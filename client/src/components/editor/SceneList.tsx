import { PlaySquare, Layers, Plus, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scene } from "@/lib/mockData";

interface SceneStatus {
  status: "queued" | "generating" | "complete";
  progress: number;
  previewUrl?: string;
}

interface SceneVersionInfo {
  currentVersion: number;
  hasMultipleVersions: boolean;
}

interface SceneListProps {
  scenes: Scene[];
  selectedScene: number | "all";
  onSelectScene: (scene: number | "all") => void;
  sceneStatuses: SceneStatus[];
  onOpenAddScene: () => void;
  sceneVersions?: SceneVersionInfo[];
}

const SceneList = ({ scenes, selectedScene, onSelectScene, onOpenAddScene, sceneVersions }: SceneListProps) => {
  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="p-3 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Scenes
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {scenes.map((scene, i) => {
            const isSelected = selectedScene === i;
            const versionInfo = sceneVersions?.[i];
            const showVersion = versionInfo && versionInfo.currentVersion > 1;

            return (
              <button
                key={scene.id}
                onClick={() => onSelectScene(i)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors text-sm font-medium",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <PlaySquare className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
                <span className="truncate flex-1 text-left">{scene.name}</span>
                {showVersion && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded shrink-0",
                    isSelected
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    v{versionInfo.currentVersion}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* All Scenes button */}
      <div className="p-2 border-t border-border flex flex-col gap-1.5">
        <button
          onClick={onOpenAddScene}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Scene
        </button>
        <button
          onClick={() => onSelectScene("all")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors text-sm font-medium",
            selectedScene === "all"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-secondary"
          )}
        >
          <Layers className={cn("h-4 w-4 shrink-0", selectedScene === "all" ? "text-primary-foreground" : "text-muted-foreground")} />
          <span>All Scenes</span>
        </button>
      </div>
    </div>
  );
};

export default SceneList;
