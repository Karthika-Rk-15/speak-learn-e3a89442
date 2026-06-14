import { Brain } from "lucide-react";
import { motion } from "motion/react";

export function Logo({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) {
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        whileHover={{ rotate: 12, scale: 1.05 }}
        className={`${dim} grid place-items-center rounded-xl gradient-primary shadow-glow shrink-0`}
      >
        <Brain className="h-1/2 w-1/2 text-primary-foreground" strokeWidth={2.5} />
      </motion.div>
      {showText && (
        <span className={`font-display font-bold ${text} tracking-tight`}>
          LearnMate <span className="gradient-text">AI</span>
        </span>
      )}
    </div>
  );
}
