import { memo } from "react";
import { PlaySquare, Layers, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Scene } from "@/lib/mockData";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  onReorderScenes?: (newScenes: Scene[]) => void;
}

// ─── Sortable scene item ────────────────────────────────────────────────────

interface SceneItemProps {
  scene: Scene;
  index: number;
  isSelected: boolean;
  versionInfo?: SceneVersionInfo;
  onSelect: () => void;
}

const SceneItem = memo(function SceneItem({ scene, index, isSelected, versionInfo, onSelect }: SceneItemProps) {
  const showVersion = versionInfo && versionInfo.currentVersion > 1;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-2 rounded transition-colors group",
        isSelected
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-secondary",
        isDragging && "z-50 shadow-lg"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "cursor-grab active:cursor-grabbing shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected ? "text-primary-foreground/60 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Scene button */}
      <button
        onClick={onSelect}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <PlaySquare className={cn("h-3.5 w-3.5 shrink-0", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
        <span className="truncate flex-1 text-xs font-medium">{scene.name}</span>
        {showVersion && (
          <span className={cn(
            "text-[9px] px-1.5 py-0.5 rounded shrink-0",
            isSelected
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            v{versionInfo!.currentVersion}
          </span>
        )}
      </button>
    </div>
  );
});

// ─── Main SceneList component ─────────────────────────────────────────────────

const SceneList = memo(function SceneList({
  scenes,
  selectedScene,
  onSelectScene,
  onOpenAddScene,
  sceneVersions,
  onReorderScenes,
}: SceneListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = scenes.findIndex((s) => s.id === active.id);
    const newIndex = scenes.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(scenes, oldIndex, newIndex);
    onReorderScenes?.(reordered);

    // Update selected scene index to follow the moved item
    if (typeof selectedScene === "number") {
      if (selectedScene === oldIndex) {
        onSelectScene(newIndex);
      } else if (oldIndex < selectedScene && newIndex >= selectedScene) {
        onSelectScene(selectedScene - 1);
      } else if (oldIndex > selectedScene && newIndex <= selectedScene) {
        onSelectScene(selectedScene + 1);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="p-3 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Scenes
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={scenes.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0.5">
              {scenes.map((scene, i) => (
                <SceneItem
                  key={scene.id}
                  scene={scene}
                  index={i}
                  isSelected={selectedScene === i}
                  versionInfo={sceneVersions?.[i]}
                  onSelect={() => onSelectScene(i)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Footer: Add + All Scenes */}
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
});

export default SceneList;
