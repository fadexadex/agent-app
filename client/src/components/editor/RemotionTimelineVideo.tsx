import { Player, PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, SkipBack, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AbsoluteFill, Video } from "remotion";

interface RemotionTimelineVideoProps {
  // Scene metadata
  sceneId: string;
  sceneName: string;
  durationInFrames: number;
  fps?: number;

  // Video source (from your render system)
  videoUrl?: string;
  previewUrl?: string;

  // Callbacks
  onCurrentTimeChange?: (time: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  onScrub?: (time: number) => void;

  // Timeline features
  selectedTimestamp?: number | null;
  onTimestampSelect?: (time: number | null) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
};

/**
 * VideoComposition - A simple Remotion composition that plays a video
 * This acts as a bridge between your rendered MP4s and Remotion Player
 */
const VideoComposition: React.FC<{
  videoUrl: string;
  durationInFrames: number;
}> = ({ videoUrl }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Video
        src={videoUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * RemotionTimelineVideo - Timeline powered by Remotion Player for rendered videos
 *
 * This component uses Remotion Player to provide a professional timeline UI
 * for your server-rendered video files. Benefits:
 *
 * - 🚀 GPU-accelerated timeline scrubbing (60fps smooth)
 * - 🎯 Frame-accurate seeking
 * - ⌨️ Keyboard shortcuts (space, arrows)
 * - 🎬 Professional video editing UX
 * - 💪 Zero custom performance optimization needed
 *
 * Unlike the custom timeline, Remotion Player handles all the performance
 * optimization internally, giving you pro-level UX with minimal code.
 */
const RemotionTimelineVideo = ({
  sceneId,
  sceneName,
  durationInFrames,
  fps = 30,
  videoUrl,
  previewUrl,
  onCurrentTimeChange,
  onPlayingChange,
  onScrub,
  selectedTimestamp,
  onTimestampSelect,
}: RemotionTimelineVideoProps) => {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isReady, setIsReady] = useState(false);

  const duration = durationInFrames / fps;
  const currentTime = currentFrame / fps;

  // Use the rendered video URL, fallback to preview
  const sourceUrl = videoUrl || previewUrl;

  // Sync states to parent
  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

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

  // Handle frame updates (includes scrubbing)
  const handleFrameUpdate = useCallback(
    (frame: number) => {
      setCurrentFrame(frame);
      const time = frame / fps;
      onScrub?.(time);
    },
    [fps, onScrub]
  );

  // Handle double-click to mark timestamp
  const handlePlayerDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!playerRef.current || !onTimestampSelect) return;

      // Calculate clicked time based on timeline position
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = clickX / rect.width;
      const clickedTime = pct * duration;

      onTimestampSelect(clickedTime);
    },
    [duration, onTimestampSelect]
  );

  const SPEEDS = [0.5, 1, 2] as const;

  if (!sourceUrl) {
    return (
      <div className="h-full flex flex-col bg-card border-t border-border items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Waiting for video render...</p>
      </div>
    );
  }

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

        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
          {sceneName}
        </span>

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

      {/* Remotion Player with video composition */}
      <div
        className="flex-1 bg-[#0d0f14] overflow-hidden"
        onDoubleClick={onTimestampSelect ? handlePlayerDoubleClick : undefined}
      >
        <Player
          ref={playerRef}
          component={VideoComposition}
          durationInFrames={durationInFrames}
          compositionWidth={1920}
          compositionHeight={1080}
          fps={fps}
          controls
          style={{
            width: "100%",
            height: "100%",
          }}
          inputProps={{
            videoUrl: sourceUrl,
            durationInFrames,
          }}
          playbackRate={speed}
          onPlay={() => {
            setIsPlaying(true);
            setIsReady(true);
          }}
          onPause={() => setIsPlaying(false)}
          onFrameUpdate={handleFrameUpdate}
          clickToPlay
          doubleClickToFullscreen
          showVolumeControls
          spaceKeyToPlayOrPause
          allowFullscreen
          moveToBeginningWhenEnded
        />
      </div>

      {/* Timestamp marker indicator */}
      {selectedTimestamp !== null && (
        <div className="shrink-0 px-3 py-1 border-t border-border/50 bg-emerald-500/5">
          <p className="text-[9px] text-emerald-400 text-center flex items-center justify-center gap-2">
            <span>Marked at {formatTime(selectedTimestamp)}</span>
            {onTimestampSelect && (
              <button
                onClick={() => onTimestampSelect(null)}
                className="text-emerald-400/60 hover:text-emerald-400 transition-colors"
              >
                × clear
              </button>
            )}
          </p>
        </div>
      )}

      {/* Info hint */}
      <div className="shrink-0 px-3 py-0.5 border-t border-border/50">
        <p className="text-[9px] text-muted-foreground text-center">
          Powered by Remotion Player • Space: play/pause • Arrows: step frames
          {onTimestampSelect && " • Double-click: mark timestamp"}
        </p>
      </div>
    </div>
  );
};

export default RemotionTimelineVideo;
