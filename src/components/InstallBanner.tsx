"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show if dismissed recently
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // iOS detection (no beforeinstallprompt support)
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    if (isiOS) {
      setIsIos(true);
      setShowBanner(true);
      return;
    }

    // Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", String(Date.now()));
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        zIndex: 100,
        padding: "12px 16px",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderTop: "0.5px solid rgba(60,60,67,0.12)",
        animation: "slideUp 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src="/icons/icon-192.png"
          alt="Singles"
          style={{ width: 48, height: 48, borderRadius: 12 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#000", margin: 0 }}>
            Install Singles
          </p>
          <p style={{ fontSize: 13, color: "rgba(60,60,67,0.5)", margin: "2px 0 0", lineHeight: "16px" }}>
            {isIos
              ? "Tap Share, then \"Add to Home Screen\""
              : "Add to your home screen for quick access"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleDismiss}
            style={{
              fontSize: 14, fontWeight: 500, color: "rgba(60,60,67,0.5)",
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 4px",
            }}
          >
            Later
          </button>
          {!isIos && (
            <button
              onClick={handleInstall}
              style={{
                fontSize: 14, fontWeight: 600, color: "#fff",
                background: "#007AFF", border: "none", borderRadius: 100,
                padding: "8px 18px", cursor: "pointer",
              }}
            >
              Install
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); }
          to { transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
