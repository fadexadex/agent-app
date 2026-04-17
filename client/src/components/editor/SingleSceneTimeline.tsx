import { useRef, useState, useCallback, useId, useMemo, useEffect } from "react";
import { Play, Pause, SkipBack, RotateCcw, Music, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scene, framesToSeconds } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import AudioWaveform from "./AudioWaveform";

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
  audioUrl?: string | null;
  audioTrackName?: string | null;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
};

const SPEEDS = [0.5, 1, 2] as const;
const SCALE_SPLIT_COUNT = 4;

const SingleSceneTimeline = ({
  scene,
  currentTime,
  onSeek,
  onScrub,
  selectedTimestamp,
  onTimestampSelect,
  isPlaying,
  onTogglePlay,
  speed = 1,
  onSpeedChange,
  audioUrl,
  audioTrackName,
  videoRef,
}: SingleSceneTimelineProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [zoom, setZoom] = useState(1);
  const uid = useId();

  const duration = framesToSeconds(scene.duration);

  useEffect(() => {
    if (!videoRef?.current) return;
    let rafId: number;
    const loop = () => {
      if (videoRef!.current && playheadRef.current && duration > 0 && !isDraggingRef.current) {
        const pct = (videoRef!.current.currentTime / duration) * 100;
        playheadRef.current.style.left = `${pct}%`;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [videoRef, duration]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const markerPosition =
    selectedTimestamp !== null && duration > 0
      ? (selectedTimestamp / duration) * 100
      : null;

  const majorInterval = zoom >= 4 ? 0.5 : zoom >= 2 ? 1 : 2;
  const minorInterval = majorInterval / SCALE_SPLIT_COUNT;

  const ticks = useMemo(() => {
    const result: { time: number; major: boolean }[] = [];
    if (duration <= 0) return result;
    for (let t = 0; t <= duration + minorInterval / 2; t += minorInterval) {
      const rounded = Math.round(t * 1000) / 1000;
      const isMajor =
        Math.round((rounded % majorInterval) * 1000) < Math.round(minorInterval * 1000 * 0.5);
      result.push({ time: rounded, major: isMajor });
    }
    return result;
  }, [duration, majorInterval, minorInterval]);

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

  const autoScrollRaf = useRef<number | null>(null);
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
    stopAutoScroll();
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

  const handleZoomReset = () => {
    setZoom(1);
    scrollContainerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  return (
    <div className="h-full flex flex-col bg-card border-t border-border select-none">

      {/* Controls bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground bg-muted/50 hover:bg-muted"
            onClick={() => { onSeek(0); onScrub?.(0); }}
            title="Go to start"
          >
            <SkipBack className="h-4 w-4" fill="currentColor" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 bg-black text-white hover:bg-black/90 rounded-md dark:bg-white dark:text-black dark:hover:bg-white/90"
            onClick={onTogglePlay}
          >
            {isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground bg-muted/50 hover:bg-muted"
            onClick={() => { onSeek(0); onScrub?.(0); }}
            title="Replay"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm font-mono ml-2">
          <span className="text-muted-foreground tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <span className="text-foreground font-sans text-sm font-medium">
            {scene.name}
          </span>
        </div>

        <div className="flex-1" />

        {/* Speed pills */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-md border border-border/50">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange?.(s)}
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

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-md border border-border/50">
          <button
            onClick={handleZoomReset}
            className={cn(
              "text-xs px-2.5 py-1 rounded-sm transition-colors font-medium",
              zoom === 1
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
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

      {/* Timeline body */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a] min-h-0 relative px-4 py-6">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-ew-resize [&::-webkit-scrollbar]:hidden"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          <div
            style={{ width: `${zoom * 100}%`, minWidth: "100%" }}
            className="flex flex-col h-full relative"
          >
            {/* Top time labels */}
            <div className="flex justify-between items-end mb-2 text-[10px] text-white/50 font-mono select-none px-2 shrink-0">
              <span>0:00.0</span>
              <span>{formatTime(duration)}.0</span>
            </div>

            {/* Track block */}
            <div className="relative h-14 bg-black/50 border border-white/10 rounded-sm w-full flex overflow-hidden shrink-0">
              <div className="h-full w-full bg-[#5326a6] flex items-center px-3 relative overflow-hidden">
                <span className="text-[11px] text-white/90 font-medium truncate pointer-events-none select-none z-10">
                  {scene.name}
                </span>
                {markerPosition !== null && (
                  <div
                    className="absolute top-0 bottom-0 z-10 pointer-events-none"
                    style={{ left: `${markerPosition}%` }}
                  >
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-emerald-400 rounded-sm rotate-45" />
                    <div className="absolute top-3.5 bottom-0 left-1/2 -translate-x-1/2 w-px bg-emerald-400/70" />
                  </div>
                )}
              </div>

              {/* Playhead */}
              {duration > 0 && (
                <div
                  ref={playheadRef}
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={{ left: `${progress}%`, willChange: "left" }}
                >
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
                  <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto cursor-ew-resize -top-2">
                    <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Audio track */}
            {audioUrl && (
              <div className="relative h-10 mt-1 bg-black/50 border border-white/10 rounded-sm overflow-hidden shrink-0">
                <div className="flex items-center gap-1.5 absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <span className="flex items-center justify-center h-4 w-4 rounded-sm bg-emerald-500 text-white">
                    <Music className="h-2.5 w-2.5" />
                  </span>
                  <span className="text-[9px] text-white/50 truncate">
                    {audioTrackName || "Audio"}
                  </span>
                </div>
                <AudioWaveform
                  audioUrl={audioUrl}
                  width={scrollContainerRef.current?.scrollWidth || 800}
                  height={40}
                  currentTime={currentTime}
                  duration={duration}
                  color="#10B981"
                  backgroundColor="rgba(16, 185, 129, 0.15)"
                  clipPathId={`progress-${uid}`}
                />
              </div>
            )}

            {/* Bottom ruler */}
            <div className="relative h-6 mt-1 text-[10px] text-white/40 font-mono select-none shrink-0">
              {ticks.map(({ time, major }) =>
                major ? (
                  <div
                    key={time}
                    className="absolute top-0 flex flex-col"
                    style={{ left: `${(time / (duration || 1)) * 100}%` }}
                  >
                    <div className="w-px h-1.5 bg-white/20" />
                    <span className="mt-0.5 pl-1 whitespace-nowrap">{formatTime(time)}</span>
                  </div>
                ) : (
                  <div
                    key={time}
                    className="absolute top-0"
                    style={{ left: `${(time / (duration || 1)) * 100}%` }}
                  >
                    <div className="w-px h-1 bg-white/10" />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-auto flex justify-center pb-2 shrink-0">
          <span className="text-[11px] text-white/30 font-sans">
            Double-click timeline to mark a timestamp for refinement · Press Space to play/pause
            {selectedTimestamp !== null && (
              <button
                onClick={() => onTimestampSelect(null)}
                className="ml-2 text-emerald-400/70 hover:text-emerald-400 transition-colors"
              >
                × clear mark
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SingleSceneTimeline;
