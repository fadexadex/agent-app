import { useRef, useState, useCallback } from "react";
import { Play, Pause, SkipBack } from "lucide-react";
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
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

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
}: VideoOutputProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [zoom, setZoom] = useState(1);
  const [speed, setSpeed] = useState<Speed>(1);

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Check if we should show single scene timeline
  const showSingleSceneTimeline =
    selectedScene !== "all" &&
    sceneStatuses[selectedScene as number]?.status === "complete" &&
    onSingleSceneSeek &&
    onTimestampSelect;

  // Cumulative start times (in seconds)
  const sceneStarts: number[] = [];
  let acc = 0;
  for (const scene of scenes) {
    sceneStarts.push(acc);
    acc += framesToSeconds(scene.duration);
  }

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
    e.currentTarget.setPointerCapture(e.pointerId);
    const time = computeTimeFromPointer(e);
    movePlayheadImperative(time);
    onScrub?.(time - sceneStarts[findSceneAtTime(time)]);
    onSelectScene(findSceneAtTime(time));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const time = computeTimeFromPointer(e);
    movePlayheadImperative(time);
    const sceneIdx = findSceneAtTime(time);
    const relativeTime = time - sceneStarts[sceneIdx];
    onScrub?.(relativeTime);
    // Note: scene selection moved to handlePointerUp to avoid re-render thrashing
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const time = computeTimeFromPointer(e);
    const sceneIdx = findSceneAtTime(time);
    onSelectScene(sceneIdx); // Scene selection only on release (not during drag)
    onSeek(time);
  };

  // Generate ruler ticks based on zoom
  const majorInterval = zoom >= 4 ? 1 : zoom >= 2 ? 2 : 5;
  const minorInterval = zoom >= 4 ? 0.5 : 1;
  const ticks: { time: number; major: boolean }[] = [];
  if (totalDuration > 0) {
    for (let t = 0; t <= totalDuration + 0.001; t += minorInterval) {
      const rounded = Math.round(t * 10) / 10;
      ticks.push({
        time: rounded,
        major: Math.round((rounded % majorInterval) * 10) === 0,
      });
    }
  }

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
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-card border-t border-border select-none">
      {/* ── Controls bar ── */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-border shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          disabled={!allDone}
          onClick={onReset}
          title="Go to start"
        >
          <SkipBack className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          disabled={!allDone}
          onClick={onTogglePlay}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums w-24">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>

        <div className="flex-1" />

        {/* Speed pills */}
        <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={cn(
                "text-[10px] px-2 py-0.5 rounded transition-colors",
                speed === s
                  ? "bg-card text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s}×
            </button>
          ))}
        </div>

        <div className="w-px h-3.5 bg-border mx-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(1, parseFloat((z - 0.5).toFixed(1))))}
            className="text-[10px] w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            −
          </button>
          <button
            onClick={handleZoomReset}
            className={cn(
              "text-[9px] px-1.5 py-0.5 rounded transition-colors font-medium",
              zoom === 1 ? "text-muted-foreground" : "text-foreground bg-muted",
            )}
          >
            Fit
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(8, parseFloat((z + 0.5).toFixed(1))))}
            className="text-[10px] w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="flex-1 flex overflow-hidden bg-[#0d0f14] min-h-0">
        {/* Left: scene label column */}
        <div className="shrink-0 w-28 border-r border-white/10 flex flex-col">
          <div className="h-5 shrink-0 border-b border-white/10 flex items-end px-2 pb-0.5">
            <span className="text-[8px] text-white/20 uppercase tracking-wider">Scenes</span>
          </div>
          <div className="flex-1 overflow-hidden">
            {scenes.map((scene, i) => (
              <div
                key={scene.id}
                className={cn(
                  "h-7 flex items-center px-2 cursor-pointer transition-colors",
                  selectedScene === i ? "bg-white/5" : "hover:bg-white/[0.03]",
                )}
                onClick={() => onSelectScene(i)}
              >
                <span
                  className={cn(
                    "text-[10px] truncate leading-none",
                    selectedScene === i ? "text-white/80" : "text-white/40",
                  )}
                >
                  {scene.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: scrollable timeline */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex-1 overflow-x-auto overflow-y-hidden relative",
            allDone ? "cursor-ew-resize" : "cursor-default",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            style={{ width: `${zoom * 100}%`, minWidth: "100%", position: "relative" }}
            className="h-full flex flex-col"
          >
            {/* Time ruler */}
            <div className="h-5 shrink-0 border-b border-white/10 relative overflow-hidden">
              {ticks.map(({ time, major }) => (
                <div
                  key={time}
                  className="absolute top-0 flex flex-col pointer-events-none"
                  style={{ left: `${(time / (totalDuration || 1)) * 100}%` }}
                >
                  <div className={cn("w-px", major ? "h-3 bg-white/30" : "h-1.5 bg-white/15")} />
                  {major && (
                    <span className="text-[8px] font-mono text-white/35 mt-0.5 pl-1 whitespace-nowrap">
                      {formatTime(time)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Track rows */}
            <div className="flex-1 relative">
              {scenes.map((scene, i) => {
                const sceneDurationSec = framesToSeconds(scene.duration);
                const startPct =
                  totalDuration > 0 ? (sceneStarts[i] / totalDuration) * 100 : 0;
                const widthPct =
                  totalDuration > 0 ? (sceneDurationSec / totalDuration) * 100 : 0;
                const status = sceneStatuses[i];
                const isSelected = selectedScene === i;

                return (
                  <div key={scene.id} className="h-7 relative pointer-events-none">
                    <div
                      className="absolute top-1 bottom-1 rounded-sm overflow-hidden"
                      style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                    >
                      {status?.status === "complete" ? (
                        <div
                          className={cn(
                            "absolute inset-0 rounded-sm",
                            isSelected
                              ? "bg-blue-500 ring-1 ring-blue-300 ring-inset"
                              : "bg-blue-500/70",
                          )}
                        />
                      ) : status?.status === "generating" ? (
                        <div className="absolute inset-0 rounded-sm bg-blue-900/50">
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-blue-500/50 rounded-sm"
                            animate={{ width: `${status.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                          <motion.div
                            className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
                            animate={{ x: ["-3rem", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      ) : (
                        <div className="absolute inset-0 rounded-sm border border-dashed border-white/15 bg-white/[0.03]" />
                      )}
                    </div>
                  </div>
                );
              })}

              {scenes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-white/20">No scenes yet</span>
                </div>
              )}

              {/* Red Playhead — imperative position via ref */}
              {totalDuration > 0 && (
                <div
                  ref={playheadRef}
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={{ left: `${progress}%`, willChange: "left" }}
                >
                  {/* Vertical line */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-red-500" />
                  {/* SVG playhead handle (home-plate shape like Remotion Studio) */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-auto cursor-ew-resize">
                    <svg width="11" height="14" viewBox="0 0 11 14" className="drop-shadow-sm">
                      <path
                        d="M1 0h9a1 1 0 011 1v5.5a1 1 0 01-.4.8L6 11a1.5 1.5 0 01-1 0L.4 7.3A1 1 0 010 6.5V1a1 1 0 011-1z"
                        fill="#ef4444"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoOutput;
