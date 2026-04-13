import { useState, useEffect, useRef } from "react";
import { Play, Pause, Music, Volume2, Upload, Loader2, Globe, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  name: string;
  file: string;
  duration: number;
  mood: string;
  bpm: number;
}

interface AudioTrackSelectorProps {
  selectedTrackId: string | null;
  volume: number;
  onSelectTrack: (trackId: string | null) => void;
  onVolumeChange: (volume: number) => void;
  /** When true, audio applies to all scenes; false = current scene only */
  applyToAllScenes?: boolean;
  onToggleScope?: (allScenes: boolean) => void;
}

const moodColors: Record<string, string> = {
  energetic: "bg-orange-500/20 text-orange-400",
  calm: "bg-blue-500/20 text-blue-400",
  emotional: "bg-purple-500/20 text-purple-400",
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AudioTrackSelector = ({
  selectedTrackId,
  volume,
  onSelectTrack,
  onVolumeChange,
  applyToAllScenes = true,
  onToggleScope,
}: AudioTrackSelectorProps) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/audio/tracks.json");
        const data = await response.json();
        setTracks(data.tracks);
      } catch {
        // Tracks may not exist yet
      } finally {
        setIsLoading(false);
      }
    };
    fetchTracks();
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const handlePreviewToggle = (track: Track) => {
    if (previewingTrackId === track.id) {
      audioRef.current?.pause();
      setPreviewingTrackId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(`/audio/${track.file}`);
      audioRef.current.volume = volume;
      audioRef.current.play();
      audioRef.current.onended = () => setPreviewingTrackId(null);
      setPreviewingTrackId(track.id);
    }
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Drag-and-drop audio file upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const hasAudio = Array.from(e.dataTransfer.items).some(
      (item) => item.type.startsWith("audio/")
    );
    if (hasAudio) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("audio/"));
    if (files.length === 0) return;
    await uploadAudioFile(files[0]);
  };

  const uploadAudioFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      // Use the uploaded file's URL as a custom track
      const customTrackId = `custom-${Date.now()}`;
      const fullUrl = `${window.location.origin}${data.url}`;
      // Add to local tracks list for display
      const customTrack: Track = {
        id: customTrackId,
        name: file.name.replace(/\.[^/.]+$/, ""),
        file: fullUrl,
        duration: 0,
        mood: "custom",
        bpm: 0,
      };
      setTracks((prev) => [customTrack, ...prev]);
      onSelectTrack(customTrackId);
    } catch (err) {
      console.error("Audio upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full transition-colors",
        isDragOver && "bg-primary/5 ring-2 ring-inset ring-primary/30"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag-over overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Upload className="h-6 w-6" />
            <p className="text-xs font-medium">Drop audio to add track</p>
          </div>
        </div>
      )}

      {/* Scope toggle + volume */}
      <div className="px-3 py-2.5 border-b border-border space-y-2.5">
        {/* All Scenes / This Scene toggle */}
        {onToggleScope && (
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => onToggleScope(false)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                !applyToAllScenes
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Film className="h-3 w-3" />
              This Scene
            </button>
            <button
              onClick={() => onToggleScope(true)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                applyToAllScenes
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="h-3 w-3" />
              All Scenes
            </button>
          </div>
        )}

        {/* Volume */}
        <div className="flex items-center gap-2.5">
          <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Slider
            value={[volume * 100]}
            onValueChange={([v]) => onVolumeChange(v / 100)}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-[11px] text-muted-foreground w-8 text-right tabular-nums">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Drag-to-add hint */}
      <div className="px-3 py-2 border-b border-border/50">
        <button
          className="w-full flex items-center gap-2 py-1.5 px-2 rounded-md border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "audio/*";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) uploadAudioFile(file);
            };
            input.click();
          }}
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          ) : (
            <Upload className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="text-[11px]">
            {isUploading ? "Uploading..." : "Drop or click to add audio file"}
          </span>
        </button>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* No music option */}
            <button
              onClick={() => onSelectTrack(null)}
              className={cn(
                "w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-colors text-left",
                selectedTrackId === null
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted/50 border border-transparent"
              )}
            >
              <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Music className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">No Music</p>
                <p className="text-[10px] text-muted-foreground">Silent video</p>
              </div>
              {selectedTrackId === null && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
            </button>

            {tracks.map((track) => (
              <div
                key={track.id}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg transition-colors",
                  selectedTrackId === track.id
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted/50 border border-transparent"
                )}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handlePreviewToggle(track)}
                >
                  {previewingTrackId === track.id ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>

                <button
                  onClick={() => onSelectTrack(selectedTrackId === track.id ? null : track.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-xs font-medium truncate">{track.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded",
                      moodColors[track.mood] || "bg-muted text-muted-foreground"
                    )}>
                      {track.mood}
                    </span>
                    {track.bpm > 0 && (
                      <span className="text-[9px] text-muted-foreground">{track.bpm} BPM</span>
                    )}
                    {track.duration > 0 && (
                      <span className="text-[9px] text-muted-foreground">{formatDuration(track.duration)}</span>
                    )}
                  </div>
                </button>

                {selectedTrackId === track.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="px-3 py-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Royalty-free. Audio added to final export.
        </p>
      </div>
    </div>
  );
};

export default AudioTrackSelector;
