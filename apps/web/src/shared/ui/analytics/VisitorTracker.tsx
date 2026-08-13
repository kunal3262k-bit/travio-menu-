"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid duplicate tracking for same path in single navigation session
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    // Do not track admin internal API polling routes
    if (pathname?.startsWith("/api/") || pathname?.startsWith("/admin/")) return;

    try {
      const payload = {
        path: pathname,
        referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
        screenWidth: typeof window !== "undefined" ? window.innerWidth : 0,
        timestamp: Date.now(),
      };

      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/track", blob);
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch (_) {}
  }, [pathname]);

  return null;
}
