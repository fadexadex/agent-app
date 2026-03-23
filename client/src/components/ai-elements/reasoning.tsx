"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReasoningContextValue {
  isOpen: boolean;
  duration?: number;
  isStreaming?: boolean;
}

const ReasoningContext = React.createContext<ReasoningContextValue>({
  isOpen: false,
});

interface ReasoningProps extends CollapsiblePrimitive.CollapsibleProps {
  duration?: number;
  isStreaming?: boolean;
  defaultOpen?: boolean;
}

const Reasoning = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  ReasoningProps
>(({ children, duration, isStreaming, defaultOpen = false, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen || isStreaming);

  // Auto-open when streaming starts
  React.useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    }
  }, [isStreaming]);

  return (
    <ReasoningContext.Provider value={{ isOpen: isOpen ?? false, duration, isStreaming }}>
      <CollapsiblePrimitive.Root
        ref={ref}
        open={isOpen}
        onOpenChange={setIsOpen}
        {...props}
      >
        {children}
      </CollapsiblePrimitive.Root>
    </ReasoningContext.Provider>
  );
});
Reasoning.displayName = "Reasoning";

interface ReasoningTriggerProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> {
  showDuration?: boolean;
}

const ReasoningTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  ReasoningTriggerProps
>(({ className, children, showDuration = true, ...props }, ref) => {
  const { isOpen, duration, isStreaming } = React.useContext(ReasoningContext);

  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group",
        className
      )}
      {...props}
    >
      <ChevronRight
        className={cn(
          "h-3 w-3 transition-transform duration-200",
          isOpen && "rotate-90"
        )}
      />
      {children || (
        <span className="font-medium">
          {isStreaming ? (
            <span className="inline-flex items-center gap-1">
              <span className="animate-pulse">Thinking</span>
              <span className="flex gap-0.5">
                <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                <span className="animate-bounce">.</span>
              </span>
            </span>
          ) : duration ? (
            `Thought for ${duration}s`
          ) : (
            "Reasoning"
          )}
        </span>
      )}
    </CollapsiblePrimitive.Trigger>
  );
});
ReasoningTrigger.displayName = "ReasoningTrigger";

const ReasoningContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <CollapsiblePrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className
      )}
      {...props}
    >
      <div className="pt-2">{children}</div>
    </CollapsiblePrimitive.Content>
  );
});
ReasoningContent.displayName = "ReasoningContent";

export { Reasoning, ReasoningTrigger, ReasoningContent };
