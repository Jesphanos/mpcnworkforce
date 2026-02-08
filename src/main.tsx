import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker for PWA installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

// Log manifest loading
fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => {
    console.log('[PWA] Manifest loaded:', manifest.name, '- Icons:', manifest.icons?.length || 0);
  })
  .catch(error => {
    console.error('[PWA] Manifest load failed:', error);
  });

createRoot(document.getElementById("root")!).render(<App />);
