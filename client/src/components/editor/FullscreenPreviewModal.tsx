import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Maximize, Minimize, Volume2, VolumeX, Download } from "lucide-react";
import { Scene } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface FullscreenPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: Scene[];
  sceneStatuses: {
    status: "queued" | "generating" | "complete";
    videoUrl?: string;
  }[];
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const FullscreenPreviewModal = ({
  isOpen,
  onClose,
  scenes,
  sceneStatuses,
}: FullscreenPreviewModalProps) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const [currentGlobalTime, setCurrentGlobalTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const pendingSeekRef = useRef<number | null>(null);

  // Compute exact durations and start times
  const { validScenes, totalDuration, sceneStartTimes } = useMemo(() => {
    let total = 0;
    const startTimes: number[] = [];
    const filtered = scenes
      .map((scene, i) => ({
        ...scene,
        videoUrl: sceneStatuses[i]?.videoUrl,
        durationSec: scene.duration / 30, // 30fps
      }))
      .filter((s) => !!s.videoUrl);

    for (const s of filtered) {
      startTimes.push(total);
      total += s.durationSec;
    }

    return { validScenes: filtered, totalDuration: total, sceneStartTimes: startTimes };
  }, [scenes, sceneStatuses]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSceneIndex(0);
      setCurrentGlobalTime(0);
      setProgress(0);
      setIsPlaying(true);
      pendingSeekRef.current = null;
    } else {
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Play/pause logic
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      // Need a tiny delay in case it was just swapped and still loading
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.error("Autoplay prevented:", e));
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, currentSceneIndex]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || isDragging) return;
    
    const currentVideoTime = videoRef.current.currentTime;
    const globalTime = (sceneStartTimes[currentSceneIndex] || 0) + currentVideoTime;
    
    setCurrentGlobalTime(globalTime);
    setProgress(totalDuration > 0 ? (globalTime / totalDuration) * 100 : 0);
  };

  const handleVideoEnded = () => {
    if (currentSceneIndex < validScenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentSceneIndex(0); // loop back
      setCurrentGlobalTime(0);
      setProgress(0);
    }
  };

  const handleLoadedMetadata = () => {
    if (pendingSeekRef.current !== null && videoRef.current) {
      videoRef.current.currentTime = pendingSeekRef.current;
      pendingSeekRef.current = null;
      if (isPlaying) {
        videoRef.current.play().catch(e => console.error(e));
      }
    }
  };

  const seekToGlobalTime = (time: number) => {
    const clampedTime = Math.max(0, Math.min(time, totalDuration - 0.1));
    setCurrentGlobalTime(clampedTime);
    setProgress((clampedTime / totalDuration) * 100);

    let targetSceneIndex = 0;
    for (let i = 0; i < sceneStartTimes.length; i++) {
      if (clampedTime >= sceneStartTimes[i]) {
        targetSceneIndex = i;
      } else {
        break;
      }
    }

    const localTime = clampedTime - sceneStartTimes[targetSceneIndex];

    if (targetSceneIndex !== currentSceneIndex) {
      pendingSeekRef.current = localTime;
      setCurrentSceneIndex(targetSceneIndex);
    } else if (videoRef.current) {
      videoRef.current.currentTime = localTime;
    }
  };

  // Draggable Scrubber Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !progressBarRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seekToGlobalTime(percentage * totalDuration);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, totalDuration, sceneStartTimes, currentSceneIndex]);

  const handleProgressBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekToGlobalTime(percentage * totalDuration);
    setIsDragging(true);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen mode:", err.message);
      });
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleExport = () => {
    onClose();
    navigate("/export");
  };

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isFullscreen) {
        onClose();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen) return null;

  const currentVideo = validScenes[currentSceneIndex]?.videoUrl;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
        >
          <div 
            ref={containerRef}
            className="relative w-full h-full flex flex-col max-w-[100vw] max-h-[100vh] bg-black group"
          >
            {/* Header / Actions */}
            <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <span className="text-white/90 font-medium">
                  {validScenes.length > 0 ? `Scene ${currentSceneIndex + 1} of ${validScenes.length}` : "No complete scenes"}
                </span>
                {validScenes[currentSceneIndex]?.name && (
                  <span className="text-white/50 text-sm hidden sm:inline-block">
                    • {validScenes[currentSceneIndex].name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="gap-2 bg-white/10 hover:bg-white/20 text-white border-none"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" />
                  Continue to Export
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  onClick={onClose}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Video Player */}
            <div className="flex-1 relative flex items-center justify-center w-full h-full overflow-hidden">
              {currentVideo ? (
                <video
                  ref={videoRef}
                  src={currentVideo}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                  onLoadedMetadata={handleLoadedMetadata}
                  muted={isMuted}
                  playsInline
                />
              ) : (
                <div className="text-white/50 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white/40" />
                  </div>
                  <p>No rendered videos available for preview</p>
                </div>
              )}
            </div>

            {/* Footer / Controls */}
            <div className="absolute bottom-0 inset-x-0 z-10 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 to-transparent">
              
              {/* Progress Bar & Scrubber */}
              <div 
                className="w-full h-4 group/scrubber cursor-pointer flex items-center mb-4"
                ref={progressBarRef}
                onMouseDown={handleProgressBarMouseDown}
              >
                <div className="w-full h-1.5 bg-white/20 rounded-full relative transition-all duration-200 group-hover/scrubber:h-2.5">
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                  {/* Scrubber Thumb */}
                  <div 
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
                      isDragging ? "scale-125" : "scale-0 group-hover/scrubber:scale-100"
                    )}
                    style={{ left: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    className="text-white/90 hover:text-white hover:scale-110 transition-all"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
                  </button>
                  <button 
                    className="text-white/70 hover:text-white hover:scale-110 transition-all"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  
                  {/* Time display */}
                  <div className="text-white/70 text-sm font-mono tracking-wider">
                    <span className="text-white font-medium">{formatTime(currentGlobalTime)}</span>
                    <span className="mx-1 text-white/40">/</span>
                    <span>{formatTime(totalDuration)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    className="text-white/70 hover:text-white hover:scale-110 transition-all"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullscreenPreviewModal;
