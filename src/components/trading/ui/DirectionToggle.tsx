import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface DirectionToggleProps {
  value: "long" | "short";
  onChange: (value: "long" | "short") => void;
  disabled?: boolean;
  size?: "default" | "large";
}

export function DirectionToggle({
  value,
  onChange,
  disabled = false,
  size = "default",
}: DirectionToggleProps) {
  const isLarge = size === "large";

  return (
    <div className="flex gap-3">
      <motion.button
        type="button"
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => !disabled && onChange("long")}
        disabled={disabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-xl font-semibold transition-all",
          isLarge ? "py-4 text-lg" : "py-3 text-sm",
          value === "long"
            ? "gradient-long text-white shadow-lg"
            : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <TrendingUp className={cn(isLarge ? "h-6 w-6" : "h-5 w-5")} />
        <span>LONG</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => !disabled && onChange("short")}
        disabled={disabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-xl font-semibold transition-all",
          isLarge ? "py-4 text-lg" : "py-3 text-sm",
          value === "short"
            ? "gradient-short text-white shadow-lg"
            : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <TrendingDown className={cn(isLarge ? "h-6 w-6" : "h-5 w-5")} />
        <span>SHORT</span>
      </motion.button>
    </div>
  );
}
