import { useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
  isPlaying: boolean;
  currentFrame: number;
  durationFrames: number;
  fps: number;
  sceneTitle?: string;
  sceneIndex?: number;
  sceneCount?: number;
  onTogglePlay: () => void;
  onSeek: (frame: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onFullscreen?: () => void;
  className?: string;
}

function formatTime(frames: number, fps: number): string {
  const totalSeconds = frames / fps;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const PlayerControls = ({
  isPlaying,
  currentFrame,
  durationFrames,
  fps,
  sceneTitle,
  sceneIndex,
  sceneCount,
  onTogglePlay,
  onSeek,
  onPrev,
  onNext,
  onFullscreen,
  className,
}: PlayerControlsProps) => {
  const progress = durationFrames > 0 ? currentFrame / durationFrames : 0;

  const handleScrubberClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(Math.round(ratio * durationFrames));
    },
    [durationFrames, onSeek],
  );

  const handleScrubberMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(Math.round(ratio * durationFrames));
    },
    [durationFrames, onSeek],
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 px-3 py-2 bg-black/80 backdrop-blur-sm",
        className,
      )}
    >
      {/* Scrubber */}
      <div
        className="relative h-1 rounded-full bg-white/20 cursor-pointer group"
        onClick={handleScrubberClick}
        onMouseMove={handleScrubberMouseMove}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-none"
          style={{ width: `${progress * 100}%` }}
        />
        {/* Playhead thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Prev scene */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="text-white/60 hover:text-white transition-colors p-0.5 disabled:opacity-30"
            disabled={sceneIndex === 0}
            title="Previous scene"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Play / Pause */}
        <button
          onClick={onTogglePlay}
          className="text-white hover:text-primary transition-colors p-0.5"
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </button>

        {/* Next scene */}
        {onNext && (
          <button
            onClick={onNext}
            className="text-white/60 hover:text-white transition-colors p-0.5 disabled:opacity-30"
            disabled={sceneCount != null && sceneIndex != null && sceneIndex >= sceneCount - 1}
            title="Next scene"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Time display */}
        <span className="text-[10px] font-mono text-white/70 ml-1 tabular-nums">
          {formatTime(currentFrame, fps)} / {formatTime(durationFrames, fps)}
        </span>

        {/* Scene label */}
        {sceneTitle && (
          <span className="text-[10px] text-white/50 truncate ml-1 flex-1">
            {sceneCount != null && sceneIndex != null
              ? `${sceneIndex + 1}/${sceneCount} · `
              : ""}
            {sceneTitle}
          </span>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Fullscreen */}
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="text-white/60 hover:text-white transition-colors p-0.5"
              title="Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
