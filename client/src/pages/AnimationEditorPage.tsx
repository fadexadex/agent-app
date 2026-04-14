import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useChat, Chat } from "@ai-sdk/react";
import { isToolUIPart, getToolName, DefaultChatTransport, UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Send, Paperclip, AlertCircle, Play, X, Menu, Plus, MessageSquare, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { uploadFile } from "@/lib/upload";
import MainPreview from "@/components/editor/MainPreview";
import AnimationControls from "@/components/editor/AnimationControls";
import AgentStepItem from "@/components/editor/AgentStepItem";
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
    const bullet = line.match(/^[\*\-]\s+(.+)/);
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
  const state = location.state as Record<string, unknown> | undefined;
  const initialPrompt = (state?.prompt as string) || "";
  const initialAssets = (state?.assets as string[]) || [];
  const [assets, setAssets] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [latestVideoUrl, setLatestVideoUrl] = useState<string | null>(existingChat?.latestVideoUrl || null);
  const [latestPreviewUrl, setLatestPreviewUrl] = useState<string | null>(existingChat?.latestPreviewUrl || null);
  const [latestSceneId, setLatestSceneId] = useState<string | null>(existingChat?.latestSceneId || null);
  const [currentVersion, setCurrentVersion] = useState(existingChat?.currentVersion || (existingChat?.versions?.length || 0));
  const [versions, setVersions] = useState<SceneVersion[]>(existingChat?.versions || []);
  const [isRendering, setIsRendering] = useState(false);
  const [historyChats, setHistoryChats] = useState<StoredAnimationChat[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);

  const hasStartedRef = useRef(false);
  const activeChatId = useRef(chatId || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()));
  const renderPollIntervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHistoryChats(getAllAnimationChats());
  }, []);

  const [chat, setChat] = useState(() => new Chat<UIMessage>({
    messages: existingChat?.messages || [],
    transport: new DefaultChatTransport({
      api: "/api/agent/chat",
      body: { assets: initialAssets },
    }),
  }));

  const { messages, status, error } = useChat({ chat });

  const isProcessing = status === "streaming" || status === "submitted";

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // Clean polling intervals
  useEffect(() => {
    return () => {
      renderPollIntervalsRef.current.forEach(clearInterval);
      renderPollIntervalsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (latestPreviewUrl || latestVideoUrl) {
      setIsPlaying(true);
      // Reset playback state for new content
      setVideoCurrentTime(0);
      setVideoDuration(0);
    }
  }, [latestPreviewUrl, latestVideoUrl]);

  // RAF loop — sync currentTime from native video element
  useEffect(() => {
    let rafId: number;
    const loop = () => {
      const vid = videoRef.current;
      if (vid) {
        setVideoCurrentTime(vid.currentTime);
        if (vid.duration && isFinite(vid.duration) && vid.duration !== videoDuration) {
          setVideoDuration(vid.duration);
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [videoDuration]);

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

  const startRenderPolling = useCallback((renderSceneId: string, videoUrl: string) => {
    setIsRendering(true);
    const existing = renderPollIntervalsRef.current.get(renderSceneId);
    if (existing) clearInterval(existing);

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/agent/render-status/${renderSceneId}`);
        const data = (await response.json()) as { status: string };

        if (data.status === "complete") {
          setLatestVideoUrl(videoUrl);
          setIsRendering(false);
          clearInterval(pollInterval);
          renderPollIntervalsRef.current.delete(renderSceneId);
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 2000);

    renderPollIntervalsRef.current.set(renderSceneId, pollInterval);
  }, []);

  // Parse messages to extract tool outputs (like video/preview URLs)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant" || !lastMessage.parts) return;
    
    for (const part of lastMessage.parts) {
      if (isToolUIPart(part) && part.state === "output-available" && part.output) {
        const toolName = getToolName(part);
        
        if (toolName === "triggerPreview") {
          const result = part.output as { previewUrl?: string; sceneId?: string };
          if (result.previewUrl && result.previewUrl !== latestPreviewUrl) {
            setLatestPreviewUrl(result.previewUrl);
          }
          if (result.sceneId && result.sceneId !== latestSceneId) {
            setLatestSceneId(result.sceneId);
          }
        }
        
        if (toolName === "renderScene") {
          const result = part.output as { success?: boolean; status?: string; sceneId?: string; videoUrl?: string };
          if (result.success && result.status === "rendering" && result.sceneId) {
            if (!renderPollIntervalsRef.current.has(result.sceneId)) {
              startRenderPolling(result.sceneId, result.videoUrl || "");
            }
            if (result.sceneId && result.sceneId !== latestSceneId) {
              setLatestSceneId(result.sceneId);
            }
          } else if (result.success && result.videoUrl && result.videoUrl !== latestVideoUrl) {
            // New version detected!
            const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
            let versionPrompt = "";
            if (lastUserMsg) {
              versionPrompt = (lastUserMsg as any).text || (lastUserMsg.parts ? (lastUserMsg.parts as any[]).find((p: any) => p.type === 'text')?.text : "");
            }

            addChatVersion(activeChatId.current, {
              videoUrl: result.videoUrl,
              previewUrl: latestPreviewUrl || undefined,
              prompt: versionPrompt || "Refinement"
            });
            const updated = getAnimationChat(activeChatId.current);
            if (updated) {
              setVersions(updated.versions || []);
              setCurrentVersion(updated.currentVersion || 0);
            }
            setLatestVideoUrl(result.videoUrl);
          }
        }
      }
    }
  }, [messages, startRenderPolling, latestVideoUrl, latestPreviewUrl, input]);

  // Initial trigger for new chats
  useEffect(() => {
    if (!hasStartedRef.current && initialPrompt && messages.length === 0) {
      hasStartedRef.current = true;
      chat.sendMessage({ text: initialPrompt });
      window.history.replaceState({}, '', `/animate/${activeChatId.current}`);
    }
  }, [initialPrompt, initialAssets, chat, messages.length]);

  // Auto-Save feature
  useEffect(() => {
    if (messages.length > 0) {
      let activeTitle = "New Animation";
      const firstUserMsg = messages.find((m: any) => m.role === 'user') as any;
      let msgText = "";
      if (firstUserMsg) {
        msgText = firstUserMsg.text || (firstUserMsg.parts ? (firstUserMsg.parts as any[]).find((p: any) => p.type === 'text')?.text : "");
      }
      
      if (initialPrompt) activeTitle = initialPrompt;
      else if (msgText) activeTitle = msgText.slice(0, 30) + "...";
      else if (existingChat) activeTitle = existingChat.title;

        saveAnimationChat({
          id: activeChatId.current,
          title: activeTitle,
          createdAt: existingChat ? existingChat.createdAt : Date.now(),
          updatedAt: Date.now(),
          messages,
          latestVideoUrl,
          latestPreviewUrl,
          latestSceneId,
          currentVersion,
          versions,
        });
        setHistoryChats(getAllAnimationChats());
      }
    }, [messages, latestVideoUrl, latestPreviewUrl, latestSceneId, currentVersion, versions]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newAssets = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        newAssets.push(url);
      }
      setAssets((prev) => [...prev, ...newAssets]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAsset = (index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const formatTimestamp = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${m}:${sec.toString().padStart(2, "0")}.${ms}`;
  };

  const handleChat = () => {
    if ((!input.trim() && assets.length === 0) || isProcessing || isUploading) return;

    const baseContent = input.trim() || (assets.length > 0 ? "Use these assets." : "");
    const messageContent = selectedTimestamp !== null
      ? `[At ${formatTimestamp(selectedTimestamp)}] ${baseContent || "Make a change at this timestamp."}`
      : baseContent;
    const currentAssets = [...assets];
    setInput("");
    setSelectedTimestamp(null);
    
    // Find textarea to reset height
    const textarea = document.getElementById("chat-textarea");
    if (textarea) textarea.style.height = "auto";
    
    setAssets([]);
    
    const updatedChat = new Chat<UIMessage>({
      messages: messages,
      transport: new DefaultChatTransport({
        api: "/api/agent/chat",
        body: { assets: currentAssets },
      }),
    });
    setChat(updatedChat);
    updatedChat.sendMessage({ text: messageContent });
    
    if (!chatId) {
      window.history.replaceState({}, '', `/animate/${activeChatId.current}`);
    }
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
            {initialPrompt ? initialPrompt.split(" ").slice(0, 5).join(" ") : existingChat ? existingChat.title : "Studio"}
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
          <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
            <div className="space-y-6 pb-4">
              {messages.map((m: any) => (
                <div key={m.id}>
                  {m.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-[1.25rem] rounded-tr-sm max-w-[85%] text-sm shadow-sm leading-relaxed whitespace-pre-wrap">
                        {m.content || (m.parts ? m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('') : "")}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      {m.parts?.map((part: any, i: number) => {
                        if (part.type === "text") {
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
                          // Dont show trigger preview or render scene tools if they are instant
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
            {assets.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-3">
                {assets.map((asset, i) => (
                  <div key={i} className="relative group rounded-md border overflow-hidden bg-muted h-12 w-12 flex items-center justify-center">
                    {asset.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                      <img src={asset} alt="upload" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[9px] text-muted-foreground break-all p-1 text-center leading-tight">
                        {asset.split("/").pop()?.slice(-8)}
                      </div>
                    )}
                    <button
                      onClick={() => removeAsset(i)}
                      className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 relative">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 text-muted-foreground bg-muted hover:bg-muted/80 self-end"
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
                disabled={isProcessing || isUploading || (!input.trim() && assets.length === 0)}
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
                    <div className="flex items-center gap-3 bg-card/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-border shadow-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={currentVersion <= 1}
                        onClick={() => {
                          const newIdx = currentVersion - 2;
                          restoreChatVersion(activeChatId.current, newIdx);
                          setCurrentVersion(currentVersion - 1);
                          const v = versions[newIdx];
                          setLatestVideoUrl(v.videoUrl);
                          if (v.previewUrl) setLatestPreviewUrl(v.previewUrl);
                        }}
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Button>
                      <div className="text-[11px] font-bold tracking-tight uppercase text-muted-foreground select-none">
                        Version <span className="text-foreground">{currentVersion}</span> / {versions.length}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={currentVersion >= versions.length}
                        onClick={() => {
                          const newIdx = currentVersion;
                          restoreChatVersion(activeChatId.current, newIdx);
                          setCurrentVersion(currentVersion + 1);
                          const v = versions[newIdx];
                          setLatestVideoUrl(v.videoUrl);
                          if (v.previewUrl) setLatestPreviewUrl(v.previewUrl);
                        }}
                      >
                        <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                      </Button>
                    </div>
                  </div>
                )}

                {latestPreviewUrl || latestVideoUrl ? (
                  <div className="flex-1 min-h-0 p-4 pb-0">
                    <div className="h-full w-full rounded-xl overflow-hidden border border-border/30 bg-black shadow-2xl">
                      <MainPreview
                        scene={{ id: latestSceneId || "animation", name: "Custom Animation", category: "Generated Scene", duration: 150, elements: [], background: { type: "solid", colors: ["#000"] } } as any}
                        isGenerating={isProcessing && !isRendering}
                        isQueued={false}
                        isComplete={!isProcessing && !isRendering}
                        isAllScenes={false}
                        allScenesGenerating={false}
                        previewUrl={latestPreviewUrl || undefined}
                        previewSceneId={latestSceneId || undefined}
                        videoUrl={latestVideoUrl || undefined}
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
