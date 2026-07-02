"use client";

import { useEffect, useState } from "react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("installDismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as { standalone?: boolean }).standalone;
    setIsIOS(ios);

    if (ios) {
      setTimeout(() => setShow(true), 1500);
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
    <>
      {/* Backdrop to catch taps */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={dismiss}
        style={{ background: "transparent" }}
      />
      <div
        className="fixed left-4 right-4 z-[9999] max-w-sm mx-auto"
        style={{ bottom: "env(safe-area-inset-bottom, 16px)", marginBottom: 16 }}
      >
        <div className="bg-ink-900 text-white rounded-2xl p-4 shadow-2xl">
          <div className="flex gap-3 items-center mb-3">
            <span className="text-3xl leading-none shrink-0">🦁</span>
            <div>
              <p className="font-bold text-sm">Add to Home Screen</p>
              {isIOS ? (
                <p className="text-xs text-white/70 mt-0.5 leading-snug">
                  Tap <strong>Share</strong> (box with arrow ↑) then <strong>"Add to Home Screen"</strong>
                </p>
              ) : (
                <p className="text-xs text-white/70 mt-0.5">Install for faster access</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!isIOS && (
              <button
                onClick={install}
                className="flex-1 bg-gold-400 text-ink-900 text-sm font-bold py-2.5 rounded-xl"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Install app
              </button>
            )}
            <button
              onClick={dismiss}
              className="flex-1 bg-white/15 text-white text-sm font-medium py-2.5 rounded-xl"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {isIOS ? "Got it" : "Not now"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
