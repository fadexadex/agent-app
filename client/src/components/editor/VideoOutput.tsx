import { useRef, useState } from "react";
import { Play, Pause, RotateCcw, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scene } from "@/lib/mockData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SingleSceneTimeline from "./SingleSceneTimeline";

interface VideoOutputProps {
  scenes: Scene[];
  selectedScene: number | "all";
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onSelectScene: (scene: number) => void;
  onReorderScenes: (scenes: Scene[]) => void;
  onSeek: (time: number) => void;
  sceneStatuses: {
    status: "queued" | "generating" | "complete";
    progress: number;
    previewUrl?: string;
    videoUrl?: string;
  }[];
  allDone: boolean;
  panelSize?: number;
  // Single scene timeline props
  singleSceneTime?: number;
  onSingleSceneSeek?: (time: number) => void;
  selectedTimestamp?: number | null;
  onTimestampSelect?: (time: number | null) => void;
}

const GRID_THRESHOLD = 40; // Panel size percentage threshold for grid mode

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

interface SortableSceneProps {
  scene: Scene;
  index: number;
  totalDuration: number;
  status: {
    status: "queued" | "generating" | "complete";
    progress: number;
    previewUrl?: string;
    videoUrl?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  layoutMode: "horizontal" | "grid";
}

const SortableScene = ({
  scene,
  index,
  totalDuration,
  status,
  isSelected,
  onSelect,
  layoutMode,
}: SortableSceneProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style =
    layoutMode === "horizontal"
      ? {
          transform: CSS.Transform.toString(transform),
          transition,
          width: `${(scene.duration / totalDuration) * 100}%`,
          minWidth: "60px",
        }
      : {
          transform: CSS.Transform.toString(transform),
          transition,
          aspectRatio: "9/16",
          maxHeight: "160px",
        };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative h-full rounded-lg overflow-hidden transition-all group",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-card",
        isDragging && "opacity-50 z-50",
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 z-10 p-1 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3 h-3 text-white" />
      </div>

      <button onClick={onSelect} className="w-full h-full">
        {/* Scene gradient background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            status.status === "complete"
              ? scene.gradient || "from-primary/20 to-primary/5"
              : "from-muted/50 to-muted/30",
          )}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Generating progress overlay */}
        {status.status === "generating" && (
          <>
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary/30"
              animate={{ width: `${status.progress}%` }}
              transition={{ duration: 0.3 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-1">
                {[0, 1, 2].map((j) => (
                  <motion.div
                    key={j}
                    className="w-1.5 h-1.5 rounded-full bg-white"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: j * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Queued overlay */}
        {status.status === "queued" && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/40" />
          </div>
        )}

        {/* Scene info */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <span className="text-[9px] font-medium text-white/90 truncate block drop-shadow">
            {scene.title}
          </span>
          <span className="text-[8px] text-white/60">{scene.duration}s</span>
        </div>

        {/* Scene type badge */}
        {status.status === "complete" && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[7px] font-semibold uppercase tracking-wide bg-black/50 text-white/80 backdrop-blur-sm">
            {scene.type}
          </span>
        )}
      </button>
    </div>
  );
};

const VideoOutput = ({
  scenes,
  selectedScene,
  isPlaying,
  currentTime,
  totalDuration,
  onTogglePlay,
  onReset,
  onSelectScene,
  onReorderScenes,
  onSeek,
  sceneStatuses,
  allDone,
  panelSize = 30,
  singleSceneTime = 0,
  onSingleSceneSeek,
  selectedTimestamp = null,
  onTimestampSelect,
}: VideoOutputProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingSeeker, setIsDraggingSeeker] = useState(false);
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const layoutMode = panelSize > GRID_THRESHOLD ? "grid" : "horizontal";

  // Check if we should show single scene timeline
  const showSingleSceneTimeline =
    selectedScene !== "all" &&
    sceneStatuses[selectedScene]?.status === "complete" &&
    onSingleSceneSeek &&
    onTimestampSelect;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = scenes.findIndex((s) => s.id === active.id);
      const newIndex = scenes.findIndex((s) => s.id === over.id);
      onReorderScenes(arrayMove(scenes, oldIndex, newIndex));
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allDone || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * totalDuration);
  };

  const handleSeekerDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSeeker || !allDone || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * totalDuration);
  };

  // Show single scene timeline for completed single scene
  if (showSingleSceneTimeline && selectedScene !== "all") {
    const sceneIndex = selectedScene as number;
    return (
      <SingleSceneTimeline
        scene={scenes[sceneIndex]}
        currentTime={singleSceneTime}
        onSeek={onSingleSceneSeek!}
        selectedTimestamp={selectedTimestamp}
        onTimestampSelect={onTimestampSelect!}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        previewUrl={sceneStatuses[sceneIndex]?.previewUrl}
        videoUrl={sceneStatuses[sceneIndex]?.videoUrl}
      />
    );
  }

  return (
    <div
      className="h-full flex flex-col bg-card border-t border-border"
      onMouseMove={handleSeekerDrag}
      onMouseUp={() => setIsDraggingSeeker(false)}
      onMouseLeave={() => setIsDraggingSeeker(false)}
    >
      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          disabled={!allDone}
          onClick={onTogglePlay}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          disabled={!allDone}
          onClick={onReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
      </div>

      {/* Timeline with thumbnails */}
      <div
        className={cn(
          "flex-1 px-4 py-3",
          layoutMode === "grid" ? "overflow-y-auto" : "overflow-hidden",
        )}
      >
        <div
          ref={timelineRef}
          className={cn(
            "relative",
            layoutMode === "horizontal"
              ? "flex gap-1 h-full"
              : "grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-2 auto-rows-max",
            allDone && "cursor-pointer",
          )}
          onClick={
            layoutMode === "horizontal" ? handleTimelineClick : undefined
          }
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={scenes.map((s) => s.id)}
              strategy={
                layoutMode === "horizontal"
                  ? horizontalListSortingStrategy
                  : rectSortingStrategy
              }
            >
              {scenes.map((scene, i) => (
                <SortableScene
                  key={scene.id}
                  scene={scene}
                  index={i}
                  totalDuration={totalDuration}
                  status={sceneStatuses[i]}
                  isSelected={selectedScene === i}
                  onSelect={() => onSelectScene(i)}
                  layoutMode={layoutMode}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Playhead seeker line - only in horizontal mode */}
          {allDone && layoutMode === "horizontal" && (
            <div
              className="absolute top-0 bottom-0 z-20"
              style={{ left: `${progress}%` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingSeeker(true);
              }}
            >
              {/* Top handle - draggable */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform" />
              {/* Vertical line */}
              <div className="absolute top-2 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary shadow-lg pointer-events-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoOutput;
