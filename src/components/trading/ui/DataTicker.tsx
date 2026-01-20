import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DataTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  showChange?: boolean;
  previousValue?: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function DataTicker({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  showChange = false,
  previousValue,
  size = "md",
  showIcon = true,
}: DataTickerProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isIncreasing, setIsIncreasing] = useState<boolean | null>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const prev = previousValue ?? prevValueRef.current;
    if (value !== prev) {
      setIsIncreasing(value > prev);
      
      // Animate the value change
      const duration = 300;
      const startTime = Date.now();
      const startValue = displayValue;
      const endValue = value;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        
        setDisplayValue(startValue + (endValue - startValue) * easeProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
      prevValueRef.current = value;

      // Reset color after animation
      setTimeout(() => setIsIncreasing(null), 1000);
    }
  }, [value, previousValue, displayValue]);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  const formattedValue = displayValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div className="flex items-center gap-1.5">
      {showIcon && isIncreasing !== null && (
        <span
          className={cn(
            "transition-colors duration-300",
            isIncreasing ? "text-trading-positive" : "text-trading-negative"
          )}
          style={{
            color: isIncreasing
              ? "hsl(var(--trading-positive))"
              : "hsl(var(--trading-negative))",
          }}
        >
          {isIncreasing ? (
            <TrendingUp className={iconSizes[size]} />
          ) : (
            <TrendingDown className={iconSizes[size]} />
          )}
        </span>
      )}
      <span
        className={cn(
          "font-bold tracking-tight transition-colors duration-300",
          sizeClasses[size],
          isIncreasing === true && "text-trading-positive",
          isIncreasing === false && "text-trading-negative"
        )}
        style={{
          color:
            isIncreasing === true
              ? "hsl(var(--trading-positive))"
              : isIncreasing === false
              ? "hsl(var(--trading-negative))"
              : undefined,
        }}
      >
        {prefix}
        {formattedValue}
        {suffix}
      </span>
      {showChange && previousValue !== undefined && (
        <span
          className={cn(
            "text-xs font-medium",
            value >= previousValue ? "text-trading-positive" : "text-trading-negative"
          )}
          style={{
            color:
              value >= previousValue
                ? "hsl(var(--trading-positive))"
                : "hsl(var(--trading-negative))",
          }}
        >
          ({value >= previousValue ? "+" : ""}
          {((value - previousValue) / Math.abs(previousValue || 1) * 100).toFixed(1)}%)
        </span>
      )}
    </div>
  );
}
