/**
 * MPCN Continue Button
 * Gradient green button with microinteractions
 */

import { motion } from "framer-motion";
import { ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContinueButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}

export function ContinueButton({
  children,
  disabled = false,
  isLoading = false,
  onClick,
  type = "button",
  className,
}: ContinueButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={cn(
        "relative w-full py-3 px-6 rounded-xl font-semibold text-white",
        "bg-gradient-to-r from-primary to-primary/90",
        "shadow-lg shadow-primary/25",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "flex items-center justify-center gap-2",
        disabled
          ? "opacity-50 cursor-not-allowed from-muted to-muted shadow-none"
          : "hover:shadow-xl hover:shadow-primary/30",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          {children}
          <ChevronRight className="h-5 w-5" />
        </>
      )}

      {/* Ripple effect overlay */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-white/20 opacity-0"
        whileTap={{ opacity: 1, scale: 1.05 }}
        transition={{ duration: 0.15 }}
      />
    </motion.button>
  );
}
