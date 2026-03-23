import * as React from "react";
import { cn } from "@/lib/utils";

interface ShimmerProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  duration?: number;
  spread?: number;
}

export const Shimmer = React.forwardRef<HTMLSpanElement, ShimmerProps>(
  ({ children, className, duration = 2, spread = 25, ...props }, ref) => {
    const dynamicSpread = Math.min(Math.max(spread, 5), 45);

    return (
      <span
        ref={ref}
        className={cn(
          "inline-block bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer",
          className
        )}
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--muted-foreground)) ${50 - dynamicSpread}%, hsl(var(--foreground)) 50%, hsl(var(--muted-foreground)) ${50 + dynamicSpread}%)`,
          animationDuration: `${duration}s`,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Shimmer.displayName = "Shimmer";
