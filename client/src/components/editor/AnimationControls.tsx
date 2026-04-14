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
    <div className="shrink-0 bg-[#0d0d0d] border-t border-white/10 select-none">
      {/* Controls bar */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/5">
        {/* Transport */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10"
            disabled={!hasVideo}
            onClick={() => { onSeek(0); }}
            title="Go to start"
          >
            <SkipBack className="h-3.5 w-3.5" fill="currentColor" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-40"
            disabled={!hasVideo}
            onClick={onTogglePlay}
          >
            {isPlaying
              ? <Pause className="h-3.5 w-3.5" fill="currentColor" />
              : <Play className="h-3.5 w-3.5" fill="currentColor" />
            }
          </Button>
        </div>

        {/* Time display */}
        <span className="text-[11px] font-mono text-white/50 tabular-nums ml-1">
          {formatTime(currentTime)}
          <span className="text-white/25"> / </span>
          {formatTime(duration)}
        </span>

        <div className="flex-1" />

        {/* Speed pills */}
        <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-md border border-white/10">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              className={cn(
                "text-[11px] px-2 py-0.5 rounded-sm transition-colors",
                speed === s
                  ? "bg-white text-black font-semibold"
                  : "text-white/40 hover:text-white hover:bg-white/10",
              )}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Export */}
        {videoUrl && (
          <>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <a href={videoUrl} download="animation.mp4" className="shrink-0">
              <Button
                size="sm"
                className="h-7 gap-1.5 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white border-0 rounded-md px-3"
              >
                <Download className="h-3 w-3" />
                Export
              </Button>
            </a>
          </>
        )}
      </div>

      {/* Timeline bar */}
      <div className="px-4 pt-3 pb-1">
        {/* Track */}
        <div
          ref={trackRef}
          className={cn(
            "relative h-10 w-full bg-white/5 rounded-md overflow-visible border border-white/10",
            hasVideo ? "cursor-ew-resize" : "cursor-default",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 bg-[#5326a6]/70 rounded-l-md transition-none"
            style={{ width: `${progress}%` }}
          />

          {/* Playhead */}
          {hasVideo && (
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none"
              style={{ left: `${progress}%` }}
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]" />
              {/* Home-plate cap */}
              <div className="absolute -top-[1px] left-1/2 -translate-x-1/2">
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
        {hasVideo && (
          <div className="relative h-5 mt-0.5 text-[10px] text-white/30 font-mono select-none">
            {ticks.map((t) => {
              const pct = (t / duration) * 100;
              return (
                <div
                  key={t}
                  className="absolute top-0 flex flex-col items-start"
                  style={{ left: `${pct}%` }}
                >
                  <span className="mt-0.5">{formatTime(t)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="flex justify-center pb-2.5 pt-0">
        <span className="text-[10px] text-white/20 font-sans">
          Double-click to mark a timestamp for AI edits · Drag to scrub
        </span>
      </div>
    </div>
  );
};

export default AnimationControls;
