import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Film } from "lucide-react";
import { Scene, framesToSeconds } from "@/lib/mockData";

interface SceneWithVideo {
  scene: Scene;
  videoUrl: string;
  startTime: number;  // cumulative start time in seconds
  endTime: number;    // cumulative end time in seconds
}

interface CombinedVideoPlayerProps {
  scenes: Scene[];
  videoUrls: (string | undefined)[];
  currentTime: number;  // global time in seconds
  onTimeUpdate?: (time: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export interface CombinedVideoPlayerHandle {
  seek: (time: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
}

const CombinedVideoPlayer = forwardRef<CombinedVideoPlayerHandle, CombinedVideoPlayerProps>(
  function CombinedVideoPlayer(
    { scenes, videoUrls, currentTime, onTimeUpdate, isPlaying = false, onTogglePlay },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const internalTimeRef = useRef(0);

    // Build scene info with cumulative times
    const scenesWithVideo: SceneWithVideo[] = [];
    let cumulativeTime = 0;
    for (let i = 0; i < scenes.length; i++) {
      const videoUrl = videoUrls[i];
      const duration = framesToSeconds(scenes[i].duration);
      if (videoUrl) {
        scenesWithVideo.push({
          scene: scenes[i],
          videoUrl,
          startTime: cumulativeTime,
          endTime: cumulativeTime + duration,
        });
      }
      cumulativeTime += duration;
    }

    const totalDuration = cumulativeTime;

    // Find which scene should be playing based on currentTime
    const findSceneIndex = (time: number): number => {
      for (let i = scenesWithVideo.length - 1; i >= 0; i--) {
        if (time >= scenesWithVideo[i].startTime) {
          return i;
        }
      }
      return 0;
    };

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      seek: (time: number) => {
        const newIndex = findSceneIndex(time);
        setCurrentVideoIndex(newIndex);
        if (videoRef.current && scenesWithVideo[newIndex]) {
          const relativeTime = time - scenesWithVideo[newIndex].startTime;
          videoRef.current.currentTime = relativeTime;
          internalTimeRef.current = time;
        }
      },
      play: () => {
        videoRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      getCurrentTime: () => internalTimeRef.current,
    }));

    // Handle video time updates
    const handleTimeUpdate = () => {
      if (!videoRef.current || !scenesWithVideo[currentVideoIndex]) return;
      const relativeTime = videoRef.current.currentTime;
      const globalTime = scenesWithVideo[currentVideoIndex].startTime + relativeTime;
      internalTimeRef.current = globalTime;
      onTimeUpdate?.(globalTime);
    };

    // Handle video ended - move to next scene
    const handleEnded = () => {
      if (currentVideoIndex < scenesWithVideo.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
      } else {
        // Loop back to start
        setCurrentVideoIndex(0);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
      }
    };

    // Play/pause based on isPlaying prop
    useEffect(() => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    }, [isPlaying, currentVideoIndex]);

    // Sync time when currentTime changes from outside
    useEffect(() => {
      if (Math.abs(currentTime - internalTimeRef.current) > 0.5) {
        const newIndex = findSceneIndex(currentTime);
        if (newIndex !== currentVideoIndex) {
          setCurrentVideoIndex(newIndex);
        }
        if (videoRef.current && scenesWithVideo[newIndex]) {
          const relativeTime = currentTime - scenesWithVideo[newIndex].startTime;
          videoRef.current.currentTime = relativeTime;
          internalTimeRef.current = currentTime;
        }
      }
    }, [currentTime]);

    const handleReplay = () => {
      setCurrentVideoIndex(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    };

    if (scenesWithVideo.length === 0) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/20 p-6">
          <Film className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              No videos available yet
            </p>
            <p className="text-[10px] text-muted-foreground">
              Wait for scene renders to complete
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/20 p-6">
          <Film className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              Video unavailable
            </p>
            <p className="text-[10px] text-muted-foreground font-mono break-all">
              {scenesWithVideo[currentVideoIndex]?.videoUrl}
            </p>
          </div>
        </div>
      );
    }

    const currentSceneInfo = scenesWithVideo[currentVideoIndex];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 shrink-0 z-10">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-[10px] font-medium text-white/80">
              All Scenes ({currentVideoIndex + 1}/{scenesWithVideo.length})
            </span>
            <span className="text-[9px] text-white/50">
              - {currentSceneInfo?.scene.name}
            </span>
          </div>
          <button
            onClick={handleReplay}
            className="flex items-center gap-1 text-[10px] text-white/60 hover:text-white transition-colors"
            title="Replay"
          >
            <RotateCcw className="h-3 w-3" />
            Replay
          </button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="text-white text-xs">Loading...</div>
          </div>
        )}

        {/* Video element */}
        <video
          ref={videoRef}
          key={currentSceneInfo?.videoUrl}
          src={currentSceneInfo?.videoUrl}
          className="flex-1 w-full object-contain"
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={() => setError(true)}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onClick={onTogglePlay}
        />
      </motion.div>
    );
  }
);

export default CombinedVideoPlayer;
