import { motion } from "motion/react";

export function Waveform({ active = true, bars = 32 }: { active?: boolean; bars?: number }) {
  return (
    <div className="flex h-16 items-center justify-center gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1 origin-center rounded-full gradient-primary"
          animate={
            active
              ? { scaleY: [0.3, 1, 0.5, 0.9, 0.3], opacity: [0.6, 1, 0.8, 1, 0.6] }
              : { scaleY: 0.2, opacity: 0.4 }
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: (i % 8) * 0.08,
            ease: "easeInOut",
          }}
          style={{ height: `${30 + ((i * 17) % 40)}px` }}
        />
      ))}
    </div>
  );
}
