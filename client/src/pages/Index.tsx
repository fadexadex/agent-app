import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Film, FolderOpen, Paperclip, X, Loader2, Palette, Wand2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BrandColorExtractor, { BrandData } from "@/components/BrandColorExtractor";
import { examplePrompts } from "@/lib/mockData";
import { uploadFile } from "@/lib/upload";

type GenerationMode = "product-video" | "animate-media";

const modes: { id: GenerationMode; label: string; icon: React.ReactNode }[] = [
  { id: "product-video", label: "Product Video", icon: <Film className="w-5 h-5" /> },
  { id: "animate-media", label: "Animate Media", icon: <Wand2 className="w-5 h-5" /> },
];

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("product-video");
  const [assets, setAssets] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [showBrandExtractor, setShowBrandExtractor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (!prompt.trim() && assets.length === 0 && (!brand || (brand.logos?.length === 0 && brand.backdrops?.length === 0))) return;

    const combinedAssets = [
      ...assets,
      ...(brand?.logos || []),
      ...(brand?.backdrops || []),
    ];

    const targetRoute = generationMode === "animate-media" ? "/animate" : "/generating";
    navigate(targetRoute, {
      state: {
        prompt,
        assets: combinedAssets,
        brandColors: brand?.colors ?? [],
        brandName: brand?.brandName,
        brandFonts: brand?.fonts,
        brandLogos: brand?.logos,
        brandBackdrops: brand?.backdrops,
        generationMode,
      },
    });
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

  const handleBrandExtracted = (data: BrandData | null) => {
    setBrand(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans antialiased">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-12">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-[10px] bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-sm">
            <Video className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-[#18181B] tracking-[-0.02em]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Fusion
          </span>
        </div>
        <button
          onClick={() => navigate("/videos")}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          <FolderOpen className="h-4 w-4" />
          <span className="text-sm font-medium">My Videos</span>
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center">
        <div className="flex-1 flex flex-col items-center justify-center px-6 w-full max-w-4xl py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100/50 border border-violet-200/50 text-violet-600 text-[13px] font-semibold mb-8 tracking-[0.01em]"
            >
              <Sparkles className="h-3.5 w-3.5 fill-violet-600" />
              AI-powered video generation
            </motion.div>

            <h1
              className="text-[40px] sm:text-[56px] font-extrabold tracking-[-0.03em] text-[#18181B] leading-[1.1] mb-6 whitespace-pre-wrap max-w-3xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Create stunning videos{"\n"}in seconds
            </h1>

            <p className="text-[18px] text-[#71717A] max-w-[520px] mb-10 leading-[1.6]">
              Describe your product and let AI craft beautiful motion graphics. No design skills needed.
            </p>

            {/* Input area */}
            <div className="w-full max-w-[640px] bg-white rounded-[20px] border border-zinc-200 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] p-1 mb-10 text-left">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your product or brand… e.g. 'A productivity app for remote teams'"
                className="border-0 shadow-none focus-visible:ring-0 resize-none text-base min-h-[100px] bg-transparent text-black placeholder:text-zinc-400 p-4"
              />

              {/* ── Uploaded file thumbnails ── */}
              {assets.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pb-3">
                  {assets.map((asset, i) => (
                    <div key={i} className="relative group rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50 h-16 w-16 flex items-center justify-center">
                      {asset.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <img src={asset} alt="upload" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-zinc-500 break-all p-1 text-center leading-tight">
                          {asset.split("/").pop()?.slice(-10)}
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

              {/* ── Toolbar ── */}
              <div className="flex justify-between items-center px-4 py-3 border-t border-zinc-100">
                <div className="flex items-center gap-1">
                  {/* File upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  <button
                    className="h-10 w-10 flex items-center justify-center rounded-[10px] text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Upload assets"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                  </button>

                  {/* Brand extract toggle */}
                  <Dialog open={showBrandExtractor} onOpenChange={setShowBrandExtractor}>
                    <DialogTrigger asChild>
                      <button
                        className={`relative h-10 w-10 flex items-center justify-center rounded-[10px] transition-colors ${brand ? "text-violet-600 bg-violet-50" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"}`}
                        title="Extract brand from URL"
                      >
                        <Palette className="w-5 h-5" />
                        {brand && (
                          <span className="absolute 1 top-1 right-1 w-2.5 h-2.5 bg-violet-600 rounded-full border-2 border-white"></span>
                        )}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-zinc-900">Extract Brand Assets</DialogTitle>
                        <DialogDescription className="text-zinc-500">
                          Generate a professional dashboard of logos, colors, and backgrounds from any website URL.
                        </DialogDescription>
                      </DialogHeader>
                      <BrandColorExtractor
                        currentBrand={brand}
                        onBrandExtracted={handleBrandExtracted}
                        onClose={() => setShowBrandExtractor(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={(!prompt.trim() && assets.length === 0) || isUploading}
                  className="bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-[0_2px_8px_rgba(139,92,246,0.35)] rounded-xl px-6 py-3 flex items-center gap-2.5 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generationMode === "animate-media" ? "Generate Animation" : "Generate My Video"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex justify-center items-center gap-8 mb-12">
              {modes.map((mode) => {
                const isActive = generationMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setGenerationMode(mode.id)}
                    className="flex flex-col items-center gap-3 transition-all outline-none group"
                  >
                    <div
                      className={`size-16 rounded-[18px] flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-violet-50 border-2 border-violet-200 text-violet-600"
                          : "bg-white border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-zinc-400 group-hover:border-zinc-300 group-hover:text-zinc-500"
                      }`}
                    >
                      {mode.icon}
                    </div>
                    <span className={`text-[13px] leading-4 ${isActive ? "text-violet-600 font-semibold" : "text-zinc-400 font-medium group-hover:text-zinc-500"}`}>
                      {mode.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Example prompts */}
            <div className="flex flex-col items-center gap-4">
              <span className="uppercase tracking-widest text-zinc-400 font-semibold text-[11px]">
                Try an example
              </span>
              <div className="flex flex-wrap justify-center max-w-[600px] gap-2.5">
                {(generationMode === "product-video" ? [
                  "SaaS product launch",
                  "Mobile app promo",
                  "E-commerce feature"
                ] : [
                  "Logo reveal animation",
                  "Kinetic typography text",
                  "Image depth effect"
                ]).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(ex)}
                    className="flex items-center gap-2 bg-white border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-full px-4 py-2.5 text-[13px] text-zinc-600 hover:bg-zinc-50 transition-colors"
                  >
                    <Sparkles className="h-3 w-3 fill-violet-500 text-violet-500" />
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Community Showcase Section */}
        <section className="w-full py-20 sm:py-24 bg-[#FAFAFA] border-t border-slate-200 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <h2 className="text-[32px] sm:text-[40px] leading-[1.2] font-extrabold tracking-[-0.02em] text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Made with Fusion
              </h2>
              <p className="text-[18px] text-slate-500 max-w-2xl mx-auto leading-[1.6]">
                Discover what our community is creating. High-quality videos tailored to your brand, ready in seconds.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full justify-items-center">
              {[
                {
                  videoUrl: "https://res.cloudinary.com/dwl6lr9vq/video/upload/v1774645162/exported-video_3_rerx3u.mp4",
                  prompt: "A modern SaaS landing page explainer for remote teams",
                  tag: "Product Video"
                },
                {
                  videoUrl: "https://res.cloudinary.com/dwl6lr9vq/video/upload/v1774645827/exported-video_4_yqnu1a.mp4",
                  prompt: "Sleek animated text revealing a new feature rollout",
                  tag: "Animate Media"
                }
              ].map((demo, idx) => (
                <Dialog key={idx}>
                  <DialogTrigger asChild>
                      <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                      className="group relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-xl cursor-pointer"
                    >
                      <video
                        src={demo.videoUrl}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                      
                      {/* Gradient Overlay matching design */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex mb-3">
                          <span className="px-3 py-1 text-[13px] font-semibold bg-indigo-500/90 backdrop-blur-md text-white rounded-full">
                            {demo.tag}
                          </span>
                        </div>
                        <p className="text-white text-[16px] font-medium leading-[1.5]">
                          "{demo.prompt}"
                        </p>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center rounded-full bg-black/50 border border-white/20 backdrop-blur-md text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-[95vw] p-0 border-none bg-transparent shadow-none overflow-hidden sm:rounded-xl">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Community Video: {demo.prompt}</DialogTitle>
                      <DialogDescription>Community submitted showcase video playing.</DialogDescription>
                    </DialogHeader>
                    <video
                      src={demo.videoUrl}
                      className="w-full h-auto max-h-[85vh] object-contain rounded-xl bg-black/95 shadow-2xl outline-none"
                      controls
                      autoPlay
                      playsInline
                    />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
