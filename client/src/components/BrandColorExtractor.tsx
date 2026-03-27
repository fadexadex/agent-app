import { useState } from "react";
import { Loader2, X, ExternalLink, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface BrandColorExtractorProps {
  onColorsExtracted: (colors: string[], brandName?: string) => void;
}

/**
 * BrandColorExtractor - Professional color extraction component
 *
 * Extracts brand colors from website URLs and displays them as a curated palette.
 * Design inspired by professional color lab tools with refined minimalism.
 */
const BrandColorExtractor = ({ onColorsExtracted }: BrandColorExtractorProps) => {
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [brandName, setBrandName] = useState<string | undefined>();
  const [colors, setColors] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());

  const handleExtract = async () => {
    if (!url.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    setIsExtracting(true);

    try {
      const res = await fetch("/api/brand/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const raw = await res.text();
      let data: {
        success?: boolean;
        message?: string;
        colors?: string[];
        brandName?: string;
        logos?: string[];
        backdrops?: string[];
        error?: string;
      } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        toast.error(
          res.status === 404
            ? "Brand extract API not found. Use a local server with /api/brand or fix VITE_API_PROXY_TARGET."
            : "Invalid response from server. Please try again.",
        );
        return;
      }

      if (!res.ok) {
        toast.error(data.error || `Request failed (${res.status})`);
        return;
      }

      if (data.success) {
        const colorList = data.colors ?? [];
        if (colorList.length === 0) {
          toast.error(data.message ?? "No brand colors found for this website");
          return;
        }

        setColors(colorList);
        setBrandName(data.brandName);

        // Auto-select all colors
        const allSelected = new Set(colorList);
        setSelectedColors(allSelected);

        // Notify parent with all colors selected
        onColorsExtracted(colorList, data.brandName);

        toast.success(
          `Extracted ${colorList.length} color${colorList.length !== 1 ? 's' : ''} from ${data.brandName || 'website'}`
        );
      } else {
        toast.error(data.error || "Failed to extract colors");
      }
    } catch (error) {
      console.error("Color extraction error:", error);
      toast.error("Failed to extract colors. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleToggleColor = (color: string) => {
    const newSelected = new Set(selectedColors);

    if (newSelected.has(color)) {
      newSelected.delete(color);
    } else {
      newSelected.add(color);
    }

    setSelectedColors(newSelected);

    // Notify parent with updated selection
    const selectedArray = Array.from(newSelected);
    onColorsExtracted(selectedArray, brandName);
  };

  const handleClear = () => {
    setColors([]);
    setSelectedColors(new Set());
    setBrandName(undefined);
    setUrl("");
    onColorsExtracted([], undefined);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExtracting) {
      handleExtract();
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-foreground/80 tracking-tight">
              Website URL
            </label>
            <div className="relative">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="stripe.com or https://stripe.com"
                disabled={isExtracting}
                className="pr-10 h-11 text-[15px] bg-muted/30 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:border-primary/50"
              />
              {url && !isExtracting && (
                <button
                  onClick={() => setUrl("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <Button
            onClick={handleExtract}
            disabled={!url.trim() || isExtracting}
            className="mt-7 h-11 px-5 gap-2 font-medium shadow-sm"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Extract
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {colors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Brand Name Header */}
            {brandName && (
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div>
                  <h3 className="text-base font-semibold tracking-tight">{brandName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedColors.size} of {colors.length} color{colors.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground -mr-2"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Color Palette Grid */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">
                Color Palette
              </p>

              <div className="grid grid-cols-5 gap-3">
                {colors.map((color, index) => (
                  <motion.div
                    key={color}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.08,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="flex flex-col items-center gap-2"
                  >
                    {/* Color Swatch */}
                    <button
                      onClick={() => handleToggleColor(color)}
                      className="group relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
                      style={{
                        backgroundColor: color,
                        borderColor: selectedColors.has(color)
                          ? 'hsl(var(--primary))'
                          : 'hsl(var(--border))',
                        boxShadow: selectedColors.has(color)
                          ? '0 4px 12px -2px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                          : '0 1px 3px rgba(0, 0, 0, 0.08)',
                      }}
                      title={color}
                    >
                      {/* Selection Indicator */}
                      <AnimatePresence>
                        {selectedColors.has(color) && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
                          >
                            <div className="w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
                              <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Hover Hex Code */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-sm">
                        <span className="text-[10px] font-mono font-semibold text-white tracking-wider drop-shadow-sm">
                          {color}
                        </span>
                      </div>
                    </button>

                    {/* Checkbox - Hidden visually but accessible */}
                    <Checkbox
                      checked={selectedColors.has(color)}
                      onCheckedChange={() => handleToggleColor(color)}
                      className="sr-only"
                      aria-label={`Select ${color}`}
                    />

                    {/* Hex Code Label */}
                    <span className="text-[10px] font-mono text-muted-foreground tracking-tight">
                      {color}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Selection Hint */}
            <p className="text-xs text-muted-foreground text-center pt-2 leading-relaxed">
              Click any color to toggle selection • These colors will be used in your video scenes
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {colors.length === 0 && !isExtracting && (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50 mb-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500/70" />
              <div className="w-2 h-2 rounded-full bg-purple-500/70" />
              <div className="w-2 h-2 rounded-full bg-pink-500/70" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
            Enter a website URL to automatically extract their brand colors
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandColorExtractor;
