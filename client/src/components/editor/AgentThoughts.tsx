import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2, Send, Clock, AlertCircle, Paperclip, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentStep } from "@/lib/agentTypes";
import { useAgent } from "@/hooks/useAgent";
import { useState, Fragment, useEffect, useRef } from "react";
import AgentStepItem from "./AgentStepItem";
import { uploadFile } from "@/lib/upload";

interface AgentThoughtsProps {
  steps: AgentStep[];
  isGenerating: boolean;
  isComplete: boolean;
  selectedScene: number | "all";
  allDone?: boolean;
  selectedTimestamp?: number | null;
  onClearTimestamp?: () => void;
  sceneContext?: Record<string, unknown>;
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

// ─── Refinement chat — only mounts after all scenes finish ────────────────────

interface RefinementChatProps {
  selectedScene: number | "all";
  sceneContext?: Record<string, unknown>;
  selectedTimestamp?: number | null;
  onClearTimestamp?: () => void;
}

const RefinementChat = ({
  selectedScene,
  sceneContext,
  selectedTimestamp,
  onClearTimestamp,
}: RefinementChatProps) => {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const [assets, setAssets] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    steps: agentSteps,
    isProcessing,
    sendMessage,
    error,
  } = useAgent({
    sceneId: selectedScene,
    sceneContext,
  });

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

    setChatMessages((prev) => [
      ...prev,
      { id: newId, role: "user", text: message },
    ]);
    
    // Store current assets to send, then clear input
    const currentAssets = [...assets];
    setChatInput("");
    setAssets([]);

    sendMessage(message, { assets: currentAssets });
  };

  return (
    <>
      {/* Chat messages */}
      {chatMessages.length > 0 && (
        <div className="mt-4 space-y-2">
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end mb-3"
            >
              <div className="text-[11px] p-2.5 rounded-xl rounded-br-sm bg-foreground text-background max-w-[85%]">
                {msg.text}
              </div>
            </motion.div>
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

      {/* Chat input */}
      <div className="border-t border-border p-3 shrink-0 bg-background z-10 sticky bottom-0">
        {selectedTimestamp !== null && (
          <div className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
            <Clock className="h-3 w-3" />
            <span>Refinement at {formatTime(selectedTimestamp)}</span>
            {onClearTimestamp && (
              <button
                onClick={onClearTimestamp}
                className="ml-auto hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        {assets.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {assets.map((asset, i) => (
              <div key={i} className="relative group rounded-md border overflow-hidden bg-muted h-10 w-10 flex items-center justify-center">
                {asset.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                  <img src={asset} alt="upload" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[8px] text-muted-foreground break-all p-1 text-center leading-tight">
                    {asset.split('/').pop()?.slice(-6)}
                  </div>
                )}
                <button
                  onClick={() => removeAsset(i)}
                  className="absolute top-0 right-0 bg-black/50 text-white rounded-bl-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1.5">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 shrink-0 text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || isUploading}
            title="Upload assets"
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
          </Button>
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChat()}
            placeholder={
              selectedScene === "all"
                ? "Ask about all scenes..."
                : selectedTimestamp !== null
                  ? `Describe changes at ${formatTime(selectedTimestamp)}...`
                  : "Ask for edits..."
            }
            className="h-8 text-xs"
            disabled={isProcessing}
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0 bg-primary hover:bg-primary/90"
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
    </>
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
}: AgentThoughtsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new steps arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [steps]);

  // When generating, the last step is always the "active" one
  const activeStepIndex = isGenerating ? steps.length - 1 : -1;

  const showRefinement = allDone && (isComplete || selectedScene === "all");

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2 shrink-0">
        <Brain className="h-4 w-4 text-muted-foreground" />
        <span
          className="text-xs font-bold text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          AI Agent
        </span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {selectedScene === "all"
            ? "All Scenes"
            : `Scene ${(selectedScene as number) + 1}`}
        </span>
      </div>

      {/* Agent log */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="relative">
          {/* Vertical timeline line */}
          {steps.length > 0 && (
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-border" />
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

          {/* Lazy-mount refinement chat — only after all scenes finish */}
          {showRefinement && (
            <RefinementChat
              selectedScene={selectedScene}
              sceneContext={sceneContext}
              selectedTimestamp={selectedTimestamp}
              onClearTimestamp={onClearTimestamp}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AgentThoughts;
