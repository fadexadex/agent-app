import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, toUserFacingErrorMessage } from "@/lib/api";
import { RichScene } from "@/lib/mockData";
import { type UploadedAssetLike } from "@/lib/upload";

const steps = [
  { label: "Analyzing your product", icon: "🔍" },
  { label: "Writing your story", icon: "✍️" },
  { label: "Designing scenes", icon: "🎨" },
  { label: "Composing visuals", icon: "🎬" },
];

interface GenerationEvent {
  step?: "analyzing" | "writing" | "designing" | "scene" | "complete" | "error";
  scene?: RichScene;
  message?: string;
}

const GeneratingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const collectedScenesRef = useRef<RichScene[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    prompt?: string;
    assets?: UploadedAssetLike[];
    brandColors?: string[];
    brandName?: string;
    brandFonts?: { role?: string; family: string; source?: string; weights?: number[] }[];
    brandLogos?: string[];
    brandBackdrops?: string[];
    generationMode?: string;
  } | null;

  const prompt = state?.prompt || "Your product";
  const assets = useMemo(() => state?.assets || [], [state?.assets]);
  const brandColors = useMemo(() => state?.brandColors || [], [state?.brandColors]);
  const brandName = state?.brandName;
  const brandFonts = useMemo(() => state?.brandFonts || [], [state?.brandFonts]);
  const brandLogos = useMemo(() => state?.brandLogos || [], [state?.brandLogos]);
  const brandBackdrops = useMemo(
    () => state?.brandBackdrops || [],
    [state?.brandBackdrops],
  );
  const generationMode = state?.generationMode || "product-video";

  useEffect(() => {
    const controller = new AbortController();

    async function streamGeneration() {
      const response = await apiFetch("/api/scenes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, assets, brandColors, brandName, brandFonts, brandLogos, brandBackdrops, generationMode }),
        signal: controller.signal,
      });

      if (!response.body) {
        throw new Error("The server returned an empty response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: GenerationEvent;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (event.step === "analyzing") setCurrentStep(1);
          if (event.step === "writing") setCurrentStep(2);
          if (event.step === "designing") setCurrentStep(3);
          if (event.step === "scene") {
            collectedScenesRef.current.push(event.scene);
            setCurrentStep((s) => Math.max(s, 3));
          }
          if (event.step === "complete") {
            setCurrentStep(4);
            navigate("/storyboard", {
              state: { prompt, scenes: collectedScenesRef.current, assets, brandColors, brandName, brandFonts, brandLogos, brandBackdrops, generationMode },
            });
          }
          if (event.step === "error") {
            setError(event.message || "Generation failed");
          }
        }
      }
    }

    streamGeneration().catch((e) => {
      if (e.name !== "AbortError") {
        setError(toUserFacingErrorMessage(e));
      }
    });

    return () => controller.abort();
  }, [prompt, assets, brandColors, brandName, brandFonts, brandLogos, brandBackdrops, generationMode, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-8"
        >
          <Film className="h-8 w-8 text-primary" />
        </motion.div>

        <h2
          className="text-2xl font-bold text-foreground mb-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {generationMode === "animate-media" ? "Creating your animation" : "Creating your video"}
        </h2>
        <p className="text-muted-foreground mb-10 text-sm">
          This usually takes a few seconds...
        </p>

        <div className="space-y-4 text-left">
          {steps.map((step, i) => {
            const done = currentStep > i;
            const active = currentStep === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  done
                    ? "bg-accent/10"
                    : active
                    ? "bg-primary/5"
                    : "bg-secondary/50"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                    done
                      ? "bg-accent text-accent-foreground"
                      : active
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    ) : active ? (
                      <motion.div
                        key="loading"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <Loader2 className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <span key="icon">{step.icon}</span>
                    )}
                  </AnimatePresence>
                </div>
                <span
                  className={`text-sm font-medium ${
                    done
                      ? "text-foreground"
                      : active
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                  {active && "..."}
                  {done && " ✓"}
                </span>
              </motion.div>
            );
          })}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-destructive mb-3">Generation failed: {error}</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Try Again
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GeneratingPage;
