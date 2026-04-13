import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, Loader2, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Scene } from "@/lib/mockData";

interface SceneExportStatus {
  status: "queued" | "rendering" | "complete" | "error";
  progress: number;
  videoUrl?: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: Scene[];
  /** Already-rendered video URLs per scene (may be undefined if not yet rendered) */
  videoUrls: (string | undefined)[];
  projectId?: string | null;
}

type ModalStage = "configure" | "progress" | "complete";

export const ExportModal = ({
  isOpen,
  onClose,
  scenes,
  videoUrls,
  projectId,
}: ExportModalProps) => {
  const [modalStage, setModalStage] = useState<ModalStage>("configure");
  const [format, setFormat] = useState("MP4");
  const [resolution, setResolution] = useState("1080p");
  const [exportScope, setExportScope] = useState<"all" | "current">("all");
  const [sceneStatuses, setSceneStatuses] = useState<SceneExportStatus[]>([]);
  const pollRef = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setModalStage("configure");
      setSceneStatuses([]);
      pollRef.current.forEach(clearInterval);
      pollRef.current.clear();
    }
  }, [isOpen]);

  const scenesToExport = exportScope === "all" ? scenes : [scenes[0]];
  const totalDuration = scenesToExport.reduce((sum, s) => sum + s.duration / 30, 0);

  const handleStartExport = async () => {
    const statuses: SceneExportStatus[] = scenesToExport.map((_, i) => ({
      status: videoUrls[i] ? "complete" : "rendering",
      progress: videoUrls[i] ? 100 : 0,
      videoUrl: videoUrls[i],
    }));
    setSceneStatuses(statuses);
    setModalStage("progress");

    // For scenes that are already rendered, mark immediately complete.
    // For scenes still rendering (no videoUrl), poll the render-status endpoint.
    scenesToExport.forEach((scene, i) => {
      if (statuses[i].status === "complete") return;

      const sceneId = String(scene.id);
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/agent/render-status/${sceneId}`);
          const data = (await res.json()) as { status: string; videoUrl?: string };

          if (data.status === "complete" && data.videoUrl) {
            setSceneStatuses((prev) =>
              prev.map((s, idx) =>
                idx === i
                  ? { status: "complete", progress: 100, videoUrl: data.videoUrl }
                  : s,
              ),
            );
            clearInterval(interval);
            pollRef.current.delete(i);
          } else {
            // Simulate incremental progress while waiting
            setSceneStatuses((prev) =>
              prev.map((s, idx) =>
                idx === i && s.status === "rendering"
                  ? { ...s, progress: Math.min(s.progress + 5, 90) }
                  : s,
              ),
            );
          }
        } catch {
          // ignore poll errors
        }
      }, 2000);

      pollRef.current.set(i, interval);
    });
  };

  // Move to complete stage when all scenes are done
  useEffect(() => {
    if (
      modalStage === "progress" &&
      sceneStatuses.length > 0 &&
      sceneStatuses.every((s) => s.status === "complete" || s.status === "error")
    ) {
      setModalStage("complete");
    }
  }, [sceneStatuses, modalStage]);

  const completedUrls = sceneStatuses
    .filter((s) => s.status === "complete" && s.videoUrl)
    .map((s) => s.videoUrl!);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            {modalStage === "configure"
              ? "Export Video"
              : modalStage === "progress"
              ? "Rendering..."
              : "Export Complete"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {modalStage === "configure" && (
            <ConfigureStage
              key="configure"
              format={format}
              resolution={resolution}
              exportScope={exportScope}
              scenesCount={scenes.length}
              totalDuration={totalDuration}
              onFormatChange={setFormat}
              onResolutionChange={setResolution}
              onScopeChange={setExportScope}
              onStart={handleStartExport}
              onCancel={onClose}
            />
          )}

          {modalStage === "progress" && (
            <ProgressStage
              key="progress"
              sceneStatuses={sceneStatuses}
              scenes={scenesToExport}
              onCancel={() => {
                pollRef.current.forEach(clearInterval);
                pollRef.current.clear();
                onClose();
              }}
            />
          )}

          {modalStage === "complete" && (
            <CompleteStage
              key="complete"
              videoUrls={completedUrls}
              scenes={scenesToExport}
              onClose={onClose}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

// ─── Configure stage ──────────────────────────────────────────────────────────

interface ConfigureStageProps {
  format: string;
  resolution: string;
  exportScope: "all" | "current";
  scenesCount: number;
  totalDuration: number;
  onFormatChange: (v: string) => void;
  onResolutionChange: (v: string) => void;
  onScopeChange: (v: "all" | "current") => void;
  onStart: () => void;
  onCancel: () => void;
}

const ConfigureStage = ({
  format,
  resolution,
  exportScope,
  scenesCount,
  totalDuration,
  onFormatChange,
  onResolutionChange,
  onScopeChange,
  onStart,
  onCancel,
}: ConfigureStageProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    className="space-y-4 pt-2"
  >
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Format</Label>
        <Select value={format} onValueChange={onFormatChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MP4">MP4</SelectItem>
            <SelectItem value="WebM">WebM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Resolution</Label>
        <Select value={resolution} onValueChange={onResolutionChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="720p">720p</SelectItem>
            <SelectItem value="1080p">1080p (Full HD)</SelectItem>
            <SelectItem value="4k">4K</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="space-y-1.5">
      <Label className="text-xs">Scenes</Label>
      <div className="flex gap-2">
        {(["all", "current"] as const).map((scope) => (
          <button
            key={scope}
            onClick={() => onScopeChange(scope)}
            className={cn(
              "flex-1 py-1.5 text-xs rounded-md border transition-colors",
              exportScope === scope
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            {scope === "all"
              ? `All ${scenesCount} scenes · ~${Math.round(totalDuration)}s`
              : "Current scene only"}
          </button>
        ))}
      </div>
    </div>

    <div className="flex justify-end gap-2 pt-1">
      <Button variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="sm" onClick={onStart} className="gap-1.5">
        <Download className="h-3.5 w-3.5" />
        Start Export
      </Button>
    </div>
  </motion.div>
);

// ─── Progress stage ───────────────────────────────────────────────────────────

interface ProgressStageProps {
  sceneStatuses: SceneExportStatus[];
  scenes: Scene[];
  onCancel: () => void;
}

const ProgressStage = ({ sceneStatuses, scenes, onCancel }: ProgressStageProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    className="space-y-3 pt-2"
  >
    {scenes.map((scene, i) => {
      const status = sceneStatuses[i] ?? { status: "queued", progress: 0 };
      return (
        <div key={scene.id} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground/80 truncate max-w-[200px]">
              {i + 1}. {scene.name}
            </span>
            <span
              className={cn(
                "font-mono tabular-nums",
                status.status === "complete"
                  ? "text-green-500"
                  : status.status === "error"
                  ? "text-red-500"
                  : "text-muted-foreground",
              )}
            >
              {status.status === "complete" ? (
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3" /> Done
                </span>
              ) : status.status === "error" ? (
                "Error"
              ) : status.status === "rendering" ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {status.progress}%
                </span>
              ) : (
                "Queued"
              )}
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                status.status === "complete"
                  ? "bg-green-500"
                  : status.status === "error"
                  ? "bg-red-500"
                  : "bg-primary",
              )}
              initial={{ width: 0 }}
              animate={{ width: `${status.progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      );
    })}

    <div className="flex justify-end pt-1">
      <Button variant="outline" size="sm" onClick={onCancel} className="gap-1">
        <X className="h-3.5 w-3.5" />
        Cancel
      </Button>
    </div>
  </motion.div>
);

// ─── Complete stage ───────────────────────────────────────────────────────────

interface CompleteStageProps {
  videoUrls: string[];
  scenes: Scene[];
  onClose: () => void;
}

const CompleteStage = ({ videoUrls, scenes, onClose }: CompleteStageProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    className="space-y-4 pt-2"
  >
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="h-10 w-10 rounded-full bg-green-500/15 flex items-center justify-center">
        <Check className="h-5 w-5 text-green-500" />
      </div>
      <p className="text-sm font-medium text-foreground">Your video is ready!</p>
      <p className="text-xs text-muted-foreground">
        {videoUrls.length} scene{videoUrls.length !== 1 ? "s" : ""} exported
      </p>
    </div>

    <div className="space-y-2">
      {videoUrls.map((url, i) => (
        <a
          key={url}
          href={url}
          download={`${scenes[i]?.name ?? `scene-${i + 1}`}.mp4`}
          className="flex items-center justify-between p-2.5 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
        >
          <span className="text-xs text-foreground truncate">
            {scenes[i]?.name ?? `Scene ${i + 1}`}
          </span>
          <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
        </a>
      ))}
    </div>

    <div className="flex justify-end">
      <Button size="sm" onClick={onClose}>
        Done
      </Button>
    </div>
  </motion.div>
);

export default ExportModal;
