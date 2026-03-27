import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useChat, Chat } from "@ai-sdk/react";
import { isToolUIPart, getToolName, DefaultChatTransport, UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Send, Paperclip, AlertCircle, Play, X, Menu, Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { uploadFile } from "@/lib/upload";
import MainPreview from "@/components/editor/MainPreview";
import AgentStepItem from "@/components/editor/AgentStepItem";
import { AgentStep } from "@/lib/agentTypes";
import { getAllAnimationChats, getAnimationChat, saveAnimationChat, deleteAnimationChat, StoredAnimationChat, getRelativeTime } from "@/lib/storage";

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
  const [isRendering, setIsRendering] = useState(false);
  const [historyChats, setHistoryChats] = useState<StoredAnimationChat[]>([]);
  
  const hasStartedRef = useRef(false);
  const activeChatId = useRef(chatId || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()));
  const renderPollIntervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const chatScrollRef = useRef<HTMLDivElement>(null);

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
            setLatestVideoUrl(result.videoUrl);
          }
        }
      }
    }
  }, [messages, startRenderPolling, latestVideoUrl, latestPreviewUrl]);

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
      });
      setHistoryChats(getAllAnimationChats());
    }
  }, [messages, latestVideoUrl, latestPreviewUrl, latestSceneId]);

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

  const handleChat = () => {
    if ((!input.trim() && assets.length === 0) || isProcessing || isUploading) return;
    
    const messageContent = input.trim() || (assets.length > 0 ? "Use these assets." : "");
    const currentAssets = [...assets];
    setInput("");
    
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
                            <div key={i} className="text-sm prose prose-invert max-w-none text-foreground leading-relaxed pl-1 border-l-2 border-primary/20 p-3 rounded-lg">
                              {cleanText}
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

        {/* Right Pane: Video Player */}
        <ResizablePanel defaultSize={65} className="bg-black/5 relative">
          <div className="h-full w-full p-4 md:p-8 flex items-center justify-center">
            {latestPreviewUrl || latestVideoUrl ? (
              <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-black flex flex-col">
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
                  videoRef={{ current: null } as React.RefObject<HTMLVideoElement>}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium">Video preview will appear here</p>
              </div>
            )}
          </div>
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
