import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, RotateCcw, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

  if (versions.length <= 1) {
    return null; // Don't show if only one version
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          disabled={disabled}
        >
          <History className="h-3 w-3" />
          <span>v{currentVersion}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Version History
        </div>
        {versions.map((version, index) => {
          const versionNum = index + 1;
          const isActive = versionNum === currentVersion;
          return (
            <DropdownMenuItem
              key={version.id}
              className={cn(
                "flex items-start gap-2 py-2 cursor-pointer",
                isActive && "bg-accent"
              )}
              onClick={() => {
                if (!isActive) {
                  onRestore(index);
                }
                setIsOpen(false);
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs">v{versionNum}</span>
                  {isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {version.prompt || (versionNum === 1 ? "Original" : "Refined")}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  {getRelativeTime(version.createdAt)}
                </p>
              </div>
              {!isActive && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(index);
                    setIsOpen(false);
                  }}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
              {isActive && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SceneVersionHistory;
