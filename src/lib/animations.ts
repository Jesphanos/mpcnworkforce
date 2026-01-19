import { Variants } from "framer-motion";
import { ANIMATION } from "./constants";

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION.PAGE_TRANSITION,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: ANIMATION.PAGE_TRANSITION,
      ease: "easeIn",
    },
  },
};

// Stagger children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION.NORMAL,
    },
  },
};

// Card hover effect
export const cardHover: Variants = {
  rest: {
    scale: 1,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    transition: {
      duration: ANIMATION.FAST,
    },
  },
};

// Fade in up animation
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION.NORMAL,
    },
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -30,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION.NORMAL,
    },
  },
};

// Slide in from right
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 30,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION.NORMAL,
    },
  },
};

// Scale in animation
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION.FAST,
    },
  },
};

// Pulse animation for notifications
export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

// Skeleton shimmer effect (CSS-based, use with className)
export const shimmerClass = "animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:400%_100%]";

// List item animations
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: ANIMATION.NORMAL,
    },
  }),
};

// Button tap animation
export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

// Modal/Dialog animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION.FAST,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: ANIMATION.FAST,
      ease: "easeIn",
    },
  },
};

// Overlay backdrop
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: ANIMATION.FAST },
  },
  exit: {
    opacity: 0,
    transition: { duration: ANIMATION.FAST },
  },
};

// Tab content transitions
export const tabContentVariants: Variants = {
  initial: { opacity: 0, x: 10 },
  enter: {
    opacity: 1,
    x: 0,
    transition: { duration: ANIMATION.FAST },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: ANIMATION.FAST },
  },
};

// Number counter animation helper
export const countUp = (target: number, duration: number = 1000) => ({
  initial: { count: 0 },
  animate: {
    count: target,
    transition: { duration: duration / 1000 },
  },
});

// Chart bar animation
export const chartBarVariants: Variants = {
  initial: { scaleY: 0, originY: 1 },
  animate: (i: number) => ({
    scaleY: 1,
    transition: {
      delay: i * 0.05,
      duration: ANIMATION.SLOW,
      ease: "easeOut",
    },
  }),
};

// Progress bar animation
export const progressVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: 1,
    transition: {
      duration: ANIMATION.SLOW,
      ease: "easeOut",
    },
  },
};
