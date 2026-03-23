import { useRef, useState } from "react";
import {
  Play,
  Pause,
  Clock,
  ExternalLink,
  MonitorPlay,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scene } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface SingleSceneTimelineProps {
  scene: Scene;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedTimestamp: number | null;
  onTimestampSelect: (time: number | null) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  previewUrl?: string | null;
  videoUrl?: string | null;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
};

const SingleSceneTimeline = ({
  scene,
  currentTime,
  onSeek,
  selectedTimestamp,
  onTimestampSelect,
  isPlaying,
  onTogglePlay,
  previewUrl,
  videoUrl,
}: SingleSceneTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress =
    scene.duration > 0 ? (currentTime / scene.duration) * 100 : 0;
  const markerPosition =
    selectedTimestamp !== null
      ? (selectedTimestamp / scene.duration) * 100
      : null;

  // Generate frame markers (every 0.5 seconds)
  const frameMarkers: number[] = [];
  for (let t = 0; t <= scene.duration; t += 0.5) {
    frameMarkers.push(t);
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * scene.duration;
    onSeek(newTime);
  };

  const handleTimelineDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const timestamp = percentage * scene.duration;
    onTimestampSelect(timestamp);
  };

  const handleSeekerDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * scene.duration);
  };

  return (
    <div
      className="h-full flex flex-col bg-card"
      onMouseMove={handleSeekerDrag}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* ── Scene preview card ── */}
      <div className="flex-1 relative overflow-hidden rounded-lg m-3 mb-2 bg-black">
        {videoUrl ? (
          /* ── Rendered MP4 available: show real video ── */
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-contain"
              autoPlay
              loop
              muted
              playsInline
            />

            {/* Controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                    } else {
                      videoRef.current.pause();
                    }
                  }
                  onTogglePlay();
                }}
                className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                )}
              </Button>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                  }
                }}
                className="flex items-center gap-1 text-[10px] text-white/70 hover:text-white transition-colors"
                title="Replay from start"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </>
        ) : (
          /* ── No video yet: gradient visualization ── */
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              scene.gradient || "from-primary/20 to-primary/5",
            )}
          >
            {/* Scene info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-card/60 backdrop-blur mb-2">
                <MonitorPlay className="h-4 w-4 text-foreground/70" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-0.5">
                {scene.type}
              </p>
              <h3
                className="text-sm font-bold text-foreground leading-snug"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {scene.title}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {scene.duration}s
              </p>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
              <Button
                variant="ghost"
                size="icon"
                onClick={onTogglePlay}
                className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                )}
              </Button>

              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-white/80 hover:text-white transition-colors"
                  title="Open in Remotion Studio"
                >
                  <span>Open in Studio</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Timestamp marker indicator (shown regardless of video state) */}
        {selectedTimestamp !== null && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
            <Clock className="h-3 w-3" />
            {formatTime(selectedTimestamp)}
            <button
              onClick={() => onTimestampSelect(null)}
              className="ml-0.5 hover:bg-primary-foreground/20 rounded-full w-3.5 h-3.5 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* ── Timeline scrubber ── */}
      <div className="px-3 pb-3">
        <div
          ref={timelineRef}
          className="relative h-10 bg-muted rounded-lg cursor-pointer overflow-hidden"
          onClick={handleTimelineClick}
          onDoubleClick={handleTimelineDoubleClick}
        >
          {/* Frame markers */}
          <div className="absolute inset-0 flex items-end">
            {frameMarkers.map((t) => (
              <div
                key={t}
                className={cn(
                  "absolute bottom-0 w-px bg-border",
                  t % 1 === 0 ? "h-3" : "h-1.5",
                )}
                style={{ left: `${(t / scene.duration) * 100}%` }}
              />
            ))}
          </div>

          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 bg-primary/20"
            style={{ width: `${progress}%` }}
          />

          {/* Refinement timestamp marker */}
          {markerPosition !== null && (
            <div
              className="absolute top-0 bottom-0 z-10"
              style={{ left: `${markerPosition}%` }}
            >
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-sm rotate-45" />
              <div className="absolute top-3 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-accent" />
            </div>
          )}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 z-20"
            style={{ left: `${progress}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDragging(true);
            }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform" />
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-primary pointer-events-none" />
          </div>

          {/* Time label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-mono text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(scene.duration)}
            </span>
          </div>
        </div>

        {/* Hint */}
        <p className="text-[9px] text-muted-foreground text-center mt-1.5">
          Double-click to mark a timestamp for refinement
        </p>
      </div>
    </div>
  );
};

export default SingleSceneTimeline;
