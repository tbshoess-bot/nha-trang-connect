"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Register service worker
    navigator.serviceWorker.register("/sw.js").catch(console.error);

    // Check current permission
    setPermission(Notification.permission);

    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  async function enableNotifications() {
    if (!userId) return;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result !== "granted") return;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscription: sub.toJSON() }),
      });
    } catch (err) {
      console.error("push subscribe error:", err);
    }
  }

  // Don't show if: not supported, already granted, denied, no user, dismissed
  if (!permission || permission === "granted" || permission === "denied") return null;
  if (!userId || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto bg-crimson-500 text-white rounded-2xl p-4 shadow-lg z-50 flex items-start gap-3">
      <span className="text-2xl">🔔</span>
      <div className="flex-1">
        <p className="font-bold text-sm">Enable notifications</p>
        <p className="text-xs text-crimson-100 mt-0.5">
          Get notified when someone answers your question or joins your event.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={enableNotifications}
            className="px-3 py-1.5 bg-gold-400 text-ink-900 rounded-lg text-xs font-bold hover:bg-gold-300 transition"
          >
            Enable
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="px-3 py-1.5 text-crimson-100 hover:text-white text-xs transition"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
