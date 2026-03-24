import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Play, Pause, Download, Loader2, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scene, framesToSeconds } from "@/lib/mockData";
import { AgentStep } from "@/lib/agentTypes";
import { useAgent } from "@/hooks/useAgent";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import SceneList from "@/components/editor/SceneList";
import MainPreview from "@/components/editor/MainPreview";
import VideoOutput from "@/components/editor/VideoOutput";
import AgentThoughts from "@/components/editor/AgentThoughts";

interface SceneStatus {
  status: "queued" | "generating" | "complete";
  progress: number;
  previewUrl?: string;
  previewSceneId?: string;
  videoUrl?: string;
}

const EditorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = (location.state as any)?.prompt || "Your product";
  const passedScenes: Scene[] = (location.state as any)?.scenes || [];

  const [scenes, setScenes] = useState<Scene[]>(passedScenes);
  const [selectedScene, setSelectedScene] = useState<number | "all">(0);
  const [sceneStatuses, setSceneStatuses] = useState<SceneStatus[]>(
    passedScenes.map((_, i) => ({
      status: i === 0 ? "generating" : "queued",
      progress: 0,
    })),
  );

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0);

  // Panel size for responsive layout
  const [videoPanelSize, setVideoPanelSize] = useState(30);

  // Single scene timeline state
  const [singleSceneTime, setSingleSceneTime] = useState(0);
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(
    null,
  );

  // Track steps per scene from agent
  const [sceneSteps, setSceneSteps] = useState<Record<number, AgentStep[]>>({});

  const totalDuration = scenes.reduce((a, s) => a + framesToSeconds(s.duration), 0);

  // Track whether the user manually overrode scene selection
  const userOverrodeSelectionRef = useRef(false);

  // Map from Remotion composition ID → scene index (for render tracking)
  const renderingScenesByIdRef = useRef<Map<string, number>>(new Map());

  // Callback fired by useAgent polling when a background render finishes
  const handleRenderComplete = useCallback(
    (renderSceneId: string, videoUrl: string) => {
      const sceneIndex = renderingScenesByIdRef.current.get(renderSceneId);
      if (sceneIndex !== undefined) {
        setSceneStatuses((prev) =>
          prev.map((s, i) =>
            i === sceneIndex ? { ...s, videoUrl } : s,
          ),
        );
        renderingScenesByIdRef.current.delete(renderSceneId);
      }
    },
    [],
  );

  // Use the agent for the current scene being processed
  const currentScene = scenes[currentSceneIndex];
  const {
    steps: agentSteps,
    isProcessing,
    sendMessage,
    error,
    latestPreviewUrl,
    latestPreviewSceneId,
    latestVideoUrl,
  } = useAgent({
    sceneId: currentScene?.id?.toString() || "unknown",
    sceneContext: currentScene
      ? {
          title: currentScene.title,
          description: currentScene.script,
          duration: currentScene.duration,
        }
      : undefined,
    onRenderComplete: handleRenderComplete,
  });

  // Track if we've started processing
  const hasStartedRef = useRef(false);
  const processingSceneRef = useRef<number | null>(null);
  // Track which scenes we've already triggered completion for (prevents double-firing)
  const completedScenesRef = useRef<Set<number>>(new Set());
  // Track if we're transitioning between scenes (prevents using stale agentSteps)
  const transitioningRef = useRef(false);

  // Start processing the first scene
  useEffect(() => {
    if (!hasStartedRef.current && scenes.length > 0) {
      hasStartedRef.current = true;
      startProcessingScene(0);
    }
  }, [scenes]);

  // Auto-follow the active scene during generation (unless user overrode)
  useEffect(() => {
    if (!userOverrodeSelectionRef.current) {
      setSelectedScene(currentSceneIndex);
    }
  }, [currentSceneIndex]);

  // Reset user override when all done
  useEffect(() => {
    if (allDone) {
      userOverrodeSelectionRef.current = false;
    }
  }, [allDone]);

  // Update steps for current scene as agent processes
  useEffect(() => {
    if (processingSceneRef.current !== null && agentSteps.length > 0) {
      setSceneSteps((prev) => ({
        ...prev,
        [processingSceneRef.current!]: agentSteps,
      }));

      // Update progress based on steps
      const progress = Math.min(
        Math.round((agentSteps.length / 6) * 100), // Assume ~6 steps per scene
        99,
      );
      setSceneStatuses((prev) =>
        prev.map((s, i) =>
          i === processingSceneRef.current ? { ...s, progress } : s,
        ),
      );

      // Register render steps for background-render tracking
      for (const step of agentSteps) {
        if (step.type === "render" && step.renderSceneId) {
          const key = step.renderSceneId;
          if (!renderingScenesByIdRef.current.has(key)) {
            renderingScenesByIdRef.current.set(
              key,
              processingSceneRef.current!,
            );
          }
        }
      }
    }
  }, [agentSteps]);

  // Handle scene completion when agent finishes
  useEffect(() => {
    // Clear transition flag once the new scene's agent starts processing
    if (transitioningRef.current && isProcessing) {
      transitioningRef.current = false;
    }

    // Don't process completion while transitioning (agentSteps may be stale)
    if (transitioningRef.current) return;

    if (
      !isProcessing &&
      processingSceneRef.current !== null &&
      agentSteps.length > 0
    ) {
      const sceneIndex = processingSceneRef.current;

      // Guard: skip if we've already handled completion for this scene
      if (completedScenesRef.current.has(sceneIndex)) return;

      const hasCompleteStep = agentSteps.some((s) => s.type === "complete");

      if (hasCompleteStep) {
        // Guard: skip if already marked complete in state (belt and suspenders)
        const currentStatus = sceneStatuses[sceneIndex];
        if (currentStatus?.status === "complete") return;

        // Mark this scene as handled BEFORE any state updates
        completedScenesRef.current.add(sceneIndex);

        // Mark scene as complete — videoUrl may still be undefined if render is async
        setSceneStatuses((prev) =>
          prev.map((s, i) =>
            i === sceneIndex
              ? {
                  status: "complete",
                  progress: 100,
                  previewUrl: latestPreviewUrl || undefined,
                  previewSceneId: latestPreviewSceneId || undefined,
                  videoUrl: latestVideoUrl || undefined,
                }
              : s,
          ),
        );

        // Move to next scene immediately (don't wait for render)
        const nextIndex = sceneIndex + 1;
        if (nextIndex < scenes.length) {
          transitioningRef.current = true; // Mark transitioning to prevent stale step processing
          startProcessingScene(nextIndex);
        } else {
          setAllDone(true);
          processingSceneRef.current = null;
        }
      }
    }
  }, [
    isProcessing,
    agentSteps,
    latestPreviewUrl,
    latestPreviewSceneId,
    latestVideoUrl,
    scenes.length,
    sceneStatuses,
  ]);

  const startProcessingScene = useCallback(
    (sceneIndex: number) => {
      const scene = scenes[sceneIndex];
      if (!scene) return;

      processingSceneRef.current = sceneIndex;
      setCurrentSceneIndex(sceneIndex);

      // Update status to generating
      setSceneStatuses((prev) =>
        prev.map((s, i) =>
          i === sceneIndex ? { ...s, status: "generating", progress: 0 } : s,
        ),
      );

      // Build the prompt for this scene
      const scenePrompt = buildScenePrompt(scene);

      // Pass scene data directly to avoid stale closure issues during transitions
      sendMessage(scenePrompt, {
        sceneId: String(scene.id),
        sceneContext: {
          title: scene.name,
          description: scene.notes || scene.elements.map((e) => e.description).join(" "),
          duration: framesToSeconds(scene.duration),
        },
      });
    },
    [scenes, sendMessage],
  );

  // Build a structured prompt for the agent using the full scene JSON
  const buildScenePrompt = (scene: Scene): string => {
    const durationSeconds = framesToSeconds(scene.duration);
    return `Generate a Remotion scene based on this structured specification:

${JSON.stringify({ scene }, null, 2)}

Requirements:
1. Scene ID: "${scene.id}" — use this exact value for writeSceneCode fileName and triggerPreview sceneId
2. Duration: ${scene.duration} frames (${durationSeconds}s at 30fps)
3. Implement each element using the component name in element.component (if specified)
4. Apply animation timing from element.animation.timing (start frame, duration, spring preset)
5. Apply exit animations from element.exit config (frame, type, duration)
6. Use the Background component configured with: ${JSON.stringify(scene.background)}
7. Apply scene transition: ${JSON.stringify(scene.transition ?? { type: "blur", duration: 15 })}
8. Follow the notes: "${scene.notes ?? "Exit elements in order, stagger by 3 frames."}"

Start with the think tool to plan your approach, then writeSceneCode → triggerPreview → renderScene.`;
  };

  // Playhead animation
  useEffect(() => {
    if (!isPlaying || !allDone) return;
    const interval = setInterval(() => {
      setPlayheadTime((t) => {
        if (t >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return t + 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, allDone, totalDuration]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    if (playheadTime >= totalDuration) setPlayheadTime(0);
  };

  const handleReset = () => {
    setPlayheadTime(0);
    setIsPlaying(false);
  };

  const handleReorderScenes = (newScenes: Scene[]) => {
    setScenes(newScenes);
  };

  const handleSeek = (time: number) => {
    setPlayheadTime(time);
  };

  const handleSingleSceneSeek = (time: number) => {
    setSingleSceneTime(time);
  };

  const handleTimestampSelect = (time: number | null) => {
    setSelectedTimestamp(time);
  };

  // Reset single scene state when changing scenes; record user override
  const handleSelectScene = (scene: number | "all") => {
    userOverrodeSelectionRef.current = true;
    setSelectedScene(scene);
    setSingleSceneTime(0);
    setSelectedTimestamp(null);
  };

  const displayScene = selectedScene === "all" ? null : scenes[selectedScene];
  const displaySteps =
    selectedScene === "all" ? [] : sceneSteps[selectedScene] || [];
  const displayStatus =
    selectedScene === "all" ? null : sceneStatuses[selectedScene];

  const isGenerating = displayStatus?.status === "generating";
  const isComplete = displayStatus?.status === "complete";
  const isQueued = displayStatus?.status === "queued";
  const displayPreviewSceneId = displayStatus?.previewSceneId;
  const displayVideoUrl = displayStatus?.videoUrl;
  const anyGenerating = sceneStatuses.some((s) => s.status === "generating");

  const generatingStep = displaySteps[displaySteps.length - 1];
  const generatingMessage =
    isGenerating && generatingStep ? generatingStep.label : undefined;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-foreground shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/storyboard", { state: { prompt } })}
            className="text-background/60 hover:text-background hover:bg-background/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span
            className="font-bold text-sm text-background"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {prompt.split(" ").slice(0, 4).join(" ")}
          </span>
          {!allDone && (
            <span className="flex items-center gap-1.5 text-xs text-primary-foreground bg-primary/80 px-2 py-0.5 rounded-full">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating...
            </span>
          )}
          {allDone && (
            <span className="flex items-center gap-1.5 text-xs text-accent-foreground bg-accent px-2 py-0.5 rounded-full">
              <Check className="h-3 w-3" />
              Complete
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {allDone && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg border-background/50 bg-background/10 text-background hover:bg-background/20"
                onClick={handleTogglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                {isPlaying ? "Pause" : "Preview"}
              </Button>
              <Button
                size="sm"
                className="gap-1.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() =>
                  navigate("/export", { state: { prompt, scenes } })
                }
              >
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main content with resizable panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left: Scene List */}
        <ResizablePanel defaultSize={15} minSize={12} maxSize={25}>
          <SceneList
            scenes={scenes}
            selectedScene={selectedScene}
            onSelectScene={handleSelectScene}
            sceneStatuses={sceneStatuses}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center + Bottom */}
        <ResizablePanel defaultSize={55}>
          <ResizablePanelGroup direction="vertical">
            {/* Main Preview */}
            <ResizablePanel defaultSize={70}>
              <MainPreview
                scene={displayScene}
                isGenerating={isGenerating}
                isQueued={isQueued}
                isComplete={isComplete}
                isAllScenes={selectedScene === "all"}
                allScenesGenerating={anyGenerating}
                previewUrl={displayStatus?.previewUrl}
                previewSceneId={displayPreviewSceneId}
                videoUrl={displayVideoUrl}
                generatingMessage={generatingMessage}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Video Output / Timeline */}
            <ResizablePanel
              defaultSize={30}
              minSize={15}
              onResize={setVideoPanelSize}
            >
              <VideoOutput
                scenes={scenes}
                selectedScene={selectedScene}
                isPlaying={isPlaying}
                currentTime={playheadTime}
                totalDuration={totalDuration}
                onTogglePlay={handleTogglePlay}
                onReset={handleReset}
                onSelectScene={handleSelectScene}
                onReorderScenes={handleReorderScenes}
                onSeek={handleSeek}
                sceneStatuses={sceneStatuses}
                allDone={allDone}
                panelSize={videoPanelSize}
                singleSceneTime={singleSceneTime}
                onSingleSceneSeek={handleSingleSceneSeek}
                selectedTimestamp={selectedTimestamp}
                onTimestampSelect={handleTimestampSelect}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Agent Thoughts */}
        <ResizablePanel defaultSize={30} minSize={20} collapsible>
          <AgentThoughts
            steps={displaySteps}
            isGenerating={isGenerating}
            isComplete={isComplete}
            selectedScene={selectedScene}
            allDone={allDone}
            selectedTimestamp={selectedTimestamp}
            onClearTimestamp={() => setSelectedTimestamp(null)}
            sceneContext={
              displayScene
                ? {
                    title: displayScene.title,
                    description: displayScene.script,
                    duration: displayScene.duration,
                  }
                : undefined
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default EditorPage;
