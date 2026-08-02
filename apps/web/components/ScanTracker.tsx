"use client";

import { useEffect } from "react";

export function ScanTracker({ restaurantId, tableId }: { restaurantId: string, tableId: string }) {
  useEffect(() => {
    // Only log once per session to avoid refreshing inflating numbers too much
    const key = `scanned_${tableId}`;
    if (!sessionStorage.getItem(key)) {
      fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, tableId })
      }).catch(console.error);
      sessionStorage.setItem(key, "true");
    }
  }, [restaurantId, tableId]);

  return null;
}
