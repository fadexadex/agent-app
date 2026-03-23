import { PlaySquare, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scene } from "@/lib/mockData";

interface SceneStatus {
  status: "queued" | "generating" | "complete";
  progress: number;
  previewUrl?: string;
}

interface SceneListProps {
  scenes: Scene[];
  selectedScene: number | "all";
  onSelectScene: (scene: number | "all") => void;
  sceneStatuses: SceneStatus[];
}

const SceneList = ({ scenes, selectedScene, onSelectScene }: SceneListProps) => {
  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-3 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Scenes
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {scenes.map((scene, i) => {
            const isSelected = selectedScene === i;

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
                <span className="truncate">{scene.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* All Scenes button */}
      <div className="p-2 border-t border-border">
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
