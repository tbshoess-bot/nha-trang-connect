"use client";

import { useEffect, useState } from "react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show if dismissed
    if (localStorage.getItem("installDismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as { standalone?: boolean }).standalone;
    setIsIOS(ios);

    if (ios) {
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => void });
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem("installDismissed", "1");
    setShow(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-ink-900 text-white rounded-2xl p-4 shadow-xl flex gap-3 items-start">
        <span className="text-3xl leading-none shrink-0">🦁</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight">Add to Home Screen</p>
          {isIOS ? (
            <p className="text-xs text-white/70 mt-0.5 leading-snug">
              Tap <span className="inline-block bg-white/20 rounded px-1">Share</span> then <strong>"Add to Home Screen"</strong> to install the app
            </p>
          ) : (
            <p className="text-xs text-white/70 mt-0.5">Install for faster access</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          {!isIOS && (
            <button
              onClick={install}
              className="bg-gold-400 text-ink-900 text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              Install
            </button>
          )}
          <button
            onClick={dismiss}
            className="text-white/50 text-xs hover:text-white/80 transition text-right"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
