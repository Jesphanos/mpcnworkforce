/**
 * MPCN Role Selection Card
 * Modern, mobile-first role card with hover effects and visual hierarchy
 */

import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";

export interface RoleCardProps {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function RoleCard({
  id,
  label,
  description,
  icon: Icon,
  gradient,
  iconBg,
  isSelected,
  onSelect,
}: RoleCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left group",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? `${gradient} border-transparent shadow-lg shadow-primary/20`
          : "bg-card border-border/50 hover:border-primary/30 hover:shadow-md"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
        >
          <Check className="h-3 w-3 text-primary" />
        </motion.div>
      )}

      {/* Content */}
      <div className="flex flex-col items-center text-center gap-2">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
            isSelected ? "bg-white/20" : iconBg
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6 transition-colors",
              isSelected ? "text-white" : "text-foreground"
            )}
          />
        </div>

        <div className="space-y-0.5">
          <h3
            className={cn(
              "font-semibold text-sm leading-tight",
              isSelected ? "text-white" : "text-foreground"
            )}
          >
            {label}
          </h3>
          <p
            className={cn(
              "text-xs leading-tight line-clamp-2",
              isSelected ? "text-white/80" : "text-muted-foreground"
            )}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Info tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            asChild
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                isSelected ? "bg-white/20" : "bg-muted"
              )}
            >
              <Info
                className={cn(
                  "h-3 w-3",
                  isSelected ? "text-white/80" : "text-muted-foreground"
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px]">
            <p className="text-xs">{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Glow effect on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
          isSelected ? "" : "bg-gradient-to-br from-primary/5 to-transparent"
        )}
      />
    </motion.button>
  );
}
