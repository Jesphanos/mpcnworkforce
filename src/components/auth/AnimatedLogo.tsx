/**
 * MPCN Animated Logo
 * Gentle pulse animation with hover glow effect
 */

import { motion } from "framer-motion";
import mpcnLogo from "@/assets/mpcn-logo.png";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

const sizeClasses = {
  sm: "h-16",
  md: "h-24", 
  lg: "h-32",
};

export function AnimatedLogo({ size = "md", showTagline = true }: AnimatedLogoProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.05,
          filter: "drop-shadow(0 0 20px hsl(var(--primary) / 0.4))",
        }}
      >
        <img
          src={mpcnLogo}
          alt="MPCN - Collaborative Network"
          className={`${sizeClasses[size]} w-auto drop-shadow-lg`}
        />
        
        {/* Subtle glow behind logo */}
        <div className="absolute inset-0 -z-10 blur-xl opacity-30 bg-gradient-to-br from-primary/50 to-secondary/50 rounded-full" />
      </motion.div>

      {showTagline && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-center"
        >
          <p className="text-lg font-semibold text-foreground tracking-wide">
            Collaborative Network
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Powering Collective Success
          </p>
        </motion.div>
      )}
    </div>
  );
}
