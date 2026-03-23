import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { examplePrompts } from "@/lib/mockData";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    navigate("/generating", { state: { prompt } });
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
          <div className="bg-card rounded-2xl border shadow-lg p-2 mb-6">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your product or brand... e.g. 'A productivity app for remote teams that uses AI to automate daily standups'"
              className="border-0 shadow-none focus-visible:ring-0 resize-none text-base min-h-[100px] bg-transparent"
            />
            <div className="flex justify-end pt-1 pr-1">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!prompt.trim()}
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
