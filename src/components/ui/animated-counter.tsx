import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  positiveClassName?: string;
  negativeClassName?: string;
  showSign?: boolean;
}

export function AnimatedCounter({
  value,
  duration = 0.8,
  decimals = 2,
  prefix = "",
  suffix = "",
  className,
  positiveClassName = "text-success",
  negativeClassName = "text-destructive",
  showSign = false,
}: AnimatedCounterProps) {
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });
  
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(value);

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [springValue]);

  const formattedValue = displayValue.toFixed(decimals);
  const sign = showSign && value > 0 ? "+" : "";

  return (
    <motion.span
      className={cn(
        "tabular-nums font-bold",
        value > 0 ? positiveClassName : value < 0 ? negativeClassName : "",
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={Math.sign(value)}
    >
      {prefix}{sign}{formattedValue}{suffix}
    </motion.span>
  );
}

// Simple number counter without spring for smaller numbers
export function SimpleCounter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("tabular-nums", className)}
    >
      {value}
    </motion.span>
  );
}
