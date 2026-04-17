import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Download,
  RefreshCw,
  Pencil,
  Film,
  Palette,
  Wand2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RichScene,
  framesToSeconds,
  backgroundToGradient,
  stylePresets,
} from "@/lib/mockData";
import SceneEditor from "@/components/SceneEditor";

const categoryColors: Record<string, string> = {
  hook: "text-purple-500",
  intro: "text-blue-500",
  feature: "text-primary",
  benefit: "text-green-500",
  cta: "text-accent",
  transition: "text-muted-foreground",
};

const StoryboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = (location.state as any)?.prompt || "Your product";
  const productName = prompt.split(" ").slice(0, 4).join(" ");
  const assets = (location.state as any)?.assets || [];
  const brandColors = (location.state as any)?.brandColors || [];
  const brandName = (location.state as any)?.brandName;
  const brandFonts = (location.state as any)?.brandFonts || [];
  const brandLogos = (location.state as any)?.brandLogos || [];
  const brandBackdrops = (location.state as any)?.brandBackdrops || [];
  const generationMode = (location.state as any)?.generationMode;

  const passedScenes: RichScene[] = (location.state as any)?.scenes || [];
  const [scenes, setScenes] = useState<RichScene[]>(passedScenes);
  const [editingScene, setEditingScene] = useState<RichScene | null>(null);
  const [activeStyle, setActiveStyle] = useState(0);
  const [showStylePanel, setShowStylePanel] = useState(false);

  // Redirect to home if we arrived without scenes (direct navigation)
  useEffect(() => {
    if (scenes.length === 0) navigate("/");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveScene = (updated: RichScene) => {
    setScenes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const totalDuration = scenes.reduce((a, s) => a + framesToSeconds(s.duration), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span
              className="font-bold text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {productName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {scenes.length} scenes · {totalDuration}s
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
            onClick={() => setShowStylePanel(!showStylePanel)}
          >
            <Palette className="h-3.5 w-3.5" /> Style
          </Button>
          <Button
            size="sm"
            className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => navigate("/editor", { state: { prompt, scenes, assets, brandColors, brandName, brandFonts, brandLogos, brandBackdrops, generationMode } })}
          >
            Generate Video <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Scene cards */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {scenes.map((scene, i) => {
              const gradient = scene.gradient || backgroundToGradient(scene.background);
              const displayScript =
                scene.notes ||
                scene.elements
                  .map((e) => e.description)
                  .join(" ")
                  .slice(0, 140);

              return (
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Scene visual */}
                    <div
                      className={`sm:w-56 aspect-video sm:aspect-auto bg-gradient-to-br ${gradient} flex items-center justify-center p-6 shrink-0`}
                    >
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-card/60 backdrop-blur text-foreground font-bold text-sm mb-2">
                          {i + 1}
                        </div>
                        <p
                          className="text-sm font-bold text-foreground"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {scene.name}
                        </p>
                      </div>
                    </div>

                    {/* Scene info */}
                    <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest ${
                              categoryColors[scene.category] ?? "text-primary"
                            }`}
                          >
                            {scene.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            · {framesToSeconds(scene.duration)}s
                          </span>
                          {scene.transition && (
                            <span className="text-[10px] text-muted-foreground">
                              · {scene.transition.type} out
                            </span>
                          )}
                        </div>
                        <h3
                          className="font-bold text-foreground mb-1"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {scene.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {displayScript}
                        </p>

                        {/* Element chips */}
                        {scene.elements.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {scene.elements.map((el) => (
                              <span
                                key={el.id}
                                className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                              >
                                {el.component || el.type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 rounded-lg text-xs"
                          onClick={() => setEditingScene(scene)}
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 rounded-lg text-xs"
                        >
                          <RefreshCw className="h-3 w-3" /> Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Generate Video CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: scenes.length * 0.08 + 0.2 }}
              className="pt-4 pb-8"
            >
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/15 mb-4">
                  <Wand2 className="h-7 w-7 text-primary" />
                </div>
                <h3
                  className="text-xl font-bold text-foreground mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Ready to bring it to life?
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Our AI agents will render each scene with animations, transitions, and motion graphics.
                </p>
                <Button
                  size="lg"
                  className="gap-2 rounded-xl px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate("/editor", { state: { prompt, scenes, assets, brandColors, brandName, brandFonts, brandLogos, brandBackdrops, generationMode } })}
                >
                  Generate Video <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Style sidebar */}
        {showStylePanel && (
          <motion.aside
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 border-l bg-card p-5 overflow-y-auto hidden md:block"
          >
            <h3
              className="font-bold text-sm mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Visual Style
            </h3>
            <div className="space-y-3">
              {stylePresets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStyle(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    activeStyle === i
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <div className="flex gap-1">
                    <div
                      className="h-5 w-5 rounded-full border"
                      style={{ background: preset.primary }}
                    />
                    <div
                      className="h-5 w-5 rounded-full border"
                      style={{ background: preset.secondary }}
                    />
                  </div>
                  <span className="text-sm font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </div>

      {/* Scene editor modal */}
      <SceneEditor
        scene={editingScene}
        open={!!editingScene}
        onClose={() => setEditingScene(null)}
        onSave={handleSaveScene}
      />
    </div>
  );
};

export default StoryboardPage;
