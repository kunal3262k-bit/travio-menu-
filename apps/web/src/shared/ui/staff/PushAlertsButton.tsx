"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import {
  disablePushAlerts,
  enablePushAlerts,
  isPushSupported,
  pushEnabledKey,
} from "@/lib/pushClient";

type Props = {
  restaurantSlug: string;
  role: "WAITER" | "KITCHEN";
};

/**
 * Staff-only toggle for background Web Push alerts (closed/locked tab).
 * Foreground Socket.IO ringing is untouched — this is strictly additive.
 * Enabling requires a user gesture (click) — never auto-prompts on load.
 */
export function PushAlertsButton({ restaurantSlug, role }: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isPushSupported());
    try {
      setEnabled(localStorage.getItem(pushEnabledKey(restaurantSlug, role)) === "true");
    } catch {
      setEnabled(false);
    }
  }, [restaurantSlug, role]);

  if (supported === false) return null;

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (enabled) {
        const res = await disablePushAlerts();
        if (!res.ok) {
          setError(res.error ?? "Failed to disable push alerts.");
          return;
        }
        setEnabled(false);
        try {
          localStorage.removeItem(pushEnabledKey(restaurantSlug, role));
        } catch {}
      } else {
        const res = await enablePushAlerts();
        if (!res.ok) {
          setError(res.error ?? "Failed to enable push alerts.");
          return;
        }
        setEnabled(true);
        try {
          localStorage.setItem(pushEnabledKey(restaurantSlug, role), "true");
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => void handleToggle()}
        disabled={loading}
        title={
          enabled
            ? "Background push alerts are on. Click to turn off."
            : "Get notified even when this page is closed or locked. Click to enable."
        }
        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
          enabled
            ? "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/40"
            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : enabled ? (
          <BellOff className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {loading ? "Working…" : enabled ? "Push Alerts: ON" : "Enable Push Alerts"}
      </button>
      {error && <span className="text-xs text-red-400 max-w-[240px] leading-tight">{error}</span>}
    </div>
  );
}
