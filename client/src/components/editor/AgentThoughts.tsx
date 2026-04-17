import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, Send, Clock, AlertCircle, Paperclip, X, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentStep } from "@/lib/agentTypes";
import { useAgent } from "@/hooks/useAgent";
import { useState, useEffect, useRef } from "react";
import AgentStepItem from "./AgentStepItem";
import { getUploadedAssetUrl, uploadFile, type UploadedAsset } from "@/lib/upload";
import SceneVersionHistory from "./SceneVersionHistory";
import { SceneVersion } from "@/lib/storage";
import { Scene } from "@/lib/mockData";

interface AgentThoughtsProps {
  steps: AgentStep[];
  isGenerating: boolean;
  isComplete: boolean;
  selectedScene: number | "all";
  allDone?: boolean;
  selectedTimestamp?: number | null;
  onClearTimestamp?: () => void;
  sceneContext?: Record<string, unknown>;
  allScenes?: Scene[];
  allSceneStatuses?: Array<{ previewSceneId?: string }>;
  onRefinementStart?: (sceneIndex: number, prompt: string) => void;
  onRefinementComplete?: (sceneIndex: number, videoUrl: string, prompt: string) => void;
  versions?: SceneVersion[];
  currentVersion?: number;
  onRestoreVersion?: (versionIndex: number) => void;
  projectId?: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
};

interface ChatMessage {
  id: number;
  role: "user" | "agent";
  text: string;
}

// ─── Refinement chat hook — manages state for refinement interactions ────────

interface UseRefinementChatOptions {
  selectedScene: number | "all";
  sceneContext?: Record<string, unknown>;
  allScenes?: Scene[];
  allSceneStatuses?: Array<{ previewSceneId?: string }>;
  onRefinementStart?: (sceneIndex: number, prompt: string) => void;
  onRefinementComplete?: (sceneIndex: number, videoUrl: string, prompt: string) => void;
  projectId?: string;
}

interface UseRefinementChatResult {
  chatInput: string;
  setChatInput: (value: string) => void;
  chatMessages: ChatMessage[];
  agentSteps: AgentStep[];
  isProcessing: boolean;
  error: Error | null;
  assets: UploadedAsset[];
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAsset: (index: number) => void;
  handleChat: () => void;
  multiSceneProgress: { current: number; total: number; sceneName: string } | null;
  refinementSceneIndex: number | null;
}

/**
 * Builds a robust edit instruction for the agent.
 * Tells it to discover the file via listFiles rather than guessing the path,
 * which prevents it from creating a brand-new scene when the file is in a subfolder.
 */
function buildEditPrefix(compositionId: string): string {
  return (
    `EDIT THE EXISTING SCENE — do NOT create a new one.\n` +
    `Remotion composition ID: "${compositionId}"\n` +
    `Steps:\n` +
    `1. Call listFiles("src/scenes") to locate the subfolder containing this scene\n` +
    `2. Call readFile on the found file to read the current code\n` +
    `3. Make ONLY the specific targeted changes described below — preserve all other animations, layout, and components\n` +
    `4. Call writeSceneCode with the SAME sceneId "${compositionId}"\n` +
    `5. Call triggerPreview → renderScene\n\n` +
    `User request: `
  );
}

function useRefinementChat(options: UseRefinementChatOptions): UseRefinementChatResult {
  const { selectedScene, sceneContext, allScenes, allSceneStatuses, onRefinementStart, onRefinementComplete, projectId } = options;
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPromptRef = useRef<string>("");
  const hasCompletedRef = useRef(false);
  // Capture the scene index when refinement starts - prevents wrong scene updates when user switches tabs
  const refiningSceneRef = useRef<number | null>(null);

  // Multi-scene editing queue
  const [multiSceneProgress, setMultiSceneProgress] = useState<{ current: number; total: number; sceneName: string } | null>(null);
  const multiSceneProgressActiveRef = useRef(false); // mirrors multiSceneProgress !== null for use inside effects
  const multiSceneQueueRef = useRef<Array<{ index: number; scene: Scene; message: string }>>([]);
  const multiSceneMsgRef = useRef<string>("");
  // Maps scene string-ID → array index so background renders are attributed to the right slot
  const sceneIndexMapRef = useRef<Map<string, number>>(new Map());
  // Guard: prevents the queue effect from advancing twice during the brief idle
  // window when a fresh Chat is created but hasn't yet reported status="submitted"
  const isStartingNextSceneRef = useRef(false);
  // Tracks which scene index is currently being refined (for UI relevance check)
  const [refinementSceneIndex, setRefinementSceneIndex] = useState<number | null>(null);

  const handleRenderComplete = (renderSceneId: string, videoUrl: string) => {
    // Prefer the ID-based map so background renders from earlier scenes are always
    // attributed to the correct slot even after the queue has advanced.
    const mappedIndex = sceneIndexMapRef.current.get(renderSceneId);
    if (mappedIndex !== undefined) {
      sceneIndexMapRef.current.delete(renderSceneId);
      hasCompletedRef.current = true; // prevent useEffect double-fire
      onRefinementComplete?.(mappedIndex, videoUrl, multiSceneMsgRef.current || lastPromptRef.current);
      return;
    }
    // Single-scene fallback (no map entry found)
    const targetScene = refiningSceneRef.current;
    if (targetScene !== null && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onRefinementComplete?.(targetScene, videoUrl, lastPromptRef.current);
      refiningSceneRef.current = null;
    }
  };

  const {
    steps: agentSteps,
    isProcessing,
    sendMessage,
    error,
    latestVideoUrl,
  } = useAgent({
    sceneId: selectedScene,
    sceneContext,
    projectId,
    onRenderComplete: handleRenderComplete,
  });

  // Detect completion when processing stops and we have a video URL.
  // handleRenderComplete (polling path) is the primary attribution mechanism;
  // this effect is a safety net for synchronous renders or if polling fires late.
  useEffect(() => {
    if (isProcessing || !latestVideoUrl || hasCompletedRef.current) return;
    const targetScene = refiningSceneRef.current;
    if (targetScene !== null) {
      hasCompletedRef.current = true;
      onRefinementComplete?.(targetScene, latestVideoUrl, lastPromptRef.current);
      refiningSceneRef.current = null;
    }
  }, [isProcessing, latestVideoUrl, onRefinementComplete]);

  // Reset the guard once the agent actually starts processing
  useEffect(() => {
    if (isProcessing) {
      isStartingNextSceneRef.current = false;
    }
  }, [isProcessing]);

  // Multi-scene: when agent finishes, process next scene in queue (or clear banner when done)
  useEffect(() => {
    // Guard: isProcessing is briefly false while the fresh Chat object transitions
    // from "idle" to "submitted". Without this flag the effect fires twice, skipping
    // a scene or sending it the wrong context.
    if (isProcessing || isStartingNextSceneRef.current) return;
    if (multiSceneQueueRef.current.length === 0) {
      // If the progress banner is still showing and queue is done, clear it
      if (multiSceneProgressActiveRef.current) {
        multiSceneProgressActiveRef.current = false;
        setMultiSceneProgress(null);
        setRefinementSceneIndex(null);
      }
      return;
    }

    // Claim the slot before any async work
    isStartingNextSceneRef.current = true;

    const next = multiSceneQueueRef.current.shift();
    if (!next) {
      setMultiSceneProgress(null);
      isStartingNextSceneRef.current = false;
      return;
    }
    const { index, scene, message } = next;
    const remaining = multiSceneQueueRef.current.length;

    multiSceneProgressActiveRef.current = true;
    setMultiSceneProgress((prev) => {
      const total = prev?.total ?? 1;
      return { current: total - remaining, total, sceneName: scene.name };
    });

    setMessageIdCounter((c) => {
      setChatMessages((prev) => [
        ...prev,
        { id: c, role: "agent", text: `Editing Scene ${index + 1} — ${scene.name}...` },
      ]);
      return c + 1;
    });

    hasCompletedRef.current = false;
    refiningSceneRef.current = index;
    lastPromptRef.current = message;
    sceneIndexMapRef.current.set(scene.id, index);
    setRefinementSceneIndex(index);
    onRefinementStart?.(index, message);

    // Use the actual Remotion composition ID (previewSceneId) if available,
    // otherwise fall back to scene.id
    const compositionId = allSceneStatuses?.[index]?.previewSceneId || scene.id;
    const editPrefix = buildEditPrefix(compositionId);
    sendMessage(editPrefix + message, { sceneId: compositionId, sceneContext: scene as any, projectId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProcessing]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newAssets: UploadedAsset[] = [];
      for (let i = 0; i < files.length; i++) {
        newAssets.push(await uploadFile(files[i]));
      }
      setAssets((prev) => [...prev, ...newAssets]);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAsset = (index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChat = () => {
    if ((!chatInput.trim() && assets.length === 0) || isProcessing || isUploading) return;

    const message = chatInput || (assets.length > 0 ? "Use these assets." : "");
    const newId = messageIdCounter;
    setMessageIdCounter((c) => c + 1);

    // Track the prompt, scene, and reset completion flag
    lastPromptRef.current = message;
    hasCompletedRef.current = false;

    // Capture the scene index at the time of refinement start
    if (typeof selectedScene === "number") {
      refiningSceneRef.current = selectedScene;
      onRefinementStart?.(selectedScene, message);
    }

    setChatMessages((prev) => [
      ...prev,
      { id: newId, role: "user", text: message },
    ]);

    // Store current assets to send, then clear input
    const currentAssets = [...assets];
    const currentAssetUrls = currentAssets.map((asset) => getUploadedAssetUrl(asset));
    setChatInput("");
    setAssets([]);

    // Multi-scene mode: queue edits across all scenes sequentially
    if (selectedScene === "all" && allScenes && allScenes.length > 0) {
      const queue = allScenes.map((scene, index) => ({ index, scene, message }));
      const total = queue.length;
      const first = queue.shift()!;
      multiSceneQueueRef.current = queue;
      multiSceneMsgRef.current = message;
      multiSceneProgressActiveRef.current = true;
      setMultiSceneProgress({ current: 1, total, sceneName: first.scene.name });

      setMessageIdCounter((c) => {
        setChatMessages((prev) => [
          ...prev,
          { id: c, role: "agent", text: `Editing Scene 1 — ${first.scene.name}...` },
        ]);
        return c + 1;
      });

      hasCompletedRef.current = false;
      refiningSceneRef.current = first.index;
      lastPromptRef.current = message;
      isStartingNextSceneRef.current = true;
      sceneIndexMapRef.current.set(first.scene.id, first.index);
      setRefinementSceneIndex(first.index);
      onRefinementStart?.(first.index, message);

      const firstCompositionId = allSceneStatuses?.[first.index]?.previewSceneId || first.scene.id;
      sendMessage(buildEditPrefix(firstCompositionId) + message, {
        sceneId: firstCompositionId,
        sceneContext: first.scene as any,
        assets: currentAssetUrls,
        projectId,
      });
      return;
    }

    // Single-scene: prepend edit instruction when refining an existing scene
    const sceneId = typeof sceneContext?.id === "string" ? sceneContext.id : undefined;
    // Prefer the actual Remotion composition ID from scene status over the scene JSON id
    const compositionId = (typeof selectedScene === "number" && allSceneStatuses?.[selectedScene]?.previewSceneId)
      || sceneId;

    if (compositionId && typeof selectedScene === "number") {
      sceneIndexMapRef.current.set(compositionId, selectedScene);
      setRefinementSceneIndex(selectedScene);
    }

    sendMessage(compositionId ? buildEditPrefix(compositionId) + message : message, {
      assets: currentAssetUrls,
      projectId,
    });
  };

  return {
    chatInput,
    setChatInput,
    chatMessages,
    agentSteps,
    isProcessing,
    error,
    assets,
    isUploading,
    fileInputRef,
    handleFileChange,
    removeAsset,
    handleChat,
    multiSceneProgress,
    refinementSceneIndex,
  };
}

// ─── Refinement chat content — renders inside ScrollArea ─────────────────────

interface RefinementChatContentProps {
  chatMessages: ChatMessage[];
  agentSteps: AgentStep[];
  isProcessing: boolean;
  error: Error | null;
}

const RefinementChatContent = ({
  chatMessages,
  agentSteps,
  isProcessing,
  error,
}: RefinementChatContentProps) => {
  return (
    <>
      {/* Chat messages */}
      {chatMessages.length > 0 && (
        <div className="mt-4 space-y-2">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className="flex justify-end mb-3"
            >
              <div className="text-[11px] p-2.5 rounded-xl rounded-br-sm bg-foreground text-background max-w-[85%]">
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real agent steps from refinement */}
      {agentSteps.length > 0 && (
        <AnimatePresence>
          {agentSteps.map((step, index) => (
            <motion.div layout={false} key={`agent-${step.id}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AgentStepItem
                step={step}
                isActive={isProcessing && index === agentSteps.length - 1}
              />
              {step.brief && step.status === "complete" && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="text-xs font-medium text-foreground pl-8 py-3 leading-relaxed"
                >
                  {step.brief}
                </motion.p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Processing indicator */}
      {isProcessing && agentSteps.length === 0 && chatMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 py-2 pl-1 text-muted-foreground"
        >
          <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-background">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </div>
          <span className="text-xs">Connecting to AI...</span>
        </motion.div>
      )}

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 py-2 pl-1 text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">{error.message}</span>
        </motion.div>
      )}
    </>
  );
};

// ─── Refinement chat input — renders outside ScrollArea (fixed at bottom) ────

interface RefinementChatInputProps {
  selectedScene: number | "all";
  selectedTimestamp?: number | null;
  onClearTimestamp?: () => void;
  chatInput: string;
  setChatInput: (value: string) => void;
  assets: UploadedAsset[];
  isUploading: boolean;
  isProcessing: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAsset: (index: number) => void;
  handleChat: () => void;
}

const RefinementChatInput = ({
  selectedScene,
  selectedTimestamp,
  onClearTimestamp,
  chatInput,
  setChatInput,
  assets,
  isUploading,
  isProcessing,
  fileInputRef,
  handleFileChange,
  removeAsset,
  handleChat,
}: RefinementChatInputProps) => {
  return (
    <div className="border-t border-border/50 px-3 py-3 shrink-0 bg-background">
      {selectedTimestamp !== null && (
        <div className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border/40">
          <Clock className="h-3 w-3 shrink-0" />
          <span>At {formatTime(selectedTimestamp)}</span>
          {onClearTimestamp && (
            <button onClick={onClearTimestamp} className="ml-auto text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {assets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {assets.map((asset, i) => (
            <div key={i} className="relative group rounded-lg border border-border/50 overflow-hidden bg-muted h-10 w-10 flex items-center justify-center">
              {asset.mediaType.startsWith("image/") ? (
                <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
              ) : (
                <div className="text-[8px] text-muted-foreground break-all p-1 text-center leading-tight">
                  {asset.filename.slice(-6)}
                </div>
              )}
              <button
                onClick={() => removeAsset(i)}
                className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1.5">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
        <div className="flex-1 relative">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleChat();
              }
            }}
            placeholder={
              selectedScene === "all"
                ? "Edit all scenes (e.g. 'make backgrounds darker')..."
                : selectedTimestamp !== null
                  ? `Change at ${formatTime(selectedTimestamp)}...`
                  : "Describe edits for this scene..."
            }
            rows={1}
            className="w-full resize-none bg-muted/40 border border-border/50 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors disabled:opacity-50"
            style={{ maxHeight: "80px", overflowY: "auto" }}
            disabled={isProcessing}
          />
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || isUploading}
            title="Attach file"
          >
            {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
          </Button>
          <Button
            size="icon"
            className="h-7 w-7 shrink-0 bg-primary hover:bg-primary/90 rounded-lg"
            onClick={handleChat}
            disabled={isProcessing || isUploading || (!chatInput.trim() && assets.length === 0)}
          >
            {isProcessing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const AgentThoughts = ({
  steps,
  isGenerating,
  isComplete,
  selectedScene,
  allDone = false,
  selectedTimestamp = null,
  onClearTimestamp,
  sceneContext,
  allScenes,
  allSceneStatuses,
  onRefinementStart,
  onRefinementComplete,
  versions = [],
  currentVersion = 1,
  onRestoreVersion,
  projectId,
}: AgentThoughtsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // When generating, the last step is always the "active" one
  const activeStepIndex = isGenerating ? steps.length - 1 : -1;

  const showRefinement = allDone && (isComplete || selectedScene === "all");

  // Use refinement chat hook (only active when showRefinement is true)
  const refinementChat = useRefinementChat({
    selectedScene,
    sceneContext,
    allScenes,
    allSceneStatuses,
    onRefinementStart,
    onRefinementComplete,
    projectId,
  });

  // When the user clicks a specific scene while a multi-scene edit is running,
  // only show the refinement steps if they belong to this scene.
  const showRefinementSteps =
    refinementChat.refinementSceneIndex === null ||
    selectedScene === "all" ||
    refinementChat.refinementSceneIndex === selectedScene;

  // Auto-scroll when new steps arrive or refinement content changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps, refinementChat.chatMessages, refinementChat.agentSteps]);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/50 flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span
            className="text-xs font-semibold text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            AI Agent
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {versions.length > 1 && onRestoreVersion && (
            <SceneVersionHistory
              versions={versions}
              currentVersion={currentVersion}
              onRestore={onRestoreVersion}
              disabled={isGenerating}
            />
          )}
          <span className="text-[10px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
            {selectedScene === "all"
              ? "All Scenes"
              : `Scene ${(selectedScene as number) + 1}`}
          </span>
        </div>
      </div>

      {/* Agent log - scrollable area */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
        <div className="relative p-3">
          {/* Vertical timeline line connecting steps */}
          {steps.length > 1 && (
            <div className="absolute w-px bg-border/50" style={{ left: "calc(0.75rem + 7px)", top: "1.5rem", bottom: "1.5rem" }} />
          )}

          {/* Generation steps */}
          <AnimatePresence>
            {steps.map((step, index) => (
              <motion.div layout={false} key={`${selectedScene}-${step.id}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <AgentStepItem
                  step={step}
                  isActive={isGenerating && index === activeStepIndex}
                />
                {step.brief && step.status === "complete" && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="text-xs font-medium text-foreground pl-8 py-3 leading-relaxed"
                  >
                    {step.brief}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator during generation */}
          {isGenerating && steps.length > 0 && activeStepIndex === -1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 py-2 pl-1 text-muted-foreground"
            >
              <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-background">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </div>
              <span className="text-xs">Processing...</span>
            </motion.div>
          )}

          {/* Empty state */}
          {steps.length === 0 && !isGenerating && !showRefinement && (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p className="text-xs">
                {selectedScene === "all"
                  ? "Select a scene to view agent logs"
                  : "Waiting to start..."}
              </p>
            </div>
          )}

          {/* Refinement chat content — only after all scenes finish */}
          {showRefinement && (
            <>
              {refinementChat.multiSceneProgress && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 py-2 px-3 mb-2 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-primary truncate">
                      Editing Scene {refinementChat.multiSceneProgress.current} of {refinementChat.multiSceneProgress.total}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{refinementChat.multiSceneProgress.sceneName}</p>
                  </div>
                  <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />
                </motion.div>
              )}
              <RefinementChatContent
                chatMessages={refinementChat.chatMessages}
                agentSteps={showRefinementSteps ? refinementChat.agentSteps : []}
                isProcessing={showRefinementSteps ? refinementChat.isProcessing : false}
                error={refinementChat.error}
              />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Refinement chat input — fixed at bottom, outside ScrollArea */}
      {showRefinement && (
        <RefinementChatInput
          selectedScene={selectedScene}
          selectedTimestamp={selectedTimestamp}
          onClearTimestamp={onClearTimestamp}
          chatInput={refinementChat.chatInput}
          setChatInput={refinementChat.setChatInput}
          assets={refinementChat.assets}
          isUploading={refinementChat.isUploading}
          isProcessing={refinementChat.isProcessing}
          fileInputRef={refinementChat.fileInputRef}
          handleFileChange={refinementChat.handleFileChange}
          removeAsset={refinementChat.removeAsset}
          handleChat={refinementChat.handleChat}
        />
      )}
    </div>
  );
};

export default AgentThoughts;
