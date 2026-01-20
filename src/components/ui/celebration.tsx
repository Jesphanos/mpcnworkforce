import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, PartyPopper, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CelebrationProps {
  show: boolean;
  title: string;
  message?: string;
  type?: "success" | "achievement" | "milestone" | "completion";
  onComplete?: () => void;
  duration?: number;
}

const celebrationIcons = {
  success: CheckCircle,
  achievement: Trophy,
  milestone: Star,
  completion: PartyPopper,
};

const celebrationColors = {
  success: "text-success",
  achievement: "text-warning",
  milestone: "text-primary",
  completion: "text-success",
};

export function Celebration({
  show,
  title,
  message,
  type = "success",
  onComplete,
  duration = 3000,
}: CelebrationProps) {
  const [visible, setVisible] = useState(show);
  const Icon = celebrationIcons[type];

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative"
          >
            {/* Confetti particles */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    x: 0,
                    y: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100,
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: "easeOut",
                  }}
                  className={cn(
                    "absolute left-1/2 top-1/2 w-2 h-2 rounded-full",
                    i % 4 === 0 && "bg-success",
                    i % 4 === 1 && "bg-warning",
                    i % 4 === 2 && "bg-primary",
                    i % 4 === 3 && "bg-accent"
                  )}
                />
              ))}
            </div>

            {/* Main content */}
            <div className="relative bg-card border rounded-2xl p-8 shadow-2xl text-center max-w-sm">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className={cn(
                  "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                  type === "success" && "bg-success/10",
                  type === "achievement" && "bg-warning/10",
                  type === "milestone" && "bg-primary/10",
                  type === "completion" && "bg-success/10"
                )}
              >
                <Icon className={cn("h-8 w-8", celebrationColors[type])} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold mb-2"
              >
                {title}
              </motion.h2>

              {message && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground"
                >
                  {message}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 text-xs text-muted-foreground"
              >
                Click anywhere to continue
              </motion.div>
            </div>
          </motion.div>

          {/* Click to dismiss */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => {
              setVisible(false);
              onComplete?.();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple checkmark animation for form completions
export function SuccessCheckmark({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
          className="w-6 h-6 rounded-full bg-success flex items-center justify-center"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CheckCircle className="h-4 w-4 text-success-foreground" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
