import { useRef, useState, useCallback } from "react";
import { Play, Pause, SkipBack, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scene, framesToSeconds } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface SingleSceneTimelineProps {
  scene: Scene;
  currentTime: number;
  onSeek: (time: number) => void;
  onScrub?: (time: number) => void;
  selectedTimestamp: number | null;
  onTimestampSelect: (time: number | null) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  previewUrl?: string | null;
  videoUrl?: string | null;
  speed?: 0.5 | 1 | 2;
  onSpeedChange?: (speed: 0.5 | 1 | 2) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
};

const SPEEDS = [0.5, 1, 2] as const;
type Speed = (typeof SPEEDS)[number];

const SingleSceneTimeline = ({
  scene,
  currentTime,
  onSeek,
  onScrub,
  selectedTimestamp,
  onTimestampSelect,
  isPlaying,
  onTogglePlay,
  previewUrl,
  videoUrl,
  speed = 1,
  onSpeedChange,
}: SingleSceneTimelineProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [zoom, setZoom] = useState(1);

  const duration = framesToSeconds(scene.duration);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const markerPosition =
    selectedTimestamp !== null && duration > 0
      ? (selectedTimestamp / duration) * 100
      : null;

  const handleZoomReset = () => {
    setZoom(1);
    scrollContainerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const computeTimeFromPointer = useCallback(
    (e: React.PointerEvent): number => {
      const container = scrollContainerRef.current;
      if (!container || duration <= 0) return 0;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left + container.scrollLeft;
      const pct = Math.max(0, Math.min(1, x / container.scrollWidth));
      return pct * duration;
    },
    [duration],
  );

  const movePlayheadImperative = useCallback(
    (time: number) => {
      if (playheadRef.current && duration > 0) {
        const pct = (time / duration) * 100;
        playheadRef.current.style.left = `${pct}%`;
      }
    },
    [duration],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const time = computeTimeFromPointer(e);
    movePlayheadImperative(time);
    onScrub?.(time);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const time = computeTimeFromPointer(e);
    movePlayheadImperative(time);
    onScrub?.(time);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const time = computeTimeFromPointer(e);
    onSeek(time);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current || duration <= 0) return;
    const rect = scrollContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollContainerRef.current.scrollLeft;
    const pct = Math.max(0, Math.min(1, x / scrollContainerRef.current.scrollWidth));
    onTimestampSelect(pct * duration);
  };

  // Generate ruler ticks
  const majorInterval = zoom >= 4 ? 0.5 : zoom >= 2 ? 1 : 2;
  const minorInterval = zoom >= 4 ? 0.25 : 0.5;
  const ticks: { time: number; major: boolean }[] = [];
  if (duration > 0) {
    for (let t = 0; t <= duration + 0.001; t += minorInterval) {
      const rounded = Math.round(t * 100) / 100;
      ticks.push({
        time: rounded,
        major: Math.round((rounded % majorInterval) * 100) === 0,
      });
    }
  }

  return (
    <div className="h-full flex flex-col bg-card border-t border-border select-none">
      {/* ── Controls bar ── */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-border shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => { onSeek(0); onScrub?.(0); }}
          title="Go to start"
        >
          <SkipBack className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={onTogglePlay}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => { onSeek(0); onScrub?.(0); }}
          title="Replay"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>

        <span className="text-[10px] font-mono text-muted-foreground tabular-nums w-28">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
          {scene.name}
        </span>

        <div className="flex-1" />

        {/* Speed pills */}
        <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange?.(s)}
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

      {/* ── Timeline area ── */}
      <div className="flex-1 bg-[#0d0f14] overflow-hidden flex flex-col min-h-0">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-ew-resize"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          <div
            style={{ width: `${zoom * 100}%`, minWidth: "100%" }}
            className="flex flex-col"
          >
            {/* Time ruler */}
            <div className="h-5 shrink-0 border-b border-white/10 relative overflow-hidden">
              {ticks.map(({ time, major }) => (
                <div
                  key={time}
                  className="absolute top-0 flex flex-col pointer-events-none"
                  style={{ left: `${(time / (duration || 1)) * 100}%` }}
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

            {/* Track row — fixed height, not flex-1, so it doesn't bloat */}
            <div className="h-8 shrink-0 relative">
              {/* Blue scene track */}
              <div className="absolute top-1 bottom-1 left-0 right-0 rounded-sm bg-blue-500/75 pointer-events-none" />

              {/* Refinement marker */}
              {markerPosition !== null && (
                <div
                  className="absolute top-0 bottom-0 z-10 pointer-events-none"
                  style={{ left: `${markerPosition}%` }}
                >
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-sm rotate-45" />
                  <div className="absolute top-3.5 bottom-0 left-1/2 -translate-x-1/2 w-px bg-emerald-400/70" />
                </div>
              )}

              {/* Red Playhead — imperative position via ref */}
              {duration > 0 && (
                <div
                  ref={playheadRef}
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={{ left: `${progress}%`, willChange: "left" }}
                >
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

        {/* Hint */}
        <div className="shrink-0 px-3 py-0.5 border-t border-white/5">
          <p className="text-[9px] text-white/25 text-center">
            Double-click to mark a timestamp for refinement
            {selectedTimestamp !== null && (
              <button
                onClick={() => onTimestampSelect(null)}
                className="ml-2 text-emerald-400/60 hover:text-emerald-400 transition-colors"
              >
                × clear mark
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SingleSceneTimeline;
