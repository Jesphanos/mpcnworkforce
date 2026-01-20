import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ["⌘", "K"], description: "Open command palette", category: "Navigation" },
  { keys: ["⌘", "/"], description: "Open keyboard shortcuts", category: "Navigation" },
  { keys: ["G", "H"], description: "Go to dashboard", category: "Navigation" },
  { keys: ["G", "R"], description: "Go to reports", category: "Navigation" },
  { keys: ["G", "P"], description: "Go to profile", category: "Navigation" },
  { keys: ["G", "S"], description: "Go to settings", category: "Navigation" },
  
  // Actions
  { keys: ["N", "R"], description: "New report", category: "Actions" },
  { keys: ["N", "T"], description: "New task", category: "Actions" },
  { keys: ["⌘", "S"], description: "Save changes", category: "Actions" },
  { keys: ["Esc"], description: "Close dialog / Cancel", category: "Actions" },
  
  // Table & Lists
  { keys: ["J"], description: "Move down in list", category: "Table & Lists" },
  { keys: ["K"], description: "Move up in list", category: "Table & Lists" },
  { keys: ["Enter"], description: "Open selected item", category: "Table & Lists" },
  { keys: ["⌘", "A"], description: "Select all", category: "Table & Lists" },
  
  // View
  { keys: ["⌘", "\\"], description: "Toggle sidebar", category: "View" },
  { keys: ["⌘", "D"], description: "Toggle dark mode", category: "View" },
  { keys: ["⌘", "+"], description: "Increase font size", category: "View" },
  { keys: ["⌘", "-"], description: "Decrease font size", category: "View" },
];

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded-md min-w-[24px] inline-flex items-center justify-center">
    {children}
  </kbd>
);

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Navigate and take actions quickly with these shortcuts
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <Kbd>{key}</Kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Press <Kbd>⌘</Kbd> <Kbd>/</Kbd> to open this panel anytime
          </p>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Inline hint for specific shortcuts
interface ShortcutHintProps {
  keys: string[];
  className?: string;
}

export function ShortcutHint({ keys, className }: ShortcutHintProps) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-muted-foreground", className)}>
      {keys.map((key, index) => (
        <span key={index} className="flex items-center gap-0.5">
          <kbd className="px-1.5 py-0.5 text-xs font-medium bg-muted border rounded">
            {key}
          </kbd>
          {index < keys.length - 1 && <span className="text-xs">+</span>}
        </span>
      ))}
    </span>
  );
}
