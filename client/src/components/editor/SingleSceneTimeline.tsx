import { useRef, useState, useCallback, useId, useMemo, useEffect } from "react";
import { Play, Pause, SkipBack, RotateCcw, Music, Film } from "lucide-react";
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
  /** Native video element ref — enables zero-rerender real-time playhead tracking */
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
};

const SPEEDS = [0.5, 1, 2] as const;
type Speed = (typeof SPEEDS)[number];

// ─── Track definitions ────────────────────────────────────────────────────────
// Inspired by @xzdarcy/react-timeline-editor's `TimelineRow` + `effects` model:
// each "track" has a label, color, and an icon to distinguish clip types visually.
const TRACK_HEIGHT = 32; // px — consistent with xzdarcy's default row height
const RULER_HEIGHT = 20; // px

// How many sub-ticks to show between major ticks (scaleSplitCount from xzdarcy docs)
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
  previewUrl,
  videoUrl,
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
  const uid = useId(); // unique per-instance — fixes the duplicate clipPath id bug

  const duration = framesToSeconds(scene.duration);

  // ── Real-time playhead via RAF (zero React re-renders during playback) ────────
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

  // ── Track rows ──────────────────────────────────────────────────────────────
  // We model tracks like xzdarcy's TimelineRow concept — video track always
  // present, audio track conditionally added.
  const tracks = useMemo(() => {
    const base = [
      {
        id: "video",
        label: scene.name,
        icon: <Film className="h-2.5 w-2.5" />,
        color: "bg-blue-500",
        activeColor: "bg-blue-400 ring-1 ring-blue-300 ring-inset",
        dimColor: "bg-blue-500/70",
        borderColor: "border-blue-400/40",
      },
    ] as const;
    return base;
  }, [scene.name]);

  // ── Ruler ticks (respects scaleSplitCount) ──────────────────────────────────
  // Inspired by xzdarcy's `scale`, `scaleWidth`, `scaleSplitCount` props.
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

  // ── Time ↔ pointer conversion ───────────────────────────────────────────────
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

  // ── Auto-scroll at viewport edges while dragging (xzdarcy's autoScroll) ─────
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

  // ── Pointer events ──────────────────────────────────────────────────────────
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

    // Auto-scroll near edges (xzdarcy autoScroll behavior)
    const container = scrollContainerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const edge = 40; // px — snap zone near edge
      if (e.clientX < rect.left + edge) {
        startAutoScroll("left");
      } else if (e.clientX > rect.right - edge) {
        startAutoScroll("right");
      } else {
        stopAutoScroll();
      }
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

  const LABEL_COL_WIDTH = 96; // px — synced left-label column width

  return (
    <div className="h-full flex flex-col bg-card border-t border-border select-none">

      {/* ── Controls bar ────────────────────────────────────────────────────── */}
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

        {/* Zoom controls */}
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
            {zoom === 1 ? "Fit" : `${zoom}×`}
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(8, parseFloat((z + 0.5).toFixed(1))))}
            className="text-[10px] w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* ── Timeline body ────────────────────────────────────────────────────── */}
      <div className="flex-1 bg-[#0d0f14] overflow-hidden flex min-h-0">

        {/* Left: track label column — always visible, not scrolled */}
        <div
          className="shrink-0 border-r border-white/10 flex flex-col z-10"
          style={{ width: LABEL_COL_WIDTH }}
        >
          {/* Ruler spacer */}
          <div style={{ height: RULER_HEIGHT }} className="shrink-0 border-b border-white/10" />

          {/* Video track label */}
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-1.5 px-2 border-b border-white/10 text-white/50 shrink-0"
              style={{ height: TRACK_HEIGHT }}
            >
              <span className="text-[9px] truncate leading-none">{track.label}</span>
            </div>
          ))}

          {/* Audio track label */}
          {audioUrl && (
            <div
              className="flex items-center gap-1.5 px-2 border-b border-white/10 text-white/50 shrink-0"
              style={{ height: TRACK_HEIGHT }}
            >
              <span className="flex items-center justify-center h-4 w-4 rounded-sm bg-emerald-500 text-white">
                <Music className="h-2.5 w-2.5" />
              </span>
              <span className="text-[9px] truncate leading-none">
                {audioTrackName || "Audio"}
              </span>
            </div>
          )}
        </div>

        {/* Right: scrollable ruler + tracks + playhead */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-ew-resize"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          <div
            style={{ width: `${zoom * 100}%`, minWidth: "100%", position: "relative" }}
            className="h-full flex flex-col"
          >

            {/* ── Time ruler with major + minor ticks (scaleSplitCount) ── */}
            <div
              className="shrink-0 border-b border-white/10 relative bg-[#0d0f14] z-10"
              style={{ height: RULER_HEIGHT }}
            >
              {ticks.map(({ time, major }) => (
                <div
                  key={time}
                  className="absolute top-0 flex flex-col items-center pointer-events-none"
                  style={{ left: `${(time / (duration || 1)) * 100}%`, transform: "translateX(-50%)" }}
                >
                  <div
                    className={cn(
                      "w-px",
                      major ? "h-3 bg-white/30" : "h-1.5 bg-white/12",
                    )}
                  />
                  {major && (
                    <span className="text-[8px] font-mono text-white/35 mt-0.5 whitespace-nowrap">
                      {formatTime(time)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* ── Video track row ── */}
            {tracks.map((track) => (
              <div
                key={track.id}
                className="shrink-0 relative border-b border-white/[0.06]"
                style={{ height: TRACK_HEIGHT }}
              >
                {/* Scene clip block */}
                <div className="absolute top-1 bottom-1 left-0 right-0 rounded-sm overflow-hidden pointer-events-none">
                  <div className={cn("absolute inset-0 rounded-sm", track.activeColor)} />
                  {/* Clip label inside the block */}
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-medium text-white/80 truncate pointer-events-none select-none">
                    {scene.name}
                  </span>
                </div>

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
              </div>
            ))}

            {/* ── Audio track row ── */}
            {audioUrl && (
              <div
                className="shrink-0 relative border-b border-white/[0.06]"
                style={{ height: TRACK_HEIGHT }}
              >
                <div className="absolute inset-x-0 top-1 bottom-1 overflow-hidden rounded-sm bg-emerald-900/20">
                  <AudioWaveform
                    audioUrl={audioUrl}
                    width={scrollContainerRef.current?.scrollWidth || 800}
                    height={TRACK_HEIGHT - 8}
                    currentTime={currentTime}
                    duration={duration}
                    color="#10B981"
                    backgroundColor="rgba(16, 185, 129, 0.15)"
                    clipPathId={`progress-${uid}`}
                  />
                </div>
              </div>
            )}

            {/* ── Playhead ── */}
            {duration > 0 && (
              <div
                ref={playheadRef}
                className="absolute inset-y-0 z-20 pointer-events-none"
                style={{ left: `${progress}%`, willChange: "left" }}
              >
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-red-500" />
                {/* Home-plate playhead handle — identical to Remotion Studio */}
                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto cursor-ew-resize"
                  style={{ top: -RULER_HEIGHT }}
                >
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

      {/* ── Hint bar ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-3 py-1 border-t border-white/5">
        <p className="text-[9px] text-white/40 text-center">
          Double-click timeline to mark a timestamp for refinement · Press Space to play/pause
          {selectedTimestamp !== null && (
            <button
              onClick={() => onTimestampSelect(null)}
              className="ml-2 text-emerald-400/70 hover:text-emerald-400 transition-colors"
            >
              × clear mark
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default SingleSceneTimeline;
