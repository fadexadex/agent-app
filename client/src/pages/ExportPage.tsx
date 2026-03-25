import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Play, Pause, Film, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Scene, generateMockScenes, framesToSeconds } from "@/lib/mockData";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const ExportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = (location.state as any)?.prompt || "Your product";
  const scenes: Scene[] = (location.state as any)?.scenes || generateMockScenes(prompt);
  const projectId: string | undefined = (location.state as any)?.projectId;
  const sceneStatuses = (location.state as any)?.sceneStatuses;
  const audioTrack = (location.state as any)?.audioTrack;

  const [resolution, setResolution] = useState("1080p");
  const [format, setFormat] = useState("MP4");
  const [aspect, setAspect] = useState("16:9");
  const [playing, setPlaying] = useState(false);
  const [activeScene, setActiveScene] = useState(0);

  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Video preview states - sequential playback through all scenes
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  // Handle video ended - advance to next scene
  const handleVideoEnded = () => {
    if (activeScene < scenes.length - 1) {
      // Move to next scene
      setActiveScene(prev => prev + 1);
    } else {
      // Reached end - loop back to start
      setActiveScene(0);
      setPlaying(false);
    }
  };

  // When video loads, auto-play if we're in playing mode
  const handleVideoLoaded = () => {
    setVideoError(false);
    if (playing && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Toggle play/pause for the entire timeline
  const togglePlayAll = () => {
    if (playing) {
      videoRef.current?.pause();
      setPlaying(false);
    } else {
      setPlaying(true);
      videoRef.current?.play().catch(() => {});
    }
  };

  // Jump to specific scene in filmstrip
  const handleSceneClick = (index: number) => {
    setActiveScene(index);
    // If already playing, continue playing from new scene
    if (playing) {
      // Small delay to let React update the video src
      setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, 50);
    }
  };

  // Reset video error when switching scenes
  useEffect(() => {
    setVideoError(false);
  }, [activeScene]);

  const totalDuration = scenes.reduce((a, s) => a + framesToSeconds(s.duration), 0);

  // Use previewSceneId (the actual ID the agent registered) when available, fallback to scene.id
  const getSceneVideoId = (index: number): string =>
    (sceneStatuses?.[index] as any)?.previewSceneId || scenes[index]?.id || "";

  const handleDownload = async () => {
    // Use previewSceneId when available — it's the actual filename on disk
    const sceneIds = scenes.map((s, i) => getSceneVideoId(i)).filter(Boolean);

    if (sceneIds.length === 0) {
      toast.error("No scenes available to export.");
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      setDownloadUrl(null);

      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sceneIds,
          resolution,
          format,
          aspectRatio: aspect,
          audioTrackId: audioTrack?.trackId,
          audioVolume: audioTrack?.volume,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start export");
      }

      const data = await response.json();
      setExportJobId(data.exportId);
      toast.success(`Exporting ${sceneIds.length} scenes... This may take a moment.`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start export process.");
      setIsExporting(false);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isExporting && exportJobId && !downloadUrl) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`/api/export/status/${exportJobId}`);
          if (response.ok) {
            const data = await response.json();
            
            if (data.status === "rendering") {
              // Only update if progress is available, Remotion might not always give clear progress
              setExportProgress(data.progress || 0);
            } else if (data.status === "complete") {
              setExportProgress(100);
              setDownloadUrl(data.url);
              setIsExporting(false);
              toast.success("Export complete! Your video is ready to download.", {
                icon: <Check className="h-4 w-4" />,
              });
            } else if (data.status === "error") {
              setIsExporting(false);
              toast.error(`Export failed: ${data.error}`);
            }
          }
        } catch (error) {
          console.error("Error checking export status:", error);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isExporting, exportJobId, downloadUrl]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              projectId
                ? navigate("/editor", {
                    state: { prompt, scenes, projectId, sceneStatuses, fromVideos: false },
                  })
                : navigate("/storyboard", { state: { prompt, scenes } })
            }
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span
              className="font-bold text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Export Video
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            {/* Video preview - plays through all scenes sequentially */}
            <div
              className="relative rounded-2xl border overflow-hidden bg-black group"
              style={{ aspectRatio: aspect === "16:9" ? "16/9" : aspect === "9:16" ? "9/16" : "1/1" }}
            >
              {videoError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/10">
                  <div className="text-center p-8">
                    <Film className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Video preview unavailable</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{scenes[activeScene]?.name}</p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    key={getSceneVideoId(activeScene)}
                    src={`/previews/${getSceneVideoId(activeScene)}.mp4`}
                    className="w-full h-full object-contain"
                    muted
                    playsInline
                    onError={() => setVideoError(true)}
                    onLoadedData={handleVideoLoaded}
                    onEnded={handleVideoEnded}
                  />
                  {/* Play/Pause overlay */}
                  <button
                    onClick={togglePlayAll}
                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors"
                  >
                    <div className={`h-16 w-16 rounded-full bg-black/60 backdrop-blur flex items-center justify-center shadow-lg transition-opacity ${playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                      {playing ? (
                        <Pause className="h-7 w-7 text-white" />
                      ) : (
                        <Play className="h-7 w-7 text-white ml-1" />
                      )}
                    </div>
                  </button>
                  {/* Current scene indicator */}
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur text-white text-xs font-medium">
                    Scene {activeScene + 1} of {scenes.length}
                  </div>
                </>
              )}
            </div>

            {/* Scene filmstrip - shows progress through timeline */}
            <div className="grid mt-4 gap-2" style={{ gridTemplateColumns: `repeat(${scenes.length}, 1fr)` }}>
              {scenes.map((scene, i) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneClick(i)}
                  className={`h-12 rounded-lg bg-gradient-to-br ${scene.gradient ?? "from-primary/20 to-primary/5"} border-2 transition-all flex items-center justify-center ${
                    activeScene === i
                      ? "border-primary shadow-md scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <span className="text-[10px] font-bold text-foreground truncate px-1">{scene.category}</span>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-2">
              Total duration: {totalDuration}s · {scenes.length} scenes
            </p>
          </motion.div>
        </div>

        {/* Export settings */}
        <motion.aside
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:w-80 border-t lg:border-t-0 lg:border-l bg-card p-6 space-y-6"
        >
          <h3
            className="font-bold text-lg"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Export Settings
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resolution
              </Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="4K">4K (Ultra HD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Format
              </Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MP4">MP4</SelectItem>
                  <SelectItem value="WebM">WebM</SelectItem>
                  <SelectItem value="GIF">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Aspect Ratio
              </Label>
              <Select value={aspect} onValueChange={setAspect}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            {isExporting ? (
              <div className="space-y-2 p-4 bg-muted/50 rounded-xl border">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Rendering...
                  </span>
                  <span className="text-muted-foreground">{exportProgress}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center pt-2">
                  This can take a minute depending on complexity
                </p>
              </div>
            ) : downloadUrl ? (
              <Button
                size="lg"
                className="w-full rounded-xl gap-2 font-semibold bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = downloadUrl;
                  link.download = `exported-video.${format.toLowerCase()}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="h-4 w-4" /> Save to Device
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full rounded-xl gap-2 font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleDownload}
                disabled={isExporting}
              >
                <Download className="h-4 w-4" /> Export Video
              </Button>
            )}
            
          </div>
        </motion.aside>
      </main>
    </div>
  );
};

export default ExportPage;
