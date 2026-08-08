"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export function useScreenWakeLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const wakeLockSentinelRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    try {
      if (wakeLockSentinelRef.current && !wakeLockSentinelRef.current.released) {
        setIsWakeLockActive(true);
        return;
      }

      const sentinel = await (navigator as any).wakeLock.request("screen");
      wakeLockSentinelRef.current = sentinel;
      setIsWakeLockActive(true);

      sentinel.addEventListener("release", () => {
        setIsWakeLockActive(false);
      });
    } catch (err: any) {
      console.warn("Screen Wake Lock request failed:", err?.message || err);
      setIsWakeLockActive(false);
    }
  }, []);

  useEffect(() => {
    void requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockSentinelRef.current && !wakeLockSentinelRef.current.released) {
        wakeLockSentinelRef.current.release().catch(() => {});
      }
    };
  }, [requestWakeLock]);

  return { isSupported, isWakeLockActive, requestWakeLock };
}
