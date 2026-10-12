"use client";

import { useEffect, useState } from "react";
import { WifiOff, Download, X } from "lucide-react";

export function ServiceWorkerRegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [dismissedInstall, setDismissedInstall] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker in production/modern environments
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Debford PWA Service Worker registered:", reg.scope);
          })
          .catch((err) => {
            console.warn("Debford Service Worker registration failed:", err);
          });
      });
    }

    // 2. Network connectivity listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // 3. PWA install prompt handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  return (
    <>
      {/* Offline Alert Strip */}
      {isOffline && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-amber-500/90 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-2xl backdrop-blur-md border border-amber-300 animate-in fade-in slide-in-from-bottom duration-300">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Offline Mode active — Showroom cached for offline browsing</span>
        </div>
      )}

      {/* PWA App Install Banner (Mobile / Desktop) */}
      {installPrompt && !dismissedInstall && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm p-4 rounded-2xl bg-[#080d16]/95 border border-blue-500/30 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-blue-500/30">
              D
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">Install Debford App</h4>
              <p className="text-[11px] text-slate-400 truncate">Faster browsing & offline garage access</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setDismissedInstall(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
