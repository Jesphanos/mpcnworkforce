import { 
  Eye, 
  Sun, 
  Moon, 
  Monitor, 
  Type, 
  Layout, 
  Minus, 
  Plus,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  AlignJustify,
  Contrast,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

const FONT_SIZE_KEY = "mpcn-font-size";
const LAYOUT_DENSITY_KEY = "mpcn-layout-density";
const REDUCE_MOTION_KEY = "mpcn-reduce-motion";
const HIGH_CONTRAST_KEY = "mpcn-high-contrast";
const LINE_SPACING_KEY = "mpcn-line-spacing";

export function ViewOptionsMenu() {
  const { theme, setTheme } = useTheme();
  const { state: sidebarState, toggleSidebar } = useSidebar();
  
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem(FONT_SIZE_KEY) || "100", 10);
    }
    return 100;
  });
  
  const [layoutDensity, setLayoutDensity] = useState<"comfortable" | "compact" | "spacious">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(LAYOUT_DENSITY_KEY) as "comfortable" | "compact" | "spacious") || "comfortable";
    }
    return "comfortable";
  });

  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REDUCE_MOTION_KEY) === "true";
    }
    return false;
  });

  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(HIGH_CONTRAST_KEY) === "true";
    }
    return false;
  });

  const [lineSpacing, setLineSpacing] = useState<"normal" | "relaxed" | "loose">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(LINE_SPACING_KEY) as "normal" | "relaxed" | "loose") || "normal";
    }
    return "normal";
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem(FONT_SIZE_KEY, fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.dataset.density = layoutDensity;
    localStorage.setItem(LAYOUT_DENSITY_KEY, layoutDensity);
  }, [layoutDensity]);

  useEffect(() => {
    if (reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
    localStorage.setItem(REDUCE_MOTION_KEY, reduceMotion.toString());
  }, [reduceMotion]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    localStorage.setItem(HIGH_CONTRAST_KEY, highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.dataset.lineSpacing = lineSpacing;
    localStorage.setItem(LINE_SPACING_KEY, lineSpacing);
  }, [lineSpacing]);

  const handleFontSizeChange = (delta: number) => {
    setFontSize((prev) => Math.max(75, Math.min(150, prev + delta)));
  };

  const resetAll = () => {
    setFontSize(100);
    setLayoutDensity("comfortable");
    setTheme("system");
    setReduceMotion(false);
    setHighContrast(false);
    setLineSpacing("normal");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="View options"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>View Options</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Sidebar Toggle */}
        <DropdownMenuItem onClick={toggleSidebar}>
          {sidebarState === "expanded" ? (
            <PanelLeftClose className="mr-2 h-4 w-4" />
          ) : (
            <PanelLeft className="mr-2 h-4 w-4" />
          )}
          <span>{sidebarState === "expanded" ? "Collapse Sidebar" : "Expand Sidebar"}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Theme Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {theme === "dark" ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : theme === "light" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Monitor className="mr-2 h-4 w-4" />
            )}
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Font Size */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Type className="mr-2 h-4 w-4" />
            <span>Font Size ({fontSize}%)</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48 p-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleFontSizeChange(-10)}
                disabled={fontSize <= 75}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Slider
                value={[fontSize]}
                onValueChange={([value]) => setFontSize(value)}
                min={75}
                max={150}
                step={5}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleFontSizeChange(10)}
                disabled={fontSize >= 150}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {fontSize < 100 ? "Smaller" : fontSize > 100 ? "Larger" : "Default"}
            </p>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Layout Density */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Layout className="mr-2 h-4 w-4" />
            <span>Layout Density</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setLayoutDensity("compact")}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <div className="h-1 w-6 bg-muted-foreground rounded" />
                  <div className="h-1 w-4 bg-muted-foreground/60 rounded" />
                </div>
                <span>Compact</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayoutDensity("comfortable")}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <div className="h-1.5 w-6 bg-muted-foreground rounded" />
                  <div className="h-1.5 w-4 bg-muted-foreground/60 rounded" />
                </div>
                <span>Comfortable</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLayoutDensity("spacious")}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1.5">
                  <div className="h-2 w-6 bg-muted-foreground rounded" />
                  <div className="h-2 w-4 bg-muted-foreground/60 rounded" />
                </div>
                <span>Spacious</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Line Spacing */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <AlignJustify className="mr-2 h-4 w-4" />
            <span>Line Spacing</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setLineSpacing("normal")}>
              Normal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLineSpacing("relaxed")}>
              Relaxed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLineSpacing("loose")}>
              Loose
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Accessibility Options */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">Accessibility</DropdownMenuLabel>

        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Reduce Motion</span>
            </div>
            <Switch
              checked={reduceMotion}
              onCheckedChange={setReduceMotion}
              className="scale-75"
            />
          </div>
        </div>

        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">High Contrast</span>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={setHighContrast}
              className="scale-75"
            />
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Reset All */}
        <DropdownMenuItem
          onClick={resetAll}
          className="text-muted-foreground"
        >
          Reset to defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
