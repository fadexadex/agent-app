import { useRef, useState, useCallback, useMemo } from "react";
import { Play, Pause, SkipBack, RotateCcw, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scene, framesToSeconds } from "@/lib/mockData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import SingleSceneTimeline from "./SingleSceneTimeline";

interface VideoOutputProps {
  scenes: Scene[];
  selectedScene: number | "all";
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onSelectScene: (scene: number | "all") => void;
  onReorderScenes: (scenes: Scene[]) => void;
  onSeek: (time: number) => void;
  onScrub?: (time: number) => void;
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
  onSpeedChange?: (speed: number) => void;
  audioUrl?: string;
  audioTrackName?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const TRACK_HEIGHT = 28; // px — consistent row height (matches SingleSceneTimeline)
const RULER_HEIGHT = 24; // px — increased for better timestamp visibility
const SCALE_SPLIT_COUNT = 4; // sub-ticks per major interval
const LABEL_COL_WIDTH = 112; // px

/** Category → clip colour — inspired by xzdarcy effectId → style mapping */
const CATEGORY_COLORS: Record<string, { bg: string; selected: string; dim: string }> = {
  hook:       { bg: "bg-violet-600/80",  selected: "bg-violet-500 ring-1 ring-violet-300 ring-inset", dim: "bg-violet-700/50" },
  intro:      { bg: "bg-indigo-600/80",  selected: "bg-indigo-500 ring-1 ring-indigo-300 ring-inset", dim: "bg-indigo-700/50" },
  feature:    { bg: "bg-blue-600/80",    selected: "bg-blue-500 ring-1 ring-blue-300 ring-inset",     dim: "bg-blue-700/50" },
  benefit:    { bg: "bg-cyan-600/80",    selected: "bg-cyan-500 ring-1 ring-cyan-300 ring-inset",     dim: "bg-cyan-700/50" },
  cta:        { bg: "bg-emerald-600/80", selected: "bg-emerald-500 ring-1 ring-emerald-300 ring-inset",dim: "bg-emerald-700/50" },
  transition: { bg: "bg-gray-600/80",   selected: "bg-gray-500 ring-1 ring-gray-300 ring-inset",     dim: "bg-gray-700/50" },
};
const DEFAULT_COLORS = { bg: "bg-blue-600/80", selected: "bg-blue-500 ring-1 ring-blue-300 ring-inset", dim: "bg-blue-700/50" };

const SPEEDS = [0.5, 1, 2] as const;
type Speed = (typeof SPEEDS)[number];

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
  onScrub,
  sceneStatuses,
  allDone,
  panelSize = 30,
  singleSceneTime = 0,
  onSingleSceneSeek,
  selectedTimestamp = null,
  onTimestampSelect,
  onSpeedChange,
  audioUrl,
  audioTrackName,
  videoRef,
}: VideoOutputProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const labelColRef = useRef<HTMLDivElement>(null); // synced label column
  const playheadRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const autoScrollRaf = useRef<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [speed, setSpeed] = useState<Speed>(1);
  const [isDragging, setIsDragging] = useState(false);

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Check if we should show single scene timeline
  const showSingleSceneTimeline =
    selectedScene !== "all" &&
    sceneStatuses[selectedScene as number]?.status === "complete" &&
    onSingleSceneSeek &&
    onTimestampSelect;

  // Cumulative start times (in seconds)
  const sceneStarts = useMemo(() => {
    const starts: number[] = [];
    let acc = 0;
    for (const scene of scenes) {
      starts.push(acc);
      acc += framesToSeconds(scene.duration);
    }
    return starts;
  }, [scenes]);

  // ── Ruler ticks with sub-ticks (scaleSplitCount from xzdarcy) ──────────────
  const majorInterval = zoom >= 4 ? 1 : zoom >= 2 ? 2 : 5;
  const minorInterval = majorInterval / SCALE_SPLIT_COUNT;
  const ticks = useMemo(() => {
    const result: { time: number; major: boolean }[] = [];
    if (totalDuration <= 0) return result;
    for (let t = 0; t <= totalDuration + minorInterval / 2; t += minorInterval) {
      const rounded = Math.round(t * 1000) / 1000;
      const major = Math.round((rounded % majorInterval) * 1000) < Math.round(minorInterval * 1000 * 0.5);
      result.push({ time: rounded, major });
    }
    return result;
  }, [totalDuration, majorInterval, minorInterval]);

  const handleSpeedChange = (s: Speed) => {
    setSpeed(s);
    onSpeedChange?.(s);
  };

  const handleZoomReset = () => {
    setZoom(1);
    scrollContainerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  // Convert pointer X to time (accounts for horizontal scroll + zoom)
  const computeTimeFromPointer = useCallback(
    (e: React.PointerEvent): number => {
      const container = scrollContainerRef.current;
      if (!container || totalDuration <= 0) return 0;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const pct = Math.max(0, Math.min(1, x / container.scrollWidth));
      return pct * totalDuration;
    },
    [totalDuration],
  );

  // Directly mutate playhead DOM position — zero React re-renders
  const movePlayheadImperative = useCallback(
    (time: number) => {
      if (playheadRef.current && totalDuration > 0) {
        const pct = (time / totalDuration) * 100;
        playheadRef.current.style.left = `${pct}%`;
      }
    },
    [totalDuration],
  );

  // Auto-scroll at viewport edges while dragging (xzdarcy autoScroll)
  const startAutoScroll = useCallback((direction: "left" | "right") => {
    const step = () => {
      const container = scrollContainerRef.current;
      if (!container || !isDraggingRef.current) return;
      container.scrollLeft += direction === "right" ? 8 : -8;
      autoScrollRaf.current = requestAnimationFrame(step);
    };
    if (autoScrollRaf.current === null) {
      autoScrollRaf.current = requestAnimationFrame(step);
    }
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRaf.current !== null) {
      cancelAnimationFrame(autoScrollRaf.current);
      autoScrollRaf.current = null;
    }
  }, []);

  // Find which scene index a global time falls into
  const findSceneAtTime = useCallback(
    (time: number): number => {
      for (let i = scenes.length - 1; i >= 0; i--) {
        if (time >= sceneStarts[i]) return i;
      }
      return 0;
    },
    [scenes, sceneStarts],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!allDone || e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const time = computeTimeFromPointer(e);
    movePlayheadImperative(time);

    // In "all scenes" mode, don't navigate to individual scene
    if (selectedScene !== "all") {
      onScrub?.(time - sceneStarts[findSceneAtTime(time)]);
      onSelectScene(findSceneAtTime(time));
    }
    // Don't call onSeek here for "all scenes" - wait until pointer up
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const time = computeTimeFromPointer(e);
    movePlayheadImperative(time);

    // During drag, only scrub video for single scene mode
    // For "all scenes" mode, just update playhead visually (state updates on pointer up)
    if (selectedScene !== "all") {
      const sceneIdx = findSceneAtTime(time);
      const relativeTime = time - sceneStarts[sceneIdx];
      onScrub?.(relativeTime);
    }

    // Auto-scroll near edges
    const container = scrollContainerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const edge = 40;
      if (e.clientX < rect.left + edge) startAutoScroll("left");
      else if (e.clientX > rect.right - edge) startAutoScroll("right");
      else stopAutoScroll();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    stopAutoScroll();
    e.currentTarget.releasePointerCapture(e.pointerId);
    const time = computeTimeFromPointer(e);

    // In "all scenes" mode, don't auto-navigate to individual scene
    if (selectedScene !== "all") {
      const sceneIdx = findSceneAtTime(time);
      onSelectScene(sceneIdx);
    }
    onSeek(time);
  };

  // Handle double-click to go to specific scene
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allDone) return;
    const time = computeTimeFromPointer(e as unknown as React.PointerEvent<HTMLDivElement>);
    const sceneIdx = findSceneAtTime(time);
    onSelectScene(sceneIdx);
  };

  // Generate ruler ticks based on zoom — removed; now uses `ticks` memo above

  // Show single scene timeline for a completed single scene
  if (showSingleSceneTimeline && typeof selectedScene === "number") {
    const sceneIndex = selectedScene;
    return (
      <SingleSceneTimeline
        scene={scenes[sceneIndex]}
        currentTime={singleSceneTime}
        onSeek={onSingleSceneSeek!}
        onScrub={onScrub}
        selectedTimestamp={selectedTimestamp}
        onTimestampSelect={onTimestampSelect!}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        previewUrl={sceneStatuses[sceneIndex]?.previewUrl}
        videoUrl={sceneStatuses[sceneIndex]?.videoUrl}
        speed={speed}
        onSpeedChange={handleSpeedChange}
        audioUrl={audioUrl}
        audioTrackName={audioTrackName}
        videoRef={videoRef}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-card border-t border-border select-none">
      {/* ── Controls bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground bg-muted/50 hover:bg-muted"
            disabled={!allDone}
            onClick={onReset}
            title="Go to start"
          >
            <SkipBack className="h-4 w-4" fill="currentColor" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 bg-black text-white hover:bg-black/90 rounded-md dark:bg-white dark:text-black dark:hover:bg-white/90"
            disabled={!allDone}
            onClick={onTogglePlay}
          >
            {isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground bg-muted/50 hover:bg-muted"
            disabled={!allDone}
            onClick={onReset}
            title="Replay"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm font-mono ml-2">
          <span className="text-muted-foreground tabular-nums">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
          <span className="text-foreground font-sans text-sm font-medium">
            {selectedScene === "all" ? "All Scenes" : scenes[selectedScene as number]?.name}
          </span>
        </div>

        <div className="flex-1" />

        {/* Speed pills */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-md border border-border/50">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-sm transition-colors",
                speed === s
                  ? "bg-black text-white shadow-sm font-medium dark:bg-white dark:text-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {s}×
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-md border border-border/50">
          <button
            onClick={handleZoomReset}
            className={cn(
              "text-xs px-2.5 py-1 rounded-sm transition-colors font-medium",
              zoom === 1 ? "text-foreground bg-black text-white dark:bg-white dark:text-black" : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            Fit
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(1, parseFloat((z - 0.5).toFixed(1))))}
            className="text-muted-foreground hover:text-foreground hover:bg-muted w-7 h-6 flex items-center justify-center rounded-sm transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(8, parseFloat((z + 0.5).toFixed(1))))}
            className="text-muted-foreground hover:text-foreground hover:bg-muted w-7 h-6 flex items-center justify-center rounded-sm transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a] min-h-0 relative px-4 py-6">
        
        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className={cn(
            "flex-1 overflow-x-auto overflow-y-hidden relative custom-scrollbar",
            allDone ? "cursor-ew-resize" : "cursor-default"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          <div style={{ width: `${zoom * 100}%`, minWidth: "100%" }} className="flex flex-col h-full relative">
            
            {/* Top time labels */}
            <div className="flex justify-between items-end mb-2 text-[10px] text-white/50 font-mono select-none px-2 shrink-0">
               <span>0:00.0</span>
               <span>{formatTime(totalDuration)}.0</span>
            </div>

            {/* Track Container */}
            <div className="relative h-14 bg-black/50 border border-white/10 rounded-sm w-full flex overflow-hidden shrink-0">
              {scenes.map((scene, i) => {
                const durationSec = framesToSeconds(scene.duration);
                const widthPct = totalDuration > 0 ? (durationSec / totalDuration) * 100 : 0;
                const isSelected = selectedScene === i;
                
                // Replicating the purple colors from the image
                const bgClass = isSelected ? "bg-[#5326a6]" : "bg-[#332269] hover:bg-[#412885]";
                
                return (
                  <div 
                    key={scene.id} 
                    className={cn(
                      "h-full border-r border-black/80 flex items-center px-3 transition-colors relative overflow-hidden",
                      bgClass
                    )}
                    style={{ width: `${widthPct}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectScene(i);
                    }}
                  >
                    <span className="text-[11px] text-white/90 font-medium truncate pointer-events-none select-none z-10">
                      {scene.name}
                    </span>

                    {/* Progress bar inside block if generating */}
                    {sceneStatuses[i]?.status === "generating" && (
                       <motion.div
                         className="absolute inset-y-0 left-0 bg-white/20"
                         animate={{ width: `${sceneStatuses[i].progress}%` }}
                         transition={{ duration: 0.3 }}
                       />
                    )}
                  </div>
                )
              })}

              {/* Red Playhead */}
              {totalDuration > 0 && (
                <div
                  ref={playheadRef}
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={isDragging ? { willChange: "left" } : { left: `${progress}%`, willChange: "left" }}
                >
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                  <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto cursor-ew-resize -top-2">
                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-500"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom ruler */}
            <div className="flex relative h-6 mt-1 text-[10px] text-white/40 font-mono select-none shrink-0">
              {scenes.map((scene, i) => {
                const startPct = totalDuration > 0 ? (sceneStarts[i] / totalDuration) * 100 : 0;
                return (
                  <div key={i} className="absolute top-0 flex flex-col" style={{ left: `${startPct}%` }}>
                    <span className="mt-1 pl-1">
                      {formatTime(sceneStarts[i])}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-auto flex justify-center pb-2 shrink-0">
          <span className="text-[11px] text-white/30 font-sans">
            Double-click a scene to jump to it · Drag to trim
          </span>
        </div>
      </div>

    </div>
  );
};

export default VideoOutput;
