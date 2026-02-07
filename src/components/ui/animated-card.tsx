import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, type CardProps } from "./card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  variant?: CardProps["variant"];
  glow?: boolean;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, hover = true, delay = 0, variant = "default", glow = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={hover ? { 
          scale: 1.01,
          y: -2,
        } : undefined}
        whileTap={hover ? { scale: 0.99 } : undefined}
        transition={{ 
          delay, 
          duration: 0.3,
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
        className={cn(
          glow && "card-glow",
          className
        )}
        {...props}
      >
        <Card variant={variant} className="h-full">
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

// Staggered card grid animation wrapper
interface CardGridProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const CardGrid = ({ children, className, staggerDelay = 0.1 }: CardGridProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Grid child wrapper for stagger animation
export const CardGridItem = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

CardGridItem.displayName = "CardGridItem";

// Re-export card parts for convenience
export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
