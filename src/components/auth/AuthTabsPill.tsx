/**
 * MPCN Auth Tabs - Pill Style
 * Modern pill-style tabs for Login/Sign Up toggle
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthTabsPillProps {
  activeTab: "login" | "signup";
  onTabChange: (tab: "login" | "signup") => void;
}

export function AuthTabsPill({ activeTab, onTabChange }: AuthTabsPillProps) {
  return (
    <div className="relative flex p-1 bg-muted/50 rounded-full border border-border/50">
      {/* Animated background pill */}
      <motion.div
        className="absolute inset-y-1 rounded-full bg-primary shadow-md"
        initial={false}
        animate={{
          x: activeTab === "login" ? 4 : "calc(100% - 4px)",
          width: "calc(50% - 4px)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        style={{
          left: 0,
        }}
      />

      <button
        type="button"
        onClick={() => onTabChange("login")}
        className={cn(
          "relative z-10 flex-1 py-2.5 px-6 text-sm font-medium rounded-full transition-colors",
          activeTab === "login" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => onTabChange("signup")}
        className={cn(
          "relative z-10 flex-1 py-2.5 px-6 text-sm font-medium rounded-full transition-colors",
          activeTab === "signup" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Sign Up
      </button>
    </div>
  );
}
