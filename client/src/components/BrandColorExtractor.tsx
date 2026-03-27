import { useState, useRef } from "react";
import { Loader2, X, Check, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BrandFont {
  role?: string;
  family: string;
  source?: string;
  weights?: number[];
}

interface BrandColorDetail {
  hex: string;
  usage?: string;
}

interface BrandLogo {
  url: string;
  type?: string;
}

interface BrandBackdrop {
  url: string;
  description?: string;
}

export interface BrandData {
  brandName?: string;
  colors: string[];
  colorDetails?: BrandColorDetail[];
  logos?: string[];
  logoDetails?: BrandLogo[];
  backdrops?: string[];
  backdropDetails?: BrandBackdrop[];
  fonts?: BrandFont[];
}

interface BrandColorExtractorProps {
  currentBrand: BrandData | null;
  onBrandExtracted: (data: BrandData | null) => void;
  onClose: () => void;
}

const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [error, setError] = useState(false);
  if (error) return null;
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

/**
 * BrandColorExtractor — Inline URL input + expanded openbrand-style dashboard card.
 */
const BrandColorExtractor = ({ currentBrand, onBrandExtracted, onClose }: BrandColorExtractorProps) => {
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExtract = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setIsExtracting(true);

    try {
      const res = await fetch("/api/brand/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        toast.error("Invalid server response");
        return;
      }

      if (!res.ok) {
        toast.error(data.error || `Request failed (${res.status})`);
        return;
      }
      if (!data.success) {
        toast.error(data.error || "Failed to extract brand data");
        return;
      }

      const extracted: BrandData = {
        brandName: data.brandName,
        colors: data.colors ?? [],
        colorDetails: data.colorDetails ?? [],
        logos: data.logos ?? [],
        logoDetails: data.logoDetails ?? [],
        backdrops: data.backdrops ?? [],
        backdropDetails: data.backdropDetails ?? [],
        fonts: data.fonts ?? [],
      };

      if (extracted.colors.length === 0 && !extracted.logos?.length && !extracted.backdrops?.length) {
        toast.error(data.message ?? "No brand data found for this website");
        return;
      }

      onBrandExtracted(extracted);
      setUrl("");
      toast.success(
        `Extracted brand data from ${extracted.brandName ?? trimmed.replace(/^https?:\/\//, "")}`
      );
    } catch (err) {
      console.error("Brand extraction error:", err);
      toast.error("Failed to extract brand data. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleClear = () => {
    setUrl("");
    onBrandExtracted(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isExtracting) handleExtract();
  };

  // If we only have plain hex strings (fallback), map to detail shape
  const colorsToRender = currentBrand?.colorDetails?.length
    ? currentBrand.colorDetails
    : currentBrand?.colors.map((hex) => ({ hex, usage: undefined })) ?? [];

  const logosToRender = currentBrand?.logoDetails?.length
    ? currentBrand.logoDetails
    : currentBrand?.logos?.map((url) => ({ url, type: undefined })) ?? [];

  const backdropsToRender = currentBrand?.backdropDetails?.length
    ? currentBrand.backdropDetails
    : currentBrand?.backdrops?.map((url) => ({ url, description: undefined })) ?? [];

  return (
    <div className="flex flex-col gap-6 p-6 pt-2">
      <AnimatePresence mode="wait">
        {!currentBrand && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://example.com"
                  disabled={isExtracting}
                  className="pl-9 bg-muted/50 border-border/50 h-11"
                  autoComplete="off"
                />
                {url && !isExtracting && (
                  <button
                    onClick={() => setUrl("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleExtract}
                disabled={!url.trim() || isExtracting}
                className="h-11 px-6 font-medium gap-2"
              >
                {isExtracting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isExtracting ? "Extracting..." : "Extract Brand"}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border/40">
              <p>Enter a website URL to instantly extract their brand kit, including:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                <li>Primary, secondary, and accent colors</li>
                <li>Logo variations and favicons</li>
                <li>Hero background images</li>
              </ul>
            </div>
          </motion.div>
        )}

        {currentBrand && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                  {currentBrand.brandName ?? "Extracted Assets"}
                </div>
                <div className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Brand attached
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" /> Clear
              </Button>
            </div>

            <div className="brand-extractor__expanded-body p-0 pt-1 -mx-2 px-2" style={{ maxHeight: '420px' }}>
              {/* LOGOS */}
              {logosToRender.length > 0 && (
                <div className="brand-section">
                  <div className="brand-section__title">LOGOS</div>
                  <div className="brand-grid--logos">
                    {logosToRender.map((l, i) => (
                      <div key={i} className="brand-item--logo">
                        <div className="brand-item__preview-bg-check shadow-sm border-border/40">
                          <ImageWithFallback src={l.url} alt="logo" className="brand-item__img-logo" />
                        </div>
                        {l.type && <div className="brand-item__label text-muted-foreground">{l.type}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COLORS */}
              {colorsToRender.length > 0 && (
                <div className="brand-section mt-5">
                  <div className="brand-section__title">COLORS</div>
                  <div className="brand-grid--colors">
                    {colorsToRender.map((c, i) => (
                      <div key={i} className="brand-item--color">
                        <div className="brand-item__swatch-box shadow-sm border-border/40" style={{ backgroundColor: c.hex }}></div>
                        <div className="brand-item__label font-mono font-semibold text-foreground/80 mt-1">{c.hex}</div>
                        {c.usage && (
                          <div className="brand-item__sublabel text-muted-foreground uppercase text-[9px] tracking-wider">
                            {c.usage}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BACKGROUND IMAGES */}
              {backdropsToRender.length > 0 && (
                <div className="brand-section mt-5">
                  <div className="brand-section__title">BACKGROUND IMAGES</div>
                  <div className="brand-grid--backdrops">
                    {backdropsToRender.map((b, i) => (
                      <div key={i} className="brand-item--backdrop">
                        <div className="brand-item__backdrop-img-wrapper shadow-sm border-border/40">
                          <ImageWithFallback src={b.url} alt="backdrop" className="brand-item__img-backdrop" />
                        </div>
                        {b.description && (
                          <div className="brand-item__label text-muted-foreground mt-1">{b.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-2 border-t border-border/40">
               <Button onClick={onClose} className="px-6 rounded-full font-semibold">
                 Done
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandColorExtractor;
