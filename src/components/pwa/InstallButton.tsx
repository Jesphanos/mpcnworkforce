import { Download, Share, Plus, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { toast } from "sonner";

interface InstallButtonProps {
  variant?: "sidebar" | "button";
  className?: string;
}

export function InstallButton({ variant = "button", className }: InstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, isStandalone, install } = usePwaInstall();

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast.success("MPCN installed successfully!", {
        description: "You can now access MPCN from your home screen.",
      });
    }
  };

  // Already installed or running as standalone
  if (isInstalled || isStandalone) {
    if (variant === "sidebar") {
      return (
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-success" />
          <span>App Installed</span>
        </div>
      );
    }
    return null;
  }

  // iOS needs manual installation instructions
  if (isIOS) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {variant === "sidebar" ? (
            <button className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors">
              <Download className="h-4 w-4" />
              <span>Install App</span>
            </button>
          ) : (
            <Button variant="outline" size="sm" className={className}>
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Install MPCN on iOS
            </DialogTitle>
            <DialogDescription>
              Follow these steps to add MPCN to your home screen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Tap the Share button</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Look for the <Share className="h-4 w-4 inline mx-1" /> icon at the bottom of Safari
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Add to Home Screen</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scroll down and tap <Plus className="h-4 w-4 inline mx-1" /> "Add to Home Screen"
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium">Confirm installation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tap "Add" in the top right corner
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Standard install prompt (Chrome, Edge, etc.)
  if (!isInstallable) {
    // Browser doesn't support PWA install or already installed
    return null;
  }

  if (variant === "sidebar") {
    return (
      <button 
        onClick={handleInstall}
        className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-sidebar-accent rounded-md transition-colors"
      >
        <Download className="h-4 w-4" />
        <span>Install App</span>
      </button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleInstall} className={className}>
      <Download className="h-4 w-4 mr-2" />
      Install App
    </Button>
  );
}
