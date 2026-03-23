import { motion } from "framer-motion";

interface GeneratingAnimationProps {
  sceneTitle?: string;
  message?: string;
}

const GeneratingAnimation = ({ sceneTitle, message }: GeneratingAnimationProps) => {
  return (
    <div className="flex items-center justify-center h-full bg-card relative overflow-hidden">
      {/* Subtle ambient gradient animation */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 30% 30%, hsl(var(--primary)/0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 70%, hsl(var(--primary)/0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 70%, hsl(var(--primary)/0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 30%, hsl(var(--primary)/0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 30%, hsl(var(--primary)/0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="text-center z-10">
        {/* Clean pulsing dots indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <p className="text-sm font-medium text-foreground">
          {message || `Creating ${sceneTitle || "scene"}`}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">AI is working on your video</p>
      </div>
    </div>
  );
};

export default GeneratingAnimation;
