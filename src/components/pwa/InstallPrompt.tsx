import { useState, useEffect } from "react";
import { Download, X, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
  const { isInstallable, isInstalled, isIOS, isStandalone, install } = usePwaInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const wasDismissed = localStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt after a short delay if installable
    if ((isInstallable || isIOS) && !isInstalled && !isStandalone) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isIOS, isStandalone]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if already installed, in standalone mode, or dismissed
  if (isInstalled || isStandalone || dismissed || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <Card variant="elevated" className="border-primary/20 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Install MPCN</CardTitle>
                  <CardDescription className="text-xs">
                    Get the full app experience
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mt-1 -mr-2"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isIOS ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  To install on iOS:
                </p>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">1</span>
                    Tap <Share className="h-4 w-4 inline mx-1" /> Share
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">2</span>
                    Tap <Plus className="h-4 w-4 inline mx-1" /> Add to Home Screen
                  </li>
                </ol>
              </div>
            ) : (
              <Button 
                onClick={handleInstall} 
                className="w-full"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Now
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
