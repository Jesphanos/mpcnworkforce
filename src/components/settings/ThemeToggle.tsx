import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { memo } from "react";

export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          Appearance
        </CardTitle>
        <CardDescription>
          Customize how the application looks on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <Label>Theme</Label>
            <p className="text-sm text-muted-foreground">
              Select your preferred color scheme
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-[130px] justify-between">
                {theme === "light" && (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </>
                )}
                {theme === "dark" && (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </>
                )}
                {theme === "system" && (
                  <>
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="h-4 w-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Theme Preview Cards */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`relative rounded-lg border-2 p-4 transition-all ${
              theme === "light" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="space-y-2">
              <div className="h-6 w-full rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted-foreground/20" />
              <div className="h-3 w-1/2 rounded bg-muted-foreground/20" />
            </div>
            <span className="mt-2 block text-xs font-medium">Light</span>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`relative rounded-lg border-2 p-4 transition-all ${
              theme === "dark" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="space-y-2 bg-sidebar rounded p-2">
              <div className="h-4 w-full rounded bg-sidebar-accent" />
              <div className="h-2 w-3/4 rounded bg-sidebar-border" />
              <div className="h-2 w-1/2 rounded bg-sidebar-border" />
            </div>
            <span className="mt-2 block text-xs font-medium">Dark</span>
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`relative rounded-lg border-2 p-4 transition-all ${
              theme === "system" ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground/50"
            }`}
          >
            <div className="space-y-2 bg-gradient-to-r from-muted to-sidebar rounded p-2">
              <div className="h-4 w-full rounded bg-gradient-to-r from-muted-foreground/20 to-sidebar-accent" />
              <div className="h-2 w-3/4 rounded bg-gradient-to-r from-muted-foreground/30 to-sidebar-border" />
            </div>
            <span className="mt-2 block text-xs font-medium">System</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
});
