"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

type StepStatus = "pending" | "active" | "complete";

interface ChainOfThoughtContextValue {
  activeStep?: number;
}

const ChainOfThoughtContext = React.createContext<ChainOfThoughtContextValue>({});

interface ChainOfThoughtProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep?: number;
}

const ChainOfThought = React.forwardRef<HTMLDivElement, ChainOfThoughtProps>(
  ({ className, children, activeStep, ...props }, ref) => {
    return (
      <ChainOfThoughtContext.Provider value={{ activeStep }}>
        <div
          ref={ref}
          className={cn("relative pl-4", className)}
          {...props}
        >
          {/* Vertical connecting line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-0">{children}</div>
        </div>
      </ChainOfThoughtContext.Provider>
    );
  }
);
ChainOfThought.displayName = "ChainOfThought";

interface ChainOfThoughtHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChainOfThoughtHeader = React.forwardRef<HTMLDivElement, ChainOfThoughtHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2 mb-3", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ChainOfThoughtHeader.displayName = "ChainOfThoughtHeader";

interface ChainOfThoughtContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChainOfThoughtContent = React.forwardRef<HTMLDivElement, ChainOfThoughtContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-0", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ChainOfThoughtContent.displayName = "ChainOfThoughtContent";

interface ChainOfThoughtStepProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: StepStatus;
  icon?: React.ReactNode;
  label: string;
  description?: string;
  badge?: React.ReactNode;
}

const ChainOfThoughtStep = React.forwardRef<HTMLDivElement, ChainOfThoughtStepProps>(
  ({ className, status = "pending", icon, label, description, badge, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex items-start gap-3 py-2", className)}
        {...props}
      >
        {/* Status indicator dot */}
        <div
          className={cn(
            "relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 bg-background -ml-[15px]",
            status === "complete" && "border-accent bg-accent",
            status === "active" && "border-primary",
            status === "pending" && "border-muted-foreground/30"
          )}
        >
          {status === "complete" && (
            <Check className="h-2.5 w-2.5 text-accent-foreground" />
          )}
          {status === "active" && (
            <Loader2 className="h-2.5 w-2.5 text-primary animate-spin" />
          )}
        </div>

        <div className="flex-1 min-w-0 -mt-0.5">
          <div className="flex items-center gap-2">
            {icon && (
              <span
                className={cn(
                  "shrink-0",
                  status === "complete" && "text-accent",
                  status === "active" && "text-primary",
                  status === "pending" && "text-muted-foreground"
                )}
              >
                {icon}
              </span>
            )}
            <span
              className={cn(
                "text-xs font-medium truncate",
                status === "complete" && "text-foreground",
                status === "active" && "text-foreground",
                status === "pending" && "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed pl-5">
              {description}
            </p>
          )}
          {children && <div className="mt-2 pl-5">{children}</div>}
        </div>
      </div>
    );
  }
);
ChainOfThoughtStep.displayName = "ChainOfThoughtStep";

interface ChainOfThoughtSearchResultsProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChainOfThoughtSearchResults = React.forwardRef<HTMLDivElement, ChainOfThoughtSearchResultsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-wrap gap-1.5 mt-2 pl-5", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ChainOfThoughtSearchResults.displayName = "ChainOfThoughtSearchResults";

interface ChainOfThoughtSearchResultProps extends React.HTMLAttributes<HTMLSpanElement> {
  href?: string;
}

const ChainOfThoughtSearchResult = React.forwardRef<HTMLSpanElement, ChainOfThoughtSearchResultProps>(
  ({ className, children, href, ...props }, ref) => {
    const content = (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-secondary text-secondary-foreground",
          href && "hover:bg-secondary/80 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );

    if (href) {
      return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
    }

    return content;
  }
);
ChainOfThoughtSearchResult.displayName = "ChainOfThoughtSearchResult";

// Duration badge component
interface DurationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  duration: number;
}

const DurationBadge = React.forwardRef<HTMLSpanElement, DurationBadgeProps>(
  ({ className, duration, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground",
          className
        )}
        {...props}
      >
        {duration}s
      </span>
    );
  }
);
DurationBadge.displayName = "DurationBadge";

// File count badge component
interface FileCountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
}

const FileCountBadge = React.forwardRef<HTMLSpanElement, FileCountBadgeProps>(
  ({ className, count, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center text-[10px] text-muted-foreground",
          className
        )}
        {...props}
      >
        <span className="mx-1">•</span>
        {count} {count === 1 ? "File" : "Files"}
      </span>
    );
  }
);
FileCountBadge.displayName = "FileCountBadge";

export {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  DurationBadge,
  FileCountBadge,
};
