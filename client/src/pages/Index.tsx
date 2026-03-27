import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Film, FolderOpen, Paperclip, X, Loader2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import BrandColorExtractor from "@/components/BrandColorExtractor";
import { examplePrompts } from "@/lib/mockData";
import { uploadFile } from "@/lib/upload";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [assets, setAssets] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [brandName, setBrandName] = useState<string | undefined>();
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (!prompt.trim() && assets.length === 0) return;
    navigate("/generating", { state: { prompt, assets, brandColors, brandName } });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newAssets = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        newAssets.push(url);
      }
      setAssets((prev) => [...prev, ...newAssets]);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAsset = (index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Film className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            MotionAI
          </span>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/videos")}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <FolderOpen className="h-4 w-4" />
          My Videos
        </Button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered video generation
          </motion.div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Create a stunning product video{" "}
            <span className="text-primary">in seconds</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10">
            Describe your product and let AI craft a beautiful motion graphics
            video. No design skills needed.
          </p>

          {/* Input area */}
          <div className="bg-card rounded-2xl border shadow-lg p-2 mb-6 text-left">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your product or brand... e.g. 'A productivity app for remote teams that uses AI to automate daily standups'"
              className="border-0 shadow-none focus-visible:ring-0 resize-none text-base min-h-[100px] bg-transparent"
            />
            
            {/* Asset Thumbnails */}
            {assets.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pb-3">
                {assets.map((asset, i) => (
                  <div key={i} className="relative group rounded-md border overflow-hidden bg-muted h-16 w-16 flex items-center justify-center">
                    {asset.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                      <img src={asset} alt="upload" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs text-muted-foreground break-all p-1 text-center leading-tight">
                        {asset.split('/').pop()?.slice(-10)}
                      </div>
                    )}
                    <button
                      onClick={() => removeAsset(i)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {brandColors.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-3 pb-2 pt-1">
                {brandName && (
                  <span className="text-xs text-muted-foreground font-medium shrink-0">{brandName}</span>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {brandColors.map((hex) => (
                    <span
                      key={hex}
                      title={hex}
                      className="h-7 w-7 rounded-lg border border-border shadow-sm shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-end pt-1 pr-1 pl-2">
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  title="Upload assets"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                </Button>

                <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground relative"
                      title="Extract brand colors"
                    >
                      <Palette className="w-5 h-5" />
                      {brandColors.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center font-semibold">
                          {brandColors.length}
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Extract Brand Colors</DialogTitle>
                    </DialogHeader>
                    <BrandColorExtractor
                      onColorsExtracted={(colors, name) => {
                        setBrandColors(colors);
                        setBrandName(name);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={(!prompt.trim() && assets.length === 0) || isUploading}
                className="rounded-xl gap-2 px-6 font-semibold"
              >
                Generate My Video
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Example prompts */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Try an example
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {examplePrompts.map((ex, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPrompt(ex)}
                  className="text-sm text-muted-foreground bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-full transition-colors text-left max-w-xs truncate"
                >
                  <Zap className="h-3 w-3 inline mr-1.5 text-primary" />
                  {ex}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
