import { useState } from "react";
import { Clock, RotateCcw, ChevronDown, Check, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SceneVersion, getRelativeTime } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface SceneVersionHistoryProps {
  versions: SceneVersion[];
  currentVersion: number;
  onRestore: (versionIndex: number) => void;
  disabled?: boolean;
}

const SceneVersionHistory = ({
  versions,
  currentVersion,
  onRestore,
  disabled = false,
}: SceneVersionHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (versions.length <= 1) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all select-none",
            "bg-muted/60 border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            isOpen && "bg-muted border-border text-foreground"
          )}
        >
          <Clock className="h-3 w-3" />
          <span>v{currentVersion}</span>
          <ChevronDown className={cn("h-3 w-3 opacity-50 transition-transform", isOpen && "rotate-180")} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-1.5">
        <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Version History
          </span>
        </div>
        <DropdownMenuSeparator className="mb-1" />

        {versions.map((version, index) => {
          const versionNum = index + 1;
          const isActive = versionNum === currentVersion;
          const label = version.prompt
            ? version.prompt.length > 45
              ? version.prompt.slice(0, 45) + "…"
              : version.prompt
            : versionNum === 1
              ? "Original generation"
              : "Refined version";

          return (
            <DropdownMenuItem
              key={version.id}
              className={cn(
                "flex items-start gap-3 py-2.5 px-2 rounded-lg cursor-pointer group",
                isActive && "bg-primary/8"
              )}
              onClick={() => {
                if (!isActive) onRestore(index);
                setIsOpen(false);
              }}
            >
              {/* Version badge */}
              <div className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-muted/80"
              )}>
                {versionNum}
              </div>

              {/* Label + time */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {versionNum === 1 ? (
                    <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                  ) : null}
                  <p className="text-[11px] font-medium text-foreground truncate leading-tight">
                    {label}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {getRelativeTime(version.createdAt)}
                </p>
              </div>

              {/* State indicator */}
              {isActive ? (
                <span className="shrink-0 flex items-center gap-1 text-[10px] text-primary font-medium">
                  <Check className="h-3 w-3" />
                  Active
                </span>
              ) : (
                <span className="shrink-0 flex items-center gap-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <RotateCcw className="h-3 w-3" />
                  Restore
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SceneVersionHistory;
