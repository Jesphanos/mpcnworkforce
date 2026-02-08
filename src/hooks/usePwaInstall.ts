import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  install: () => Promise<boolean>;
}

export function usePwaInstall(): PwaInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Detect if running as standalone PWA
  const isStandalone = 
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://");

  useEffect(() => {
    console.log('[PWA Hook] Initializing - isStandalone:', isStandalone, 'isIOS:', isIOS);
    
    // Check if already installed
    if (isStandalone) {
      console.log('[PWA Hook] Already running as standalone app');
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA Hook] beforeinstallprompt event fired!');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log('[PWA Hook] Deferred prompt stored - app is now installable');
    };

    const handleAppInstalled = () => {
      console.log('[PWA Hook] App installed successfully!');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    
    console.log('[PWA Hook] Event listeners attached, waiting for beforeinstallprompt...');

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone, isIOS]);

  const install = useCallback(async (): Promise<boolean> => {
    console.log('[PWA Hook] Install called - deferredPrompt exists:', !!deferredPrompt);
    
    if (!deferredPrompt) {
      console.warn('[PWA Hook] No deferred prompt available');
      return false;
    }

    try {
      // Show the install prompt
      console.log('[PWA Hook] Calling prompt()...');
      await deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA Hook] User choice outcome:', outcome);
      
      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("[PWA Hook] Install error:", error);
      return false;
    }
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isStandalone,
    install,
  };
}
