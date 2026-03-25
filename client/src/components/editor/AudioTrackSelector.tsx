import { useState, useEffect, useRef } from "react";
import { Play, Pause, Music, Volume2 } from "lucide-react";
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
}: AudioTrackSelectorProps) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch tracks on mount
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/audio/tracks.json");
        const data = await response.json();
        setTracks(data.tracks);
      } catch (error) {
        console.error("Failed to fetch audio tracks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePreviewToggle = (track: Track) => {
    if (previewingTrackId === track.id) {
      // Stop preview
      audioRef.current?.pause();
      setPreviewingTrackId(null);
    } else {
      // Start preview
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(`/audio/${track.file}`);
      audioRef.current.volume = volume;
      audioRef.current.play();
      audioRef.current.onended = () => setPreviewingTrackId(null);
      setPreviewingTrackId(track.id);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    if (selectedTrackId === trackId) {
      onSelectTrack(null); // Deselect
    } else {
      onSelectTrack(trackId);
    }
  };

  // Update preview audio volume when slider changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-32">
        <span className="text-sm text-muted-foreground">Loading tracks...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Volume control */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <Slider
            value={[volume * 100]}
            onValueChange={([v]) => onVolumeChange(v / 100)}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* No music option */}
        <button
          onClick={() => onSelectTrack(null)}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
            selectedTrackId === null
              ? "bg-primary/10 border border-primary/30"
              : "hover:bg-muted/50 border border-transparent"
          )}
        >
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
            <Music className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">No Music</p>
            <p className="text-xs text-muted-foreground">Silent video</p>
          </div>
          {selectedTrackId === null && (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )}
        </button>

        {/* Track options */}
        {tracks.map((track) => (
          <div
            key={track.id}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
              selectedTrackId === track.id
                ? "bg-primary/10 border border-primary/30"
                : "hover:bg-muted/50 border border-transparent"
            )}
          >
            {/* Preview button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => handlePreviewToggle(track)}
            >
              {previewingTrackId === track.id ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            {/* Track info - clickable to select */}
            <button
              onClick={() => handleSelectTrack(track.id)}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-sm font-medium truncate">{track.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded",
                    moodColors[track.mood] || "bg-muted text-muted-foreground"
                  )}
                >
                  {track.mood}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {track.bpm} BPM
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDuration(track.duration)}
                </span>
              </div>
            </button>

            {/* Selection indicator */}
            {selectedTrackId === track.id && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className="px-4 py-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Royalty-free music included. Audio will be added to final export.
        </p>
      </div>
    </div>
  );
};

export default AudioTrackSelector;
