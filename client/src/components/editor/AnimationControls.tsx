import { useRef, useCallback, useMemo } from "react";
import { Play, Pause, SkipBack, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimationControlsProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onScrub: (time: number) => void;
  selectedTimestamp: number | null;
  onTimestampSelect: (time: number | null) => void;
  videoUrl?: string | null;
  speed?: 0.5 | 1 | 2;
  onSpeedChange?: (speed: 0.5 | 1 | 2) => void;
}

const SPEEDS = [0.5, 1, 2] as const;
type Speed = (typeof SPEEDS)[number];

const formatTime = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${m}:${sec.toString().padStart(2, "0")}.${ms}`;
};

// Compute evenly-spaced major tick interval based on duration
const getMajorInterval = (duration: number): number => {
  if (duration <= 10) return 1;
  if (duration <= 30) return 2;
  if (duration <= 60) return 5;
  return 10;
};

const AnimationControls = ({
  duration,
  currentTime,
  isPlaying,
  onTogglePlay,
  onSeek,
  onScrub,
  selectedTimestamp,
  onTimestampSelect,
  videoUrl,
  speed = 1,
  onSpeedChange,
}: AnimationControlsProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const hasVideo = duration > 0;
  const progress = hasVideo ? Math.min(1, currentTime / duration) * 100 : 0;

  const majorInterval = useMemo(() => getMajorInterval(duration), [duration]);
  const ticks = useMemo(() => {
    if (!hasVideo) return [];
    const result: number[] = [];
    for (let t = 0; t <= duration; t += majorInterval) {
      result.push(Math.round(t * 100) / 100);
    }
    return result;
  }, [duration, majorInterval, hasVideo]);

  const computeTimeFromPointer = useCallback(
    (e: React.PointerEvent | React.MouseEvent): number => {
      const track = trackRef.current;
      if (!track || !hasVideo) return 0;
      const rect = track.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      return pct * duration;
    },
    [duration, hasVideo],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasVideo || e.button !== 0) return;
    isDraggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const t = computeTimeFromPointer(e);
    onScrub(t);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const t = computeTimeFromPointer(e);
    onScrub(t);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const t = computeTimeFromPointer(e);
    onSeek(t);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasVideo) return;
    const t = computeTimeFromPointer(e);
    onTimestampSelect(t);
  };

  const handleSpeedChange = (s: Speed) => {
    onSpeedChange?.(s);
  };

  const stampPct = selectedTimestamp !== null && hasVideo
    ? Math.min(1, selectedTimestamp / duration) * 100
    : null;

  return (
    <div className="h-full flex flex-col bg-card border-t border-border select-none overflow-hidden">
      {/* Controls bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        {/* Transport */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground bg-muted/50 hover:bg-muted"
            disabled={!hasVideo}
            onClick={() => { onSeek(0); }}
            title="Go to start"
          >
            <SkipBack className="h-4 w-4" fill="currentColor" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 bg-black text-white hover:bg-black/90 rounded-md dark:bg-white dark:text-black dark:hover:bg-white/90"
            disabled={!hasVideo}
            onClick={onTogglePlay}
          >
            {isPlaying
              ? <Pause className="h-4 w-4" fill="currentColor" />
              : <Play className="h-4 w-4" fill="currentColor" />
            }
          </Button>
        </div>

        {/* Time display */}
        <span className="text-sm font-mono text-muted-foreground tabular-nums ml-1">
          {formatTime(currentTime)}
          <span className="text-muted-foreground/50"> / </span>
          {formatTime(duration)}
        </span>

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

        {/* Export */}
        {videoUrl && (
          <>
            <div className="w-px h-4 bg-border mx-1" />
            <a href={videoUrl} download="animation.mp4" className="shrink-0">
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs bg-accent hover:bg-accent/90 text-accent-foreground rounded-md"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </a>
          </>
        )}
      </div>

      {/* Timeline area */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a] min-h-0 px-4 py-4">
        {/* Top time labels */}
        <div className="flex justify-between items-end mb-2 text-[10px] text-white/40 font-mono select-none shrink-0">
          <span>{formatTime(0)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Track */}
        <div
          ref={trackRef}
          className={cn(
            "relative h-12 w-full bg-black/50 border border-white/10 rounded-sm overflow-visible shrink-0",
            hasVideo ? "cursor-ew-resize" : "cursor-default",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 bg-[#5326a6]/80 transition-none"
            style={{ width: `${progress}%` }}
          />

          {/* Playhead */}
          {hasVideo && (
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none"
              style={{ left: `${progress}%` }}
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
              <div className="absolute left-1/2 -translate-x-1/2 -top-2">
                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-500" />
              </div>
            </div>
          )}

          {/* Selected timestamp marker (emerald diamond) */}
          {stampPct !== null && (
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none"
              style={{ left: `${stampPct}%` }}
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-emerald-500/80" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
            </div>
          )}
        </div>

        {/* Timestamp ruler */}
        <div className="relative h-5 mt-1 shrink-0">
          {hasVideo && ticks.map((t) => {
            const pct = (t / duration) * 100;
            return (
              <div
                key={t}
                className="absolute top-0 flex flex-col items-start"
                style={{ left: `${pct}%` }}
              >
                <span className="text-[10px] text-white/40 font-mono mt-0.5 pl-1">
                  {formatTime(t)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hint */}
        <div className="mt-auto flex justify-center pt-2 shrink-0">
          <span className="text-[11px] text-white/25 font-sans">
            Double-click to mark a timestamp for AI edits · Drag to scrub
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnimationControls;
