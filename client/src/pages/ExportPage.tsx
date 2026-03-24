import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Link2, Play, Pause, Film, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Scene, generateMockScenes, framesToSeconds } from "@/lib/mockData";
import { toast } from "sonner";

const ExportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = (location.state as any)?.prompt || "Your product";
  const scenes: Scene[] = (location.state as any)?.scenes || generateMockScenes(prompt);

  const [resolution, setResolution] = useState("1080p");
  const [format, setFormat] = useState("MP4");
  const [aspect, setAspect] = useState("16:9");
  const [playing, setPlaying] = useState(false);
  const [activeScene, setActiveScene] = useState(0);

  const totalDuration = scenes.reduce((a, s) => a + framesToSeconds(s.duration), 0);

  const handleDownload = () => {
    toast.success("Your video is being rendered! Download will start shortly.", {
      icon: <Check className="h-4 w-4" />,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/storyboard", { state: { prompt } })}
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
              Export Video
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            {/* Video preview */}
            <div
              className={`relative bg-gradient-to-br ${scenes[activeScene]?.gradient || "from-primary/20 to-accent/10"} rounded-2xl border overflow-hidden`}
              style={{ aspectRatio: aspect === "16:9" ? "16/9" : aspect === "9:16" ? "9/16" : "1/1" }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                    Scene {activeScene + 1} — {scenes[activeScene]?.type}
                  </p>
                  <h2
                    className="text-2xl md:text-3xl font-bold text-foreground mb-3"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {scenes[activeScene]?.headline}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {scenes[activeScene]?.script}
                  </p>
                </div>
              </div>

              {/* Play overlay */}
              <button
                onClick={() => setPlaying(!playing)}
                className="absolute inset-0 flex items-center justify-center bg-foreground/0 hover:bg-foreground/5 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-card/80 backdrop-blur flex items-center justify-center shadow-lg">
                  {playing ? (
                    <Pause className="h-6 w-6 text-foreground" />
                  ) : (
                    <Play className="h-6 w-6 text-foreground ml-0.5" />
                  )}
                </div>
              </button>
            </div>

            {/* Scene filmstrip */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {scenes.map((scene, i) => (
                <button
                  key={scene.id}
                  onClick={() => setActiveScene(i)}
                  className={`shrink-0 w-20 h-12 rounded-lg bg-gradient-to-br ${scene.gradient ?? "from-primary/20 to-primary/5"} border-2 transition-all flex items-center justify-center ${
                    activeScene === i
                      ? "border-primary shadow-md scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <span className="text-[10px] font-bold text-foreground">{scene.category}</span>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-2">
              Total duration: {totalDuration}s · {scenes.length} scenes
            </p>
          </motion.div>
        </div>

        {/* Export settings */}
        <motion.aside
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:w-80 border-t lg:border-t-0 lg:border-l bg-card p-6 space-y-6"
        >
          <h3
            className="font-bold text-lg"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Export Settings
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resolution
              </Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="4K">4K (Ultra HD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Format
              </Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MP4">MP4</SelectItem>
                  <SelectItem value="WebM">WebM</SelectItem>
                  <SelectItem value="GIF">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Aspect Ratio
              </Label>
              <Select value={aspect} onValueChange={setAspect}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              size="lg"
              className="w-full rounded-xl gap-2 font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" /> Download Video
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl gap-2"
              onClick={() => toast.success("Share link copied to clipboard!")}
            >
              <Link2 className="h-4 w-4" /> Copy Share Link
            </Button>
          </div>
        </motion.aside>
      </main>
    </div>
  );
};

export default ExportPage;
