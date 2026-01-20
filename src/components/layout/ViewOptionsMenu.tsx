import { Eye, Sun, Moon, Monitor, Type, Layout, Minus, Plus } from "lucide-react";
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
import { useState, useEffect } from "react";

const FONT_SIZE_KEY = "mpcn-font-size";
const LAYOUT_DENSITY_KEY = "mpcn-layout-density";

export function ViewOptionsMenu() {
  const { theme, setTheme } = useTheme();
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

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem(FONT_SIZE_KEY, fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.dataset.density = layoutDensity;
    localStorage.setItem(LAYOUT_DENSITY_KEY, layoutDensity);
  }, [layoutDensity]);

  const handleFontSizeChange = (delta: number) => {
    setFontSize((prev) => Math.max(75, Math.min(150, prev + delta)));
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>View Options</DropdownMenuLabel>
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

        <DropdownMenuSeparator />

        {/* Reset All */}
        <DropdownMenuItem
          onClick={() => {
            setFontSize(100);
            setLayoutDensity("comfortable");
            setTheme("system");
          }}
          className="text-muted-foreground"
        >
          Reset to defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
