import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import { cardHover, fadeInUp } from "@/lib/animations";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, hover = true, delay = 0, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={hover ? { scale: 1.02 } : undefined}
        transition={{ delay, duration: 0.3 }}
        className={cn("", className)}
        {...props}
      >
        <Card className="h-full">{children}</Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

// Re-export card parts for convenience
export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
