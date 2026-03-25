import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Play, Pause, Download, Loader2, Check, ArrowLeft, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scene, framesToSeconds } from "@/lib/mockData";
import { AgentStep } from "@/lib/agentTypes";
import {
  createProjectFromScenes,
  saveProject,
  getProject,
  updateProjectSceneStatus,
  updateProjectAgentSteps,
  updateProjectSceneAudioTrack,
  StoredProject,
  AudioTrack,
} from "@/lib/storage";
import { useAgent } from "@/hooks/useAgent";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SceneList from "@/components/editor/SceneList";
import AssetList from "@/components/editor/AssetList";
import AudioTrackSelector from "@/components/editor/AudioTrackSelector";
import MainPreview from "@/components/editor/MainPreview";
import VideoOutput from "@/components/editor/VideoOutput";
import AgentThoughts from "@/components/editor/AgentThoughts";
import FullscreenPreviewModal from "@/components/editor/FullscreenPreviewModal";
import AddSceneModal from "@/components/editor/AddSceneModal";

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
  const passedProjectId: string | undefined = (location.state as any)?.projectId;
  const fromVideos: boolean = (location.state as any)?.fromVideos || false;
  const passedSceneStatuses: SceneStatus[] | undefined = (location.state as any)?.sceneStatuses;

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

  // Ref to the HTML video element inside MainPreview — used for real-time scrubbing
  const videoRef = useRef<HTMLVideoElement>(null);

  // Single scene timeline state
  const [singleSceneTime, setSingleSceneTime] = useState(0);
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(
    null,
  );
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState(false);
  const [isAddSceneModalOpen, setIsAddSceneModalOpen] = useState(false);

  // Track steps per scene from agent
  const [sceneSteps, setSceneSteps] = useState<Record<number, AgentStep[]>>({});

  // Audio track state
  const [audioTrack, setAudioTrack] = useState<AudioTrack | undefined>(undefined);

  const totalDuration = scenes.reduce((a, s) => a + framesToSeconds(s.duration), 0);

  // All renders complete — for loaded/completed projects trust the "complete" status directly
  // (videoUrl may not be in localStorage if the user navigated away before polling finished).
  // For fresh generations, require videoUrl to confirm the Remotion render finished this session.
  const allRendered = allDone && (
    (passedProjectId != null && sceneStatuses.every(s => s.status === "complete")) ||
    sceneStatuses.every(s => s.status === "complete" && !!s.videoUrl)
  );

  // Track whether the user manually overrode scene selection
  const userOverrodeSelectionRef = useRef(false);

  // Map from Remotion composition ID → scene index (for render tracking)
  const renderingScenesByIdRef = useRef<Map<string, number>>(new Map());

  // Current project ID for localStorage persistence
  const currentProjectIdRef = useRef<string | null>(passedProjectId || null);

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

        // Save to localStorage
        if (currentProjectIdRef.current) {
          updateProjectSceneStatus(
            currentProjectIdRef.current,
            sceneIndex,
            "complete",
            videoUrl
          );
        }
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
          title: currentScene.name,
          description: currentScene.notes || currentScene.elements.map(e => e.description).join(" "),
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

  // Initialize project in localStorage on mount
  useEffect(() => {
    // Case 1: Coming back from ExportPage with sceneStatuses already in state
    if (passedProjectId && passedSceneStatuses) {
      currentProjectIdRef.current = passedProjectId;
      setSceneStatuses(passedSceneStatuses);
      const allComplete = passedSceneStatuses.every((s) => s.status === "complete");
      if (allComplete) {
        setAllDone(true);
        hasStartedRef.current = true;
      }
    }
    // Case 2: Coming from VideosPage - load from localStorage
    else if (passedProjectId) {
      const savedProject = getProject(passedProjectId);
      if (savedProject) {
        currentProjectIdRef.current = savedProject.id;
        const restoredStatuses = savedProject.scenes.map((s) => ({
          status: s.generationStatus,
          progress: s.generationStatus === "complete" ? 100 : 0,
          videoUrl: s.videoUrl,
          previewUrl: s.previewUrl,
        }));
        setSceneStatuses(restoredStatuses);
        if (savedProject.agentSteps) {
          setSceneSteps(savedProject.agentSteps);
        }
        if (savedProject.status === "complete") {
          setAllDone(true);
          hasStartedRef.current = true;
        }
      }
    }
    // Case 3: New generation - create project
    else if (passedScenes.length > 0 && !currentProjectIdRef.current) {
      const newProject = createProjectFromScenes(prompt, passedScenes);
      saveProject(newProject);
      currentProjectIdRef.current = newProject.id;
    }
  }, []);

  // Start processing the first scene (only for new projects)
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

        // Save to localStorage (videoUrl may arrive later via handleRenderComplete)
        if (currentProjectIdRef.current) {
          updateProjectSceneStatus(
            currentProjectIdRef.current,
            sceneIndex,
            "complete",
            latestVideoUrl || undefined,
            latestPreviewUrl || undefined
          );
          updateProjectAgentSteps(currentProjectIdRef.current, {
            [sceneIndex]: agentSteps,
          });
        }

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
    (sceneIndex: number, overrides?: { assets?: string[] }) => {
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
        assets: overrides?.assets
      });
    },
    [scenes, sendMessage],
  );

  // Build a structured prompt for the agent using the full scene JSON
  const buildScenePrompt = (scene: Scene): string => {
    const durationSeconds = framesToSeconds(scene.duration);
    let prompt = `Generate a Remotion scene based on this structured specification:

${JSON.stringify({ scene }, null, 2)}

Requirements:
1. Scene ID: "${scene.id}" — use this exact value for writeSceneCode fileName and triggerPreview sceneId
2. Duration: ${scene.duration} frames (${durationSeconds}s at 30fps)
3. Implement each element using the component name in element.component (if specified)
4. Apply animation timing from element.animation.timing (start frame, duration, spring preset)
5. Apply exit animations from element.exit config (frame, type, duration)
6. Use the Background component configured with: ${JSON.stringify(scene.background)}
7. Apply scene transition: ${JSON.stringify(scene.transition ?? { type: "blur", duration: 15 })}
8. Follow the notes: "${scene.notes ?? "Exit elements in order, stagger by 3 frames."}"`;

    if (scene.audioTrack) {
      prompt += `\n9. AUDIO REQUIREMENT: Include this audio component anywhere in the scene JSX: <Audio src={staticFile("audio/${scene.audioTrack.trackId}.mp3")} volume={${scene.audioTrack.volume}} />. Import Audio and staticFile from "remotion".`;
    }

    prompt += `\n\nStart with the think tool to plan your approach, then writeSceneCode → triggerPreview → renderScene.`;
    return prompt;
  };

  const sceneStarts = useRef<number[]>([]);
  useEffect(() => {
    const starts: number[] = [];
    let acc = 0;
    for (const scene of scenes) {
      starts.push(acc);
      acc += framesToSeconds(scene.duration);
    }
    sceneStarts.current = starts;
  }, [scenes]);

  // Delete audio playhead sync logic since we're rendering it per-scene natively in remotion now.
  // We'll keep the AudioTrack state around purely for the UI selection, but playback is handled
  // by Remotion Studio and the final rendered MP4s.

  // Playhead animation and Video sync loop
  useEffect(() => {
    let animationFrameId: number;
    
    const tick = () => {
      // 1. Sync single scene time from video if available
      if (selectedScene !== "all" && typeof selectedScene === "number" && videoRef.current) {
        const vTime = videoRef.current.currentTime;
        setSingleSceneTime(vTime);
        
        // Sync isPlaying with video's play state
        const videoPlaying = !videoRef.current.paused;
        if (videoPlaying !== isPlaying) {
          setIsPlaying(videoPlaying);
        }
      } 
      // 2. Global playhead fallback when no video playing
      else if (selectedScene === "all") {
        if (isPlaying && allDone) {
          setPlayheadTime((t) => {
            const next = t + 16.66 / 1000; // rough 60fps delta
            if (next >= totalDuration) {
              setIsPlaying(false);
              return totalDuration;
            }
            return next;
          });
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedScene, isPlaying, allDone, totalDuration, playheadTime]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    if (playheadTime >= totalDuration) setPlayheadTime(0);
    // Sync video if we have the reference
    if (videoRef.current) {
      if (!isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
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

  // Real-time scrub: directly mutates video currentTime — no React state, no re-renders
  const handleScrub = useCallback((timeInSeconds: number) => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = timeInSeconds;
    }
  }, []);

  const handleTimestampSelect = (time: number | null) => {
    setSelectedTimestamp(time);
  };

  // Reset single scene state when changing scenes; record user override
  const handleSelectScene = (scene: number | "all") => {
    userOverrodeSelectionRef.current = true;
    setSelectedScene(scene);
    setSingleSceneTime(0);
    setSelectedTimestamp(null);
    if (scene !== "all" && typeof scene === "number") {
      setAudioTrack(scenes[scene]?.audioTrack);
    } else {
      setAudioTrack(undefined);
    }
  };

  const handleAddScene = (type: "ai" | "upload", data: string, assets?: string[]) => {
    // Generate a basic scene structure
    const newSceneId = `scene-${Date.now()}`;
    const newScene: Scene = {
      id: newSceneId,
      name: type === "ai" ? "New Generated Scene" : "Uploaded Scene",
      category: "transition",
      duration: 150, // default 5 seconds
      background: { type: "gradient", colors: ["#4F46E5", "#10B981"] },
      elements: [],
      notes: type === "ai" ? data : `Uploaded asset: ${data}`
    };

    setScenes(prev => [...prev, newScene]);
    setSceneStatuses(prev => [...prev, { status: "queued", progress: 0 }]);
    
    // Save to local storage
    if (currentProjectIdRef.current) {
      const project = getProject(currentProjectIdRef.current);
      if (project) {
        project.scenes.push({
          ...newScene,
          generationStatus: "queued"
        });
        saveProject(project);
      }
    }

    // Pass assets as overrides if present
    const overrides = assets ? { assets } : undefined;

    // If nothing is currently generating, we can start it.
    if (allDone && processingSceneRef.current === null) {
      setAllDone(false); // Reset allDone
      startProcessingScene(scenes.length, overrides);
    }
  };

  const handleSelectAudioTrack = (trackId: string | null) => {
    if (selectedScene === "all" || typeof selectedScene !== "number") return;
    
    const newTrack = trackId ? { trackId, volume: audioTrack?.volume ?? 0.3 } : undefined;
    setAudioTrack(newTrack);
    
    // Update local scenes state
    setScenes(prev => prev.map((s, i) => i === selectedScene ? { ...s, audioTrack: newTrack } : s));

    if (currentProjectIdRef.current) {
      updateProjectSceneAudioTrack(currentProjectIdRef.current, selectedScene, newTrack);
    }
  };

  const handleAudioVolumeChange = (volume: number) => {
    if (!audioTrack || selectedScene === "all" || typeof selectedScene !== "number") return;
    
    const newTrack = { ...audioTrack, volume };
    setAudioTrack(newTrack);
    
    // Update local scenes state
    setScenes(prev => prev.map((s, i) => i === selectedScene ? { ...s, audioTrack: newTrack } : s));

    if (currentProjectIdRef.current) {
      updateProjectSceneAudioTrack(currentProjectIdRef.current, selectedScene, newTrack);
    }
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
            onClick={() =>
              fromVideos
                ? navigate("/videos")
                : navigate("/storyboard", { state: { prompt, scenes } })
            }
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
          {allDone && !allRendered && (
            <span className="flex items-center gap-1.5 text-xs text-background/70">
              <Loader2 className="h-3 w-3 animate-spin" />
              Rendering videos...
            </span>
          )}
          {allRendered && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg border-background/50 bg-background/10 text-background hover:bg-background/20"
                onClick={() => setIsFullscreenPreviewOpen(true)}
              >
                <Maximize className="h-3.5 w-3.5" />
                Fullscreen Preview
              </Button>
              <Button
                size="sm"
                className="gap-1.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() =>
                  navigate("/export", {
                    state: {
                      prompt,
                      scenes,
                      projectId: currentProjectIdRef.current,
                      sceneStatuses,
                      audioTrack,
                    },
                  })
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
          <Tabs defaultValue="scenes" className="h-full flex flex-col w-full border-r border-border">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-12 p-0">
              <TabsTrigger 
                value="scenes" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
              >
                Scenes
              </TabsTrigger>
              <TabsTrigger 
                value="assets" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
              >
                Assets
              </TabsTrigger>
              <TabsTrigger 
                value="music" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
              >
                Music
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="scenes" className="flex-1 mt-0 overflow-hidden outline-none">
              <SceneList
                scenes={scenes}
                selectedScene={selectedScene}
                onSelectScene={handleSelectScene}
                sceneStatuses={sceneStatuses}
                onOpenAddScene={() => setIsAddSceneModalOpen(true)}
              />
            </TabsContent>
            
            <TabsContent value="assets" className="flex-1 mt-0 overflow-hidden outline-none">
              <AssetList />
            </TabsContent>

            <TabsContent value="music" className="flex-1 mt-0 overflow-hidden outline-none">
              <AudioTrackSelector
                selectedTrackId={audioTrack?.trackId || null}
                volume={audioTrack?.volume ?? 0.3}
                onSelectTrack={handleSelectAudioTrack}
                onVolumeChange={handleAudioVolumeChange}
              />
            </TabsContent>
          </Tabs>
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
                videoRef={videoRef}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Video Output / Timeline */}
            <ResizablePanel
              defaultSize={18}
              minSize={8}
              maxSize={40}
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
                onScrub={handleScrub}
                audioUrl={audioTrack ? `/audio/${audioTrack.trackId}.mp3` : undefined}
                audioTrackName={audioTrack ? audioTrack.trackId : undefined}
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
                    title: displayScene.name,
                    description: displayScene.notes || displayScene.elements.map(e => e.description).join(" "),
                    duration: displayScene.duration,
                  }
                : undefined
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <FullscreenPreviewModal
        isOpen={isFullscreenPreviewOpen}
        onClose={() => setIsFullscreenPreviewOpen(false)}
        scenes={scenes}
        sceneStatuses={sceneStatuses}
      />
      <AddSceneModal
        isOpen={isAddSceneModalOpen}
        onClose={() => setIsAddSceneModalOpen(false)}
        onAdd={handleAddScene}
      />

    </div>
  );
};

export default EditorPage;
