import { useState, useRef, forwardRef } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Loader2,
  MonitorPlay,
  Terminal,
  Play,
  RotateCcw,
  Film,
} from "lucide-react";
import { Scene } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import GeneratingAnimation from "./GeneratingAnimation";
import CombinedVideoPlayer, { CombinedVideoPlayerHandle } from "./CombinedVideoPlayer";

interface MainPreviewProps {
  scene: Scene | null;
  isGenerating: boolean;
  isQueued?: boolean;
  isComplete?: boolean;
  isAllScenes?: boolean;
  allScenesGenerating?: boolean;
  previewUrl?: string | null;
  previewSceneId?: string | null;
  videoUrl?: string | null;
  generatingMessage?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
  // All scenes props
  allScenes?: Scene[];
  allVideoUrls?: (string | undefined)[];
  combinedTime?: number;
  onCombinedTimeUpdate?: (time: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  combinedPlayerRef?: React.RefObject<CombinedVideoPlayerHandle>;
}

const MainPreview = ({
  scene,
  isGenerating,
  isQueued = false,
  isComplete = false,
  isAllScenes = false,
  allScenesGenerating = false,
  previewUrl,
  previewSceneId,
  videoUrl,
  generatingMessage,
  videoRef,
  allScenes,
  allVideoUrls,
  combinedTime = 0,
  onCombinedTimeUpdate,
  isPlaying = false,
  onTogglePlay,
  combinedPlayerRef,
}: MainPreviewProps) => {
  // ── All scenes view ──────────────────────────────────────────────────────────
  if (isAllScenes) {
    if (allScenesGenerating) {
      return (
        <div className="flex-1 flex items-center justify-center bg-secondary/30 p-6">
          <div className="w-full max-w-2xl aspect-video rounded-xl border border-border overflow-hidden bg-card shadow-sm">
            <GeneratingAnimation message="Generating all scenes..." />
          </div>
        </div>
      );
    }

    // Check if we have videos to play
    const hasVideos = allScenes && allVideoUrls && allVideoUrls.some(url => url);

    if (hasVideos && allScenes && allVideoUrls) {
      return (
        <div className="flex-1 flex items-center justify-center bg-secondary/30 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl aspect-video rounded-xl border border-border overflow-hidden bg-card shadow-sm relative"
          >
            <CombinedVideoPlayer
              ref={combinedPlayerRef}
              scenes={allScenes}
              videoUrls={allVideoUrls}
              currentTime={combinedTime}
              onTimeUpdate={onCombinedTimeUpdate}
              isPlaying={isPlaying}
              onTogglePlay={onTogglePlay}
            />
          </motion.div>
        </div>
      );
    }

    // Fallback: no videos yet
    return (
      <div className="flex-1 flex items-center justify-center bg-secondary/30 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl aspect-video rounded-xl border border-border overflow-hidden bg-card shadow-sm relative"
        >
          <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-accent/10 to-primary/5">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-3">
                Combined Preview
              </p>
              <h2
                className="text-2xl font-bold text-foreground mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                All Scenes Ready
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your complete video is ready for preview and export.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── No scene selected ────────────────────────────────────────────────────────
  if (!scene) {
    return (
      <div className="flex-1 flex items-center justify-center bg-secondary/30 p-6">
        <div className="w-full max-w-2xl aspect-video rounded-xl border border-border overflow-hidden bg-card shadow-sm flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No scene selected</p>
        </div>
      </div>
    );
  }

  // ── Single scene view ────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex items-center justify-center bg-secondary/30 p-6">
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl aspect-video rounded-xl border border-border overflow-hidden bg-card shadow-sm relative"
      >
        {isGenerating ? (
          // ── Agent is writing / rendering ──
          <GeneratingAnimation sceneTitle={scene.name} message={generatingMessage} />
        ) : isQueued ? (
          // ── Waiting in queue ──
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="h-10 w-10 rounded-full border-2 border-dashed border-border mx-auto mb-3" />
              <p className="text-xs">Queued</p>
            </div>
          </div>
        ) : isComplete && videoUrl ? (
          // ── Best path: rendered MP4 available ──
          <RenderedVideoPlayer ref={videoRef} videoUrl={videoUrl} sceneTitle={scene.name} />
        ) : isComplete && previewUrl ? (
          // ── Fallback: Remotion Studio iframe (video not yet rendered) ──
          <RemotionStudioPreview
            previewUrl={previewUrl}
            sceneTitle={scene.name}
            previewSceneId={previewSceneId}
          />
        ) : isComplete ? (
          // ── Complete but neither video nor preview URL yet ──
          <SceneReadyState scene={scene} />
        ) : (
          // ── Idle / storyboard state ──
          <div
            className={`absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br ${
              scene.gradient ?? "from-primary/10 to-primary/5"
            }`}
          >
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
                {scene.category}
              </p>
              <h2
                className="text-2xl font-bold text-foreground mb-3"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {scene.name}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {scene.notes ?? scene.elements.map((e) => e.description).join(" ")}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Rendered MP4 video player ────────────────────────────────────────────────

interface RenderedVideoPlayerProps {
  videoUrl: string;
  sceneTitle?: string;
}

const RenderedVideoPlayer = forwardRef<HTMLVideoElement, RenderedVideoPlayerProps>(
  function RenderedVideoPlayer({ videoUrl, sceneTitle }, ref) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = (ref as React.RefObject<HTMLVideoElement>) ?? internalRef;
  const [error, setError] = useState(false);

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/20 p-6">
        <Film className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium text-foreground mb-1">
            Video unavailable
          </p>
          <p className="text-[10px] text-muted-foreground font-mono break-all">
            {videoUrl}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 bg-black flex flex-col"
    >
      {/* Slim header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 shrink-0 z-10">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          <span className="text-[10px] font-medium text-white/80">
            {sceneTitle || "Preview"}
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

      {/* Video element — autoplay muted so browsers allow it */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="flex-1 w-full object-contain"
        autoPlay
        loop
        muted
        playsInline
        controls
        onError={() => setError(true)}
      />
    </motion.div>
  );
});

// ─── Remotion Studio iframe fallback ─────────────────────────────────────────

interface RemotionStudioPreviewProps {
  previewUrl: string;
  sceneTitle?: string;
  previewSceneId?: string | null;
}

const RemotionStudioPreview = ({
  previewUrl,
  sceneTitle,
  previewSceneId,
}: RemotionStudioPreviewProps) => {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const loadedRef = useRef(false);

  const handleLoad = () => {
    loadedRef.current = true;
    setLoaded(true);
    setTimedOut(false);
  };

  const handleLoadStart = () => {
    setTimeout(() => {
      if (!loadedRef.current) {
        setTimedOut(true);
      }
    }, 8000);
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <MonitorPlay className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-medium text-muted-foreground">
            {sceneTitle || "Remotion Studio"}
          </span>
          <span className="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
            Rendering video…
          </span>
        </div>
        <div className="flex items-center gap-2">
          {previewSceneId && (
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground/70 bg-muted/80 px-1.5 py-0.5 rounded">
              <span>Select:</span>
              <code className="font-mono text-primary font-medium">
                {previewSceneId}
              </code>
            </div>
          )}
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Open Remotion Studio in new tab"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Iframe area */}
      <div className="flex-1 relative bg-background">
        {/* Loading */}
        {!loaded && !timedOut && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground">
                Loading Remotion Studio…
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                The rendered video will replace this once complete
              </p>
            </div>
          </div>
        )}

        {/* Studio not running */}
        {!loaded && timedOut && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 p-6">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <Terminal className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground mb-1">
                Rendering in Progress
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                The agent is rendering your scene. The video will appear here
                automatically once done.
              </p>
            </div>
          </div>
        )}

        <iframe
          src={previewUrl}
          className={cn(
            "absolute inset-0 w-full h-full border-0 transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
          title="Remotion Studio Preview"
          allow="autoplay"
          onLoad={handleLoad}
          onLoadStart={handleLoadStart}
        />
      </div>
    </div>
  );
};

// ─── Scene-ready state (complete but no video or preview URL yet) ─────────────

interface SceneReadyStateProps {
  scene: Scene;
}

const SceneReadyState = ({ scene }: SceneReadyStateProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={`absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br ${
      scene.gradient || "from-primary/10 to-primary/5"
    }`}
  >
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-card/60 backdrop-blur mb-4">
        <Play className="h-5 w-5 text-foreground/70 ml-0.5" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">
        Scene Generated
      </p>
      <h2
        className="text-xl font-bold text-foreground mb-2"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {scene.name}
      </h2>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
        Waiting for video render to complete…
      </p>
    </div>
  </motion.div>
);

export default MainPreview;
