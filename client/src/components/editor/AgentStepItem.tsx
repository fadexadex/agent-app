import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Search, LayoutGrid, FileEdit, Check, ChevronRight, Play, Video, Image as ImageIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { AgentStep } from "@/lib/agentTypes";
import { cn } from "@/lib/utils";

interface AgentStepItemProps {
  step: AgentStep;
  isActive: boolean;
}

const getStepIcon = (type: AgentStep["type"]) => {
  switch (type) {
    case "thinking":
      return Brain;
    case "explore":
      return Search;
    case "generate":
      return LayoutGrid;
    case "update":
      return FileEdit;
    case "preview":
      return Play;
    case "render":
      return Video;
    case "image":
      return ImageIcon;
    case "complete":
      return Check;
    default:
      return Play;
  }
};

const getFriendlyLabel = (step: AgentStep): string => {
  const map: Record<string, string> = {
    thinking: step.status === "complete" ? "Planned approach" : "Planning...",
    explore: "Reviewing examples...",
    generate: "Creating design...",
    update: "Building scene...",
    preview: "Setting up preview...",
    render: step.status === "complete" ? "Video ready!" : "Creating video...",
    image: step.status === "complete" ? "Image generated" : "Generating image...",
  };
  return map[step.type] || step.label;
};

const getCompletedLabel = (step: AgentStep): string => {
  if (step.type === "thinking" && step.duration) {
    return `Planned for ${step.duration}s`;
  }
  return getFriendlyLabel(step);
};

const AgentStepItem = ({ step, isActive }: AgentStepItemProps) => {
  const [isOpen, setIsOpen] = useState(isActive);
  const [wasActive, setWasActive] = useState(false);
  const Icon = getStepIcon(step.type);

  // Auto-expand when active, auto-collapse when no longer active
  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
      setWasActive(true);
    } else if (wasActive) {
      const timer = setTimeout(() => setIsOpen(false), 500); // 500ms delay
      return () => clearTimeout(timer);
    }
  }, [isActive, wasActive]);

  const hasContent = step.streamingContent?.length || step.detail || step.files?.length || step.previewUrl || step.imageUrl || step.type === "image";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex items-center gap-2.5 w-full text-left py-1.5 pl-0 pr-2 rounded-md hover:bg-muted/30 transition-colors group",
            !hasContent && "cursor-default"
          )}
        >
          {/* Status dot */}
          <div className={cn(
            "relative z-10 flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 bg-background transition-colors",
            step.status === "complete" && "border-primary bg-primary",
            step.status === "active" && "border-primary",
            step.status === "pending" && "border-muted-foreground/30",
          )}>
            {step.status === "complete" && (
              <Check className="h-2 w-2 text-primary-foreground" />
            )}
            {step.status === "active" && isActive && (
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>

          {/* Label with optional shimmer */}
          <div className="flex-1 min-w-0">
            {isActive && step.status !== "complete" ? (
              <TextShimmer className="text-[11px]" duration={2} spread={30}>
                {getFriendlyLabel(step)}
              </TextShimmer>
            ) : (
              <span className={cn(
                "text-[11px]",
                step.status === "complete" ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.status === "complete" ? getCompletedLabel(step) : getFriendlyLabel(step)}
              </span>
            )}
          </div>

          {/* Duration badge for completed steps */}
          {step.status === "complete" && step.duration && step.type !== "thinking" && (
            <span className="text-[10px] text-muted-foreground/70 tabular-nums">
              {step.duration}s
            </span>
          )}

          {/* File count badge */}
          {step.fileCount && step.status === "complete" && (
            <span className="text-[10px] text-muted-foreground/70">
              {step.fileCount} files
            </span>
          )}

          {/* Expand indicator */}
          {hasContent && (
            <ChevronRight
              className={cn(
                "h-3 w-3 text-muted-foreground/50 transition-transform",
                isOpen && "rotate-90"
              )}
            />
          )}
        </motion.button>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <AnimatePresence>
          {isOpen && hasContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pl-8 pr-2 pb-2"
            >
              {/* Streaming content (numbered list) */}
              {step.streamingContent && (
                <div className="space-y-1">
                  {step.streamingContent.filter(Boolean).map((line, idx) => (
                    <p key={idx} className="text-[11px] text-muted-foreground leading-relaxed">
                      <span className="text-muted-foreground/60 mr-1.5">{idx + 1}.</span>
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {/* Detail text */}
              {step.detail && !step.streamingContent && (
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {step.detail}
                </p>
              )}

              {/* File list */}
              {step.files && step.files.length > 0 && (
                <div className="mt-1.5 space-y-0.5">
                  {step.files.map((file) => (
                    <p key={file} className="text-[10px] text-muted-foreground/70 font-mono truncate">
                      {file}
                    </p>
                  ))}
                </div>
              )}

              {/* Preview URL */}
              {step.previewUrl && (
                <div className="mt-1.5">
                  <a
                    href={step.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary hover:underline font-mono truncate block"
                  >
                    {step.previewUrl}
                  </a>
                </div>
              )}

              {/* Image preview */}
              {step.imageUrl && (
                <div className="mt-2">
                  <img
                    src={step.imageUrl}
                    alt={step.imagePrompt || "Generated image"}
                    className="rounded-md max-w-full h-auto max-h-32 object-contain"
                  />
                  {step.imagePrompt && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1 italic truncate">
                      "{step.imagePrompt}"
                    </p>
                  )}
                </div>
              )}
              
              {/* Loading animation for image generation */}
              {step.type === "image" && step.status === "active" && (
                <div className="mt-2 w-full h-24 rounded-md bg-muted animate-pulse flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Generating image...</span>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AgentStepItem;
