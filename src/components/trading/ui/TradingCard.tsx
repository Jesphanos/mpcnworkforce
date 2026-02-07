import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TradingCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "positive" | "negative" | "neutral" | "accent";
  variant?: "default" | "glass" | "terminal" | "institutional";
  animate?: boolean;
}

const glowColors = {
  positive: "trading-glow-positive",
  negative: "trading-glow-negative",
  neutral: "trading-glow",
  accent: "trading-glow",
};

export function TradingCard({
  children,
  className,
  glowColor,
  variant = "default",
  animate = false,
}: TradingCardProps) {
  const baseClasses = "rounded-xl border transition-all duration-300";
  
  const variantClasses = {
    default: "bg-card border-border shadow-sm hover:shadow-md",
    glass: "glassmorphism",
    terminal: "trading-card bg-trading-card border-border/30",
    institutional: "bg-card border-border shadow-md hover:shadow-lg hover:-translate-y-0.5 ring-1 ring-border/50",
  };

  const Component = animate ? motion.div : "div";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
        whileHover: { scale: 1.01, y: -2 },
      }
    : {};

  return (
    <Component
      className={cn(
        baseClasses,
        variantClasses[variant],
        glowColor && glowColors[glowColor],
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  );
}

export function TradingCardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-4 pb-2", className)}>
      {children}
    </div>
  );
}

export function TradingCardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-4 pt-2", className)}>
      {children}
    </div>
  );
}

export function TradingCardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-sm font-medium text-muted-foreground", className)}>
      {children}
    </h3>
  );
}

export function TradingCardValue({
  children,
  className,
  positive,
  negative,
}: {
  children: ReactNode;
  className?: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={cn(
        "text-2xl font-bold tracking-tight animate-number-slide",
        positive && "text-trading-positive",
        negative && "text-trading-negative",
        !positive && !negative && "text-foreground",
        className
      )}
      style={{
        color: positive
          ? "hsl(var(--trading-positive))"
          : negative
          ? "hsl(var(--trading-negative))"
          : undefined,
      }}
    >
      {children}
    </div>
  );
}
