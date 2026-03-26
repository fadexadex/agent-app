import { Player, PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, SkipBack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RemotionTimelineProps {
  // Remotion composition props
  compositionId: string;
  durationInFrames: number;
  fps?: number;

  // Preview/video URLs
  previewUrl?: string;
  videoUrl?: string;

  // Callbacks
  onCurrentTimeChange?: (time: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;

  // Scene metadata for display
  sceneName?: string;

  // Input props from remotion composition
  inputProps?: Record<string, any>;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
};

/**
 * RemotionTimeline - A timeline component powered by Remotion Player
 *
 * This replaces the custom SingleSceneTimeline with Remotion's built-in
 * player and timeline, giving us:
 * - Smooth 60fps timeline scrubbing (GPU-accelerated)
 * - Frame-accurate seeking
 * - Built-in playback controls
 * - Hover preview (with thumbnails if configured)
 * - Keyboard shortcuts (space, arrows)
 * - Zero custom performance optimization needed
 */
const RemotionTimeline = ({
  compositionId,
  durationInFrames,
  fps = 30,
  previewUrl,
  videoUrl,
  onCurrentTimeChange,
  onPlayingChange,
  sceneName,
  inputProps = {},
}: RemotionTimelineProps) => {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [speed, setSpeed] = useState(1);

  const duration = durationInFrames / fps;
  const currentTime = currentFrame / fps;

  // Sync playing state to parent
  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  // Sync current time to parent
  useEffect(() => {
    onCurrentTimeChange?.(currentTime);
  }, [currentTime, onCurrentTimeChange]);

  const handleTogglePlay = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  }, [isPlaying]);

  const handleReset = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      playerRef.current.pause();
    }
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(newSpeed);
    }
  }, []);

  // Note: We need to lazy-load the composition since it's dynamically generated
  // This is a simplified version - in production, you'd use Remotion's lazy loading
  const compositionComponent = useCallback(() => {
    // Placeholder - this will be replaced with actual scene component
    return (
      <div
        style={{
          backgroundColor: "#1a1a1a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Scene: {sceneName || compositionId}</h2>
          <p>Frame {currentFrame} / {durationInFrames}</p>
          {videoUrl && <p style={{ fontSize: 12, marginTop: 8 }}>Rendered video available</p>}
        </div>
      </div>
    );
  }, [compositionId, sceneName, currentFrame, durationInFrames, videoUrl]);

  const SPEEDS = [0.5, 1, 2] as const;

  return (
    <div className="h-full flex flex-col bg-card border-t border-border">
      {/* Controls bar */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-border shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={handleReset}
          title="Go to start"
        >
          <SkipBack className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={handleTogglePlay}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>

        <span className="text-[10px] font-mono text-muted-foreground tabular-nums w-28">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {sceneName && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
            {sceneName}
          </span>
        )}

        <div className="flex-1" />

        {/* Speed controls */}
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
      </div>

      {/* Remotion Player - This gives us the timeline automatically */}
      <div className="flex-1 bg-[#0d0f14] overflow-hidden">
        <Player
          ref={playerRef}
          component={compositionComponent as any}
          durationInFrames={durationInFrames}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={fps}
          controls
          style={{
            width: "100%",
            height: "100%",
          }}
          inputProps={inputProps}
          playbackRate={speed}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onFrameUpdate={(frame) => setCurrentFrame(frame)}
          clickToPlay
          doubleClickToFullscreen
          showVolumeControls
          spaceKeyToPlayOrPause
        />
      </div>

      {/* Info hint */}
      <div className="shrink-0 px-3 py-0.5 border-t border-border/50">
        <p className="text-[9px] text-muted-foreground text-center">
          Powered by Remotion Player • Space to play/pause • Arrow keys to step frames
        </p>
      </div>
    </div>
  );
};

export default RemotionTimeline;
