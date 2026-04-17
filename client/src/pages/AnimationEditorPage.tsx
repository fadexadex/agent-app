import React, { useState, useEffect, useRef, useCallback, Component } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useChat, Chat } from "@ai-sdk/react";
import { isToolUIPart, getToolName, DefaultChatTransport, UIMessage, FileUIPart } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Send, Paperclip, AlertCircle, Play, X, Menu, Plus, MessageSquare, Trash2, Clock, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  getUploadedAssetUrl,
  isUploadedAssetObject,
  uploadFile,
  type UploadedAssetLike,
} from "@/lib/upload";
import MainPreview from "@/components/editor/MainPreview";
import AnimationControls from "@/components/editor/AnimationControls";
import AgentStepItem from "@/components/editor/AgentStepItem";
import SceneVersionHistory from "@/components/editor/SceneVersionHistory";
import { AgentStep } from "@/lib/agentTypes";
import { 
  getAllAnimationChats, 
  getAnimationChat, 
  saveAnimationChat, 
  deleteAnimationChat, 
  StoredAnimationChat, 
  getRelativeTime,
  addChatVersion,
  restoreChatVersion,
  SceneVersion
} from "@/lib/storage";

interface StoredChatDisplayState {
  currentVersion: number;
  versions: SceneVersion[];
  videoUrl: string | null;
  previewUrl: string | null;
  sceneId: string | null;
}

function getMessageText(
  message: Pick<UIMessage, "parts"> & { text?: string; content?: string } | null | undefined,
): string {
  if (!message) return "";
  const parts = Array.isArray(message.parts) ? message.parts : [];
  const partText =
    parts
      ?.filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("") || "";

  return partText || message.text || message.content || "";
}

function getMessageParts(message: Pick<UIMessage, "parts"> | null | undefined): unknown[] {
  return Array.isArray(message?.parts) ? message.parts : [];
}

function getStoredChatDisplayState(chat: StoredAnimationChat | null): StoredChatDisplayState {
  const versions = chat?.versions || [];

  if (versions.length === 0) {
    return {
      currentVersion: 1,
      versions,
      videoUrl: chat?.latestVideoUrl || null,
      previewUrl: chat?.latestPreviewUrl || null,
      sceneId: chat?.latestSceneId || null,
    };
  }

  const requestedVersion = chat?.currentVersion || versions.length;
  const clampedVersion = Math.min(Math.max(requestedVersion, 1), versions.length);
  const activeVersion = versions[clampedVersion - 1];

  return {
    currentVersion: clampedVersion,
    versions,
    videoUrl: activeVersion.videoUrl || null,
    previewUrl: activeVersion.previewUrl || null,
    sceneId: activeVersion.sceneId || chat?.latestSceneId || null,
  };
}

function isTextMessagePart(part: unknown): part is { type: "text"; text: string } {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    part.type === "text" &&
    "text" in part &&
    typeof part.text === "string"
  );
}

function isFileMessagePart(
  part: unknown,
): part is { type: "file"; url: string; filename?: string; mediaType?: string } {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    part.type === "file" &&
    "url" in part &&
    typeof part.url === "string"
  );
}

// ─── Simple inline markdown renderer ─────────────────────────────────────────
// Handles: **bold**, *italic*, `code`, headings (#/##/###), bullet lists (- / *)
function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Split on bold, italic, code spans
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith("**") && tok.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{tok.slice(2, -2)}</strong>;
    }
    if (tok.startsWith("*") && tok.endsWith("*") && tok.length > 2) {
      return <em key={i} className="italic">{tok.slice(1, -1)}</em>;
    }
    if (tok.startsWith("`") && tok.endsWith("`")) {
      return <code key={i} className="bg-muted px-1 py-0.5 rounded text-[0.8em] font-mono text-foreground/90">{tok.slice(1, -1)}</code>;
    }
    return <span key={i}>{tok}</span>;
  });
}

function MarkdownMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="space-y-1 pl-3 my-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 items-start text-sm text-foreground/80 leading-relaxed">
              <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-primary/60" />
              <span>{renderInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Heading
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);
    if (h3) {
      flushList();
      blocks.push(<p key={i} className="text-xs font-semibold uppercase tracking-wider text-primary/70 mt-3 mb-1">{renderInlineMarkdown(h3[1])}</p>);
      continue;
    }
    if (h2 || h1) {
      flushList();
      const content = (h2 || h1)![1];
      blocks.push(<p key={i} className="text-sm font-semibold text-foreground mt-2 mb-0.5">{renderInlineMarkdown(content)}</p>);
      continue;
    }

    // Bullet list item
    const bullet = line.match(/^[-*]\s+(.+)/);
    if (bullet) {
      listItems.push(bullet[1]);
      continue;
    }

    // Numbered list
    const numbered = line.match(/^\d+\.\s+(.+)/);
    if (numbered) {
      listItems.push(numbered[1]);
      continue;
    }

    // Empty line — flush list then add spacing
    if (line.trim() === "") {
      flushList();
      continue;
    }

    // Normal paragraph line
    flushList();
    blocks.push(
      <p key={i} className="text-sm text-foreground/80 leading-relaxed">
        {renderInlineMarkdown(line)}
      </p>
    );
  }

  flushList();
  return <div className="space-y-1">{blocks}</div>;
}

// ─── Error Boundary ─────────────────────────────────────────────────────────
class MessageErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive/60" />
          <p className="text-sm text-muted-foreground">Could not display messages.</p>
          <button
            className="text-xs text-primary underline"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Map tool calls to AgentStep types (copied from useAgent for local usage)
function toolCallToAgentStep(
  toolName: string,
  args: Record<string, unknown>,
  stepId: number,
  result?: unknown,
): AgentStep {
  const isComplete = result !== undefined;

  switch (toolName) {
    case "think":
      return {
        id: stepId,
        type: "thinking",
        label: isComplete ? "Reasoned through the request" : "Reasoning...",
        timestamp: 0,
        status: isComplete ? "complete" : "active",
        streamingContent: (
          (args as { thoughts?: unknown[] }).thoughts || []
        ).filter((t): t is string => typeof t === "string" && t.length > 0),
      };

    case "writeSceneCode": {
      const writeResult = result as { success?: boolean; fileName?: string; sceneId?: string } | undefined;
      return {
        id: stepId,
        type: "update",
        label: isComplete ? "Wrote animation code" : "Writing animation code...",
        timestamp: 0,
        status: isComplete ? "complete" : "active",
        files: [(args as { fileName?: string }).fileName || "unknown"],
        brief: writeResult?.success ? `Component: ${writeResult.sceneId}` : undefined,
      };
    }

    case "triggerPreview": {
      const previewResult = result as { success?: boolean; previewUrl?: string; sceneId?: string } | undefined;
      return {
        id: stepId,
        type: "preview",
        label: isComplete ? "Registered component" : "Registering component...",
        timestamp: 0,
        status: isComplete ? "complete" : "active",
        previewUrl: previewResult?.previewUrl,
        brief: previewResult?.success ? `Registered: ${previewResult.sceneId}` : undefined,
      };
    }

    case "renderScene": {
      const renderResult = result as { success?: boolean; status?: string; videoUrl?: string } | undefined;
      const isBackground = renderResult?.status === "rendering";
      return {
        id: stepId,
        type: "render",
        label: isComplete ? (isBackground ? "Render started" : "Video rendered") : "Rendering video...",
        timestamp: 0,
        status: isComplete ? "complete" : "active",
        videoUrl: renderResult?.success && !isBackground ? renderResult.videoUrl : undefined,
        brief: renderResult?.success ? "Playback ready" : undefined,
      };
    }
    
    case "readFile":
    case "listFiles":
      return {
        id: stepId,
        type: "explore",
        label: isComplete ? "Investigated codebase" : "Investigating codebase...",
        timestamp: 0,
        status: isComplete ? "complete" : "active",
      };

    default:
      return {
        id: stepId,
        type: "generate",
        label: isComplete ? `Executed ${toolName}` : `Executing ${toolName}...`,
        timestamp: 0,
        status: isComplete ? "complete" : "active",
      };
  }
}

const AnimationEditorPageInner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { chatId } = useParams<{ chatId: string }>();
  
  const existingChat = chatId ? getAnimationChat(chatId) : null;
  const initialDisplayState = getStoredChatDisplayState(existingChat);
  const state = location.state as Record<string, unknown> | undefined;
  const initialPrompt = (state?.prompt as string) || "";
  const rawInitialAssets = (state?.assets as UploadedAssetLike[]) || [];
  const initialAssets = rawInitialAssets.filter(isUploadedAssetObject);
  const initialAssetUrls = rawInitialAssets.map((asset) => getUploadedAssetUrl(asset));
  const brandColors = (state?.brandColors as string[]) || [];
  const brandName = (state?.brandName as string) || "";
  const brandFonts =
    (state?.brandFonts as { role?: string; family: string }[]) || [];
  const brandLogos = (state?.brandLogos as string[]) || [];
  const brandBackdrops = (state?.brandBackdrops as string[]) || [];

  type PendingFile = {
    url: string;
    previewUrl: string; // data URL for images, "" for others
    filename: string;
    mediaType: string;
    size: number;
  };
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasStartedRef = useRef(false);
  const activeChatId = useRef(chatId || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()));
  const existingChatTitleRef = useRef(existingChat?.title || "Studio");
  const createdAtRef = useRef(existingChat?.createdAt || Date.now());
  const stableProjectId = useRef(existingChat?.projectId || activeChatId.current);

  const [latestVideoUrl, setLatestVideoUrl] = useState<string | null>(initialDisplayState.videoUrl);
  const [latestPreviewUrl, setLatestPreviewUrl] = useState<string | null>(initialDisplayState.previewUrl);
  const [latestSceneId, setLatestSceneId] = useState<string | null>(initialDisplayState.sceneId);
  const [currentVersion, setCurrentVersion] = useState(initialDisplayState.currentVersion);
  const [versions, setVersions] = useState<SceneVersion[]>(initialDisplayState.versions);
  const [isRendering, setIsRendering] = useState(false);
  // True once triggerPreview fires during a refinement round — signals the live
  // preview should be shown instead of the (stale) last rendered video.
  const [refinementPreviewReady, setRefinementPreviewReady] = useState(false);
  const [historyChats, setHistoryChats] = useState<StoredAnimationChat[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);

  const renderPollIntervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const activeRenderPollBySceneRef = useRef<Map<string, string>>(new Map());
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Refs to avoid re-running the RAF loop when duration/time change
  const videoDurationRef = useRef(0);
  const videoCurrentTimeRef = useRef(0);
  // Refs that shadow latestPreviewUrl/latestVideoUrl/latestSceneId state — used in the
  // messages effect so the effect only re-runs when `messages` changes, not when those
  // states change (which would create an infinite update cascade on loaded chats).
  const latestPreviewUrlRef = useRef<string | null>(initialDisplayState.previewUrl);
  const latestVideoUrlRef = useRef<string | null>(initialDisplayState.videoUrl);
  const latestSceneIdRef = useRef<string | null>(initialDisplayState.sceneId);
  const lastSubmittedPromptRef = useRef(initialPrompt || existingChat?.title || "");
  const committedRenderUrlsRef = useRef<Set<string>>(
    new Set(initialDisplayState.versions.map((version) => version.videoUrl).filter(Boolean)),
  );
  // Ref mirrors for use inside the messages effect (avoids adding state to deps)
  const isProcessingRef = useRef(false);
  const prevIsProcessingRef = useRef(false);

  useEffect(() => {
    setHistoryChats(getAllAnimationChats());
  }, []);

  const [chat, setChat] = useState(() => new Chat<UIMessage>({
    messages: existingChat?.messages || [],
    transport: new DefaultChatTransport({
      api: "/api/agent/chat",
      body: {
        projectId: stableProjectId.current,
        assets: initialAssetUrls,
        sceneContext: {
          brandColors,
          brandName,
          brandFonts,
          brandLogos,
          brandBackdrops,
        },
      },
    }),
  }));

  const { messages, status, error } = useChat({ chat });

  const isProcessing = status === "streaming" || status === "submitted";

  const applyDisplayedMedia = useCallback(
    ({
      videoUrl,
      previewUrl,
      sceneId,
    }: {
      videoUrl?: string | null;
      previewUrl?: string | null;
      sceneId?: string | null;
    }) => {
      latestVideoUrlRef.current = videoUrl ?? null;
      latestPreviewUrlRef.current = previewUrl ?? null;
      latestSceneIdRef.current = sceneId ?? null;
      setLatestVideoUrl(videoUrl ?? null);
      setLatestPreviewUrl(previewUrl ?? null);
      setLatestSceneId(sceneId ?? null);
    },
    [],
  );

  const syncVersionStateFromChat = useCallback(
    (storedChat: StoredAnimationChat | null) => {
      const displayState = getStoredChatDisplayState(storedChat);
      setVersions(displayState.versions);
      setCurrentVersion(displayState.currentVersion);
      committedRenderUrlsRef.current = new Set(
        displayState.versions.map((version) => version.videoUrl).filter(Boolean),
      );
      applyDisplayedMedia({
        videoUrl: displayState.videoUrl,
        previewUrl: displayState.previewUrl,
        sceneId: displayState.sceneId,
      });
    },
    [applyDisplayedMedia],
  );

  const commitRenderedVersion = useCallback(
    ({
      videoUrl,
      previewUrl,
      sceneId,
      prompt,
    }: {
      videoUrl: string;
      previewUrl?: string | null;
      sceneId?: string | null;
      prompt?: string;
    }) => {
      if (committedRenderUrlsRef.current.has(videoUrl)) {
        applyDisplayedMedia({
          videoUrl,
          previewUrl: previewUrl ?? latestPreviewUrlRef.current,
          sceneId: sceneId ?? latestSceneIdRef.current,
        });
        setIsRendering(false);
        setRefinementPreviewReady(false);
        return;
      }

      const updatedChat = addChatVersion(activeChatId.current, {
        videoUrl,
        previewUrl: previewUrl ?? latestPreviewUrlRef.current ?? undefined,
        sceneId: sceneId ?? latestSceneIdRef.current ?? undefined,
        prompt: prompt || lastSubmittedPromptRef.current || "Refinement",
      });

      if (updatedChat) {
        syncVersionStateFromChat(updatedChat);
      } else {
        applyDisplayedMedia({
          videoUrl,
          previewUrl: previewUrl ?? latestPreviewUrlRef.current,
          sceneId: sceneId ?? latestSceneIdRef.current,
        });
        committedRenderUrlsRef.current.add(videoUrl);
      }

      setIsRendering(false);
      setRefinementPreviewReady(false);
    },
    [applyDisplayedMedia, syncVersionStateFromChat],
  );

  // Keep isProcessingRef in sync so the messages effect can read it without
  // adding isProcessing as a dep (which would create an update cascade).
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  });

  // Detect refinement start/end to control the live-preview overlay state.
  // When processing starts and there is already a rendered video → it's a
  // refinement; reset refinementPreviewReady until triggerPreview fires again.
  useEffect(() => {
    if (isProcessing && !prevIsProcessingRef.current && latestVideoUrlRef.current) {
      setRefinementPreviewReady(false);
    } else if (!isProcessing && prevIsProcessingRef.current) {
      // Agent finished — keep refinementPreviewReady as-is so the live preview
      // stays visible while render polling completes.
    }
    prevIsProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // Clean polling intervals
  useEffect(() => {
    const intervals = renderPollIntervalsRef.current;
    const activeRenderPolls = activeRenderPollBySceneRef.current;
    return () => {
      intervals.forEach(clearInterval);
      intervals.clear();
      activeRenderPolls.clear();
    };
  }, []);

  useEffect(() => {
    if (latestPreviewUrl || latestVideoUrl) {
      setIsPlaying(true);
      // Reset playback state for new content
      videoCurrentTimeRef.current = 0;
      videoDurationRef.current = 0;
      setVideoCurrentTime(0);
      setVideoDuration(0);
    }
  }, [latestPreviewUrl, latestVideoUrl]);

  // RAF loop — sync currentTime from native video element.
  // Uses refs for comparison to avoid restarting the loop on every state change.
  // Throttles state updates: duration only when it actually changes,
  // currentTime only when it shifts by ≥ 0.05s to avoid 60fps full re-renders.
  useEffect(() => {
    let rafId: number;
    const loop = () => {
      const vid = videoRef.current;
      if (vid) {
        const t = vid.currentTime;
        if (Math.abs(t - videoCurrentTimeRef.current) >= 0.05) {
          videoCurrentTimeRef.current = t;
          setVideoCurrentTime(t);
        }
        const d = vid.duration;
        if (d && isFinite(d) && d !== videoDurationRef.current) {
          videoDurationRef.current = d;
          setVideoDuration(d);
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []); // empty deps — runs once on mount, refs handle change tracking

  // Listen to Remotion iframe postMessages for preview stage time tracking
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data as { type?: string; frame?: number; durationInFrames?: number } | null;
      if (!data) return;
      if (data.type === "timeupdate" && typeof data.frame === "number") {
        setVideoCurrentTime(data.frame / 30);
      }
      if (data.type === "duration" && typeof data.durationInFrames === "number") {
        setVideoDuration(data.durationInFrames / 30);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Keep video playbackRate in sync with speed state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed, isPlaying]);

  // Spacebar → play/pause (ignore when typing in inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => {
          const next = !p;
          if (videoRef.current) {
            if (next) videoRef.current.play().catch(() => {});
            else videoRef.current.pause();
          }
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const startRenderPolling = useCallback(
    (
      renderSceneId: string,
      videoUrl: string,
      metadata?: { previewUrl?: string | null; sceneId?: string | null; prompt?: string },
    ) => {
      setIsRendering(true);

      const renderKey = videoUrl || `${renderSceneId}:${Date.now()}`;
      const previousRenderKey = activeRenderPollBySceneRef.current.get(renderSceneId);

      if (previousRenderKey) {
        const previousInterval = renderPollIntervalsRef.current.get(previousRenderKey);
        if (previousInterval) clearInterval(previousInterval);
        renderPollIntervalsRef.current.delete(previousRenderKey);
      }

      activeRenderPollBySceneRef.current.set(renderSceneId, renderKey);

      const stopPolling = () => {
        const interval = renderPollIntervalsRef.current.get(renderKey);
        if (interval) clearInterval(interval);
        renderPollIntervalsRef.current.delete(renderKey);
        if (activeRenderPollBySceneRef.current.get(renderSceneId) === renderKey) {
          activeRenderPollBySceneRef.current.delete(renderSceneId);
        }
      };

      const pollInterval = setInterval(async () => {
        try {
          if (activeRenderPollBySceneRef.current.get(renderSceneId) !== renderKey) {
            stopPolling();
            return;
          }

          const response = await fetch(`/api/agent/render-status/${renderSceneId}`);
          const data = (await response.json()) as { status: string; videoUrl?: string };

          if (data.status === "complete") {
            stopPolling();
            commitRenderedVersion({
              videoUrl: data.videoUrl || videoUrl,
              previewUrl: metadata?.previewUrl,
              sceneId: metadata?.sceneId || renderSceneId,
              prompt: metadata?.prompt,
            });
          } else if (data.status === "failed") {
            console.warn(`[Poll] Render failed for ${renderSceneId}`);
            stopPolling();
            setIsRendering(false);
          }
        } catch (err) {
          console.error("Poll error:", err);
        }
      }, 2000);

      renderPollIntervalsRef.current.set(renderKey, pollInterval);
    },
    [commitRenderedVersion],
  );

  // Parse messages to extract tool outputs (like video/preview URLs).
  // Uses refs for URL comparisons instead of state deps to prevent cascade:
  // if latestVideoUrl/latestPreviewUrl were in deps, calling setLatestVideoUrl
  // inside would re-run this effect, creating an infinite update loop on loaded chats.
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant" || !lastMessage.parts) return;
    const latestUserPrompt =
      lastSubmittedPromptRef.current ||
      getMessageText([...messages].reverse().find((message) => message.role === "user") as UIMessage | undefined) ||
      "Refinement";

    for (const part of lastMessage.parts) {
      if (isToolUIPart(part) && part.state === "output-available" && part.output) {
        const toolName = getToolName(part);

        if (toolName === "triggerPreview") {
          const result = part.output as { previewUrl?: string; sceneId?: string };
          if (
            (result.previewUrl && result.previewUrl !== latestPreviewUrlRef.current) ||
            (result.sceneId && result.sceneId !== latestSceneIdRef.current)
          ) {
            applyDisplayedMedia({
              videoUrl: latestVideoUrlRef.current,
              previewUrl: result.previewUrl ?? latestPreviewUrlRef.current,
              sceneId: result.sceneId ?? latestSceneIdRef.current,
            });
            // If this triggerPreview fires during a refinement (agent is running and
            // there is already a rendered video), mark the live preview as ready so
            // MainPreview can switch to showing the new code immediately.
            if (isProcessingRef.current && latestVideoUrlRef.current) {
              setRefinementPreviewReady(true);
            }
          }
        }

        if (toolName === "renderScene") {
          const result = part.output as { success?: boolean; status?: string; sceneId?: string; videoUrl?: string };
          if (result.success && result.status === "rendering" && result.sceneId) {
            startRenderPolling(result.sceneId, result.videoUrl || "", {
              previewUrl: latestPreviewUrlRef.current,
              sceneId: latestSceneIdRef.current || result.sceneId,
              prompt: latestUserPrompt,
            });
            if (result.sceneId && result.sceneId !== latestSceneIdRef.current) {
              applyDisplayedMedia({
                videoUrl: latestVideoUrlRef.current,
                previewUrl: latestPreviewUrlRef.current,
                sceneId: result.sceneId,
              });
            }
          } else if (
            result.success &&
            result.videoUrl &&
            !committedRenderUrlsRef.current.has(result.videoUrl) &&
            result.videoUrl !== latestVideoUrlRef.current
          ) {
            commitRenderedVersion({
              videoUrl: result.videoUrl,
              previewUrl: latestPreviewUrlRef.current,
              sceneId: latestSceneIdRef.current || result.sceneId,
              prompt: latestUserPrompt,
            });
          }
        }
      }
    }
  }, [applyDisplayedMedia, commitRenderedVersion, messages, startRenderPolling]);

  // Initial trigger for new chats
  useEffect(() => {
    const hasInitialAssets = initialAssetUrls.length > 0;

    if (
      !hasStartedRef.current &&
      messages.length === 0 &&
      (initialPrompt || hasInitialAssets)
    ) {
      hasStartedRef.current = true;
      lastSubmittedPromptRef.current = initialPrompt || "Use these uploaded assets.";
      chat.sendMessage({
        text: initialPrompt || "Use these uploaded assets.",
        files:
          initialAssets.length > 0
            ? initialAssets.map<FileUIPart>((asset) => ({
                type: "file",
                mediaType: asset.mediaType,
                filename: asset.filename,
                url: asset.url,
              }))
            : undefined,
      });
      window.history.replaceState({}, '', `/animate/${activeChatId.current}`);
    }
  }, [initialPrompt, initialAssets, initialAssetUrls, chat, messages.length]);

  // Auto-Save feature
  useEffect(() => {
    if (messages.length > 0) {
      let activeTitle = "New Animation";
      const firstUserMsg = messages.find((message) => message.role === "user");
      const msgText = getMessageText(firstUserMsg);
      
      if (initialPrompt) activeTitle = initialPrompt;
      else if (msgText) activeTitle = msgText.slice(0, 30) + "...";
      else activeTitle = existingChatTitleRef.current;

      saveAnimationChat({
        id: activeChatId.current,
        title: activeTitle,
        createdAt: createdAtRef.current,
        updatedAt: Date.now(),
        messages,
        projectId: stableProjectId.current,
        latestVideoUrl,
        latestPreviewUrl,
        latestSceneId,
        currentVersion,
        versions,
      });
      setHistoryChats(getAllAnimationChats());
    }
  }, [currentVersion, initialPrompt, latestPreviewUrl, latestSceneId, latestVideoUrl, messages, versions]);

  const MAX_FILE_SIZE_MB = 20;

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const oversized = Array.from(files).find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized) {
      alert(`"${oversized.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const newPending: PendingFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedAsset = await uploadFile(file);
        const isImage = file.type.startsWith("image/");
        const previewUrl = isImage ? await readFileAsDataUrl(file) : "";
        newPending.push({
          url: uploadedAsset.url,
          previewUrl,
          filename: uploadedAsset.filename,
          mediaType: uploadedAsset.mediaType,
          size: uploadedAsset.size,
        });
      }
      setPendingFiles((prev) => [...prev, ...newPending]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatTimestamp = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${m}:${sec.toString().padStart(2, "0")}.${ms}`;
  };

  const handleChat = () => {
    if ((!input.trim() && pendingFiles.length === 0) || isProcessing || isUploading) return;

    const baseContent = input.trim() || (pendingFiles.length > 0 ? "Use these files." : "");
    const messageContent = selectedTimestamp !== null
      ? `[At ${formatTimestamp(selectedTimestamp)}] ${baseContent || "Make a change at this timestamp."}`
      : baseContent;
    lastSubmittedPromptRef.current = messageContent || "Use these files.";
    const currentFiles = [...pendingFiles];
    setInput("");
    setSelectedTimestamp(null);

    // Find textarea to reset height
    const textarea = document.getElementById("chat-textarea");
    if (textarea) textarea.style.height = "auto";

    setPendingFiles([]);

    const fileUIParts: FileUIPart[] = currentFiles.map(f => ({
      type: "file" as const,
      mediaType: f.mediaType,
      filename: f.filename,
      url: f.url,
    }));

    const updatedChat = new Chat<UIMessage>({
      messages: messages,
      transport: new DefaultChatTransport({
        api: "/api/agent/chat",
        body: {
          projectId: stableProjectId.current,
          assets: currentFiles.map((file) => file.url),
          sceneContext: {
            brandColors,
            brandName,
            brandFonts,
            brandLogos,
            brandBackdrops,
          },
        },
      }),
    });
    setChat(updatedChat);
    updatedChat.sendMessage({ text: messageContent, files: fileUIParts.length > 0 ? fileUIParts : undefined });

    if (!chatId) {
      window.history.replaceState({}, '', `/animate/${activeChatId.current}`);
    }
  };

  const handleRestoreVersion = useCallback(
    (versionIndex: number) => {
      const updatedChat = restoreChatVersion(activeChatId.current, versionIndex);
      if (updatedChat) {
        syncVersionStateFromChat(updatedChat);
      }
    },
    [syncVersionStateFromChat],
  );

  const previewScene: Scene = {
    id: latestSceneId || "animation",
    name: "Custom Animation",
    category: "feature",
    duration: 150,
    elements: [],
    background: { type: "solid", colors: ["#000"] },
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-foreground shrink-0 shadow-md z-10">
        <div className="flex items-center gap-2 -ml-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            title="Back to Home"
            className="text-background/80 hover:text-background hover:bg-background/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-background hover:bg-background/10">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col bg-card border-r border-border">
              <SheetHeader className="p-4 border-b border-border text-left">
                <SheetTitle className="text-foreground flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Chat History
                </SheetTitle>
              </SheetHeader>
              <div className="p-3 pb-0">
                <Button variant="default" className="w-full gap-2 justify-start font-semibold" onClick={() => navigate("/animate")}>
                  <Plus className="h-4 w-4" />
                  New Animation
                </Button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-1">
                  {historyChats.map((hc) => (
                    <div
                      key={hc.id}
                      className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                        hc.id === activeChatId.current
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                      onClick={() => navigate(`/animate/${hc.id}`)}
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate flex-1 text-left">{hc.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive shrink-0 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnimationChat(hc.id);
                          setHistoryChats(getAllAnimationChats());
                          if (hc.id === activeChatId.current) navigate("/animate");
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {historyChats.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-8">
                      No past chats found.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          
          <span
            className="font-bold text-sm text-background"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {initialPrompt ? initialPrompt.split(" ").slice(0, 5).join(" ") : existingChatTitleRef.current}
          </span>
          {(isProcessing || isRendering) && (
            <span className="flex items-center gap-1.5 text-xs text-primary-foreground bg-primary/80 px-2 py-0.5 rounded-full">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating...
            </span>
          )}
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Pane: V0 Chat Interface */}
        <ResizablePanel defaultSize={35} minSize={25} maxSize={50} className="flex flex-col bg-card">
          <MessageErrorBoundary>
          <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
            <div className="space-y-6 pb-4">
              {messages.map((m) => (
                <div key={m.id}>
                  {m.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] flex flex-col gap-2 items-end">
                        {/* File attachments */}
                        {getMessageParts(m).filter(isFileMessagePart).map((p, fi: number) => {
                          const isImage = (p.mediaType as string)?.startsWith("image/");
                          const isPdf = p.mediaType === "application/pdf";
                          return (
                            <div key={fi} className="flex items-center gap-2 bg-primary/80 text-primary-foreground px-3 py-2 rounded-xl rounded-tr-sm text-xs shadow-sm max-w-full">
                              {isImage ? (
                                <img src={p.url} alt={p.filename || "image"} className="h-20 w-20 object-cover rounded-lg" />
                              ) : isPdf ? (
                                <>
                                  <FileText className="h-4 w-4 shrink-0 text-red-300" />
                                  <span className="truncate font-medium">{p.filename || "document.pdf"}</span>
                                  <span className="shrink-0 opacity-70">PDF</span>
                                </>
                              ) : (
                                <>
                                  <File className="h-4 w-4 shrink-0 opacity-70" />
                                  <span className="truncate font-medium">{p.filename || "file"}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                        {/* Text bubble */}
                        {(() => {
                          const text = getMessageText(m);
                          return text ? (
                            <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-[1.25rem] rounded-tr-sm text-sm shadow-sm leading-relaxed whitespace-pre-wrap">
                              {text}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      {getMessageParts(m).map((part, i: number) => {
                        try {
                          if (isTextMessagePart(part)) {
                            const cleanText = part.text.trim();
                            if (!cleanText) return null;
                            return (
                              <div key={i} className="pl-1 border-l-2 border-primary/20 p-3 rounded-lg bg-muted/20">
                                <MarkdownMessage text={cleanText} />
                              </div>
                            );
                          }
                          if (isToolUIPart(part)) {
                            const toolName = getToolName(part);
                            const step = toolCallToAgentStep(
                              toolName,
                              (part.state === "input-available" || part.state === "output-available") ? part.input as Record<string, unknown> : {},
                              i,
                              part.state === "output-available" ? part.output : undefined
                            );
                            if ((toolName === "triggerPreview" || toolName === "renderScene") && part.state === "output-available") {
                                return null;
                            }
                            return (
                              <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                <AgentStepItem step={step} isActive={part.state !== "output-available"} />
                              </motion.div>
                            );
                          }
                          return null;
                        } catch (partError) {
                          console.error("Failed to render assistant message part", partError, part);
                          return null;
                        }
                      })}
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                <div className="flex items-center gap-2 py-2 pl-1 text-muted-foreground">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                  <span className="text-xs">Thinking...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 text-destructive bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{error.message || "An error occurred."}</span>
                </div>
              )}
            </div>
          </ScrollArea>
          </MessageErrorBoundary>

          {/* Chat Input */}
          <div className="border-t border-border p-3 bg-background shrink-0">
            {/* Timestamp context badge */}
            {selectedTimestamp !== null && (
              <div className="flex items-center gap-1.5 text-[11px] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-md mb-2">
                <Clock className="h-3 w-3 text-emerald-500 shrink-0" />
                <span className="text-emerald-400 font-mono font-medium">At {formatTimestamp(selectedTimestamp)}</span>
                <button
                  onClick={() => setSelectedTimestamp(null)}
                  className="ml-auto flex items-center justify-center w-4 h-4 rounded-full bg-foreground/15 hover:bg-foreground/30 text-foreground transition-colors"
                  title="Clear timestamp"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-3">
                {pendingFiles.map((f, i) => {
                  const isImage = f.mediaType.startsWith("image/");
                  const isPdf = f.mediaType === "application/pdf";
                  return (
                    <div key={i} className="relative group flex items-center gap-2 rounded-lg border border-border bg-muted px-2 py-1.5 pr-7 max-w-[160px]">
                      {isImage ? (
                        <>
                          <img src={f.previewUrl} alt={f.filename} className="h-8 w-8 object-cover rounded shrink-0" />
                          <span className="text-[10px] text-muted-foreground truncate">{f.filename}</span>
                        </>
                      ) : isPdf ? (
                        <>
                          <FileText className="h-5 w-5 text-red-400 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-medium text-foreground truncate">{f.filename}</span>
                            <span className="text-[9px] text-muted-foreground">PDF</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <File className="h-5 w-5 text-muted-foreground shrink-0" />
                          <span className="text-[10px] text-muted-foreground truncate">{f.filename}</span>
                        </>
                      )}
                      <button
                        onClick={() => removePendingFile(i)}
                        className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-foreground/20 hover:bg-foreground/40 text-foreground transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-2 relative">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*,application/pdf,.pdf" />
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-muted-foreground bg-muted hover:bg-muted hover:text-muted-foreground self-end border border-border/50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isUploading}
                title="Attach assets"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              </Button>
              <Textarea
                id="chat-textarea"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleChat();
                  }
                }}
                rows={1}
                placeholder="Ask for an animation or refinement..."
                className="min-h-[40px] max-h-[160px] py-2.5 pr-12 text-sm bg-card border-muted-foreground/20 focus-visible:ring-1 resize-none scrollbar-hide"
                disabled={isProcessing}
              />
              <Button
                size="icon"
                className="absolute right-1 bottom-1 h-8 w-8 shrink-0 bg-primary hover:bg-primary/90 rounded-sm"
                onClick={handleChat}
                disabled={isProcessing || isUploading || (!input.trim() && pendingFiles.length === 0)}
              >
                {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 ml-0.5" />}
              </Button>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Pane: Video + Controls */}
        <ResizablePanel defaultSize={65}>
          <ResizablePanelGroup direction="vertical">
            {/* Video preview */}
            <ResizablePanel defaultSize={70} className="relative bg-black/5">
              <div className="h-full w-full flex flex-col">
                {/* Version Switcher */}
                {versions.length > 1 && (
                  <div className="flex items-center justify-center pt-3 shrink-0">
                    <SceneVersionHistory
                      versions={versions}
                      currentVersion={currentVersion}
                      onRestore={handleRestoreVersion}
                      disabled={isProcessing || isRendering}
                    />
                  </div>
                )}

                {latestPreviewUrl || latestVideoUrl ? (
                  <div className="flex-1 min-h-0 p-4 pb-0">
                    <div className="h-full w-full rounded-xl overflow-hidden border border-border/30 bg-black shadow-2xl">
                      <MainPreview
                        scene={previewScene}
                        isGenerating={isProcessing && !isRendering}
                        isQueued={false}
                        isComplete={!isProcessing && !isRendering}
                        isAllScenes={false}
                        allScenesGenerating={false}
                        previewUrl={latestPreviewUrl || undefined}
                        previewSceneId={latestSceneId || undefined}
                        videoUrl={latestVideoUrl || undefined}
                        refinementPreviewReady={refinementPreviewReady}
                        isRefining={(isProcessing || isRendering) && !!latestVideoUrl}
                        generatingMessage={
                          isRendering ? "Rendering video..." :
                          isProcessing ? "AI is refining the animation..." : undefined
                        }
                        videoRef={videoRef}
                        isPlaying={isPlaying}
                        onTogglePlay={() => setIsPlaying((playing) => !playing)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                      <Play className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium">Video preview will appear here</p>
                  </div>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Controls panel */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
              <AnimationControls
                duration={videoDuration}
                currentTime={videoCurrentTime}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((p) => !p)}
                onSeek={(t) => {
                  if (videoRef.current) videoRef.current.currentTime = t;
                  setVideoCurrentTime(t);
                }}
                onScrub={(t) => {
                  if (videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.currentTime = t;
                  }
                  setVideoCurrentTime(t);
                }}
                selectedTimestamp={selectedTimestamp}
                onTimestampSelect={setSelectedTimestamp}
                videoUrl={latestVideoUrl}
                speed={speed}
                onSpeedChange={(s) => {
                  setSpeed(s);
                  if (videoRef.current) videoRef.current.playbackRate = s;
                }}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default function AnimationEditorPage() {
  const { chatId } = useParams<{ chatId: string }>();
  // Use key trick to force unmount/remount on navigation between different chats
  return <AnimationEditorPageInner key={chatId || "new"} />;
}
