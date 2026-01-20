import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  thresholds?: {
    warning: number;
    danger: number;
  };
}

export function GaugeChart({
  value,
  max,
  label,
  showPercentage = true,
  size = "md",
  thresholds = { warning: 0.6, danger: 0.85 },
}: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const ratio = value / max;

  const getColor = () => {
    if (ratio >= thresholds.danger) return "hsl(var(--trading-negative))";
    if (ratio >= thresholds.warning) return "hsl(var(--warning))";
    return "hsl(var(--trading-positive))";
  };

  const sizeConfig = {
    sm: { width: 80, height: 40, stroke: 6, textSize: "text-sm" },
    md: { width: 120, height: 60, stroke: 8, textSize: "text-lg" },
    lg: { width: 160, height: 80, stroke: 10, textSize: "text-2xl" },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: config.width, height: config.height }}>
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height + 10}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${config.stroke / 2} ${config.height} A ${radius} ${radius} 0 0 1 ${config.width - config.stroke / 2} ${config.height}`}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.stroke}
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <motion.path
            d={`M ${config.stroke / 2} ${config.height} A ${radius} ${radius} 0 0 1 ${config.width - config.stroke / 2} ${config.height}`}
            fill="none"
            stroke={getColor()}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              filter: ratio >= thresholds.danger ? "drop-shadow(0 0 6px hsl(var(--trading-negative) / 0.5))" : undefined,
            }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className={cn("font-bold", config.textSize)}>
            {showPercentage ? `${percentage.toFixed(0)}%` : value.toFixed(1)}
          </span>
        </div>
      </div>

      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}
