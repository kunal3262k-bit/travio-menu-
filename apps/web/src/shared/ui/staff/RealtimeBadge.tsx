"use client";

import { useState, useEffect } from "react";
import type { Socket } from "socket.io-client";

/**
 * Tiny realtime connection indicator for staff panels.
 * Diagnostic + UX: staff can see at a glance whether the panel is live,
 * reconnecting (and auto-reconciling), or offline.
 */
export default function RealtimeBadge({ socket }: { socket: Socket | null }) {
  const [status, setStatus] = useState<"connecting" | "connected" | "reconnecting" | "offline">(
    socket?.connected ? "connected" : "connecting"
  );

  useEffect(() => {
    if (!socket) return;
    const onConnect = () => setStatus("connected");
    const onDisconnect = (reason: string) => setStatus(reason === "io client disconnect" ? "offline" : "reconnecting");
    const onConnectError = () => setStatus("reconnecting");
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [socket]);

  const config = {
    connecting: { dot: "bg-slate-400 animate-pulse", text: "Connecting…", cls: "text-slate-400 border-slate-700" },
    connected: { dot: "bg-emerald-400", text: "Live", cls: "text-emerald-300 border-emerald-500/40" },
    reconnecting: { dot: "bg-amber-400 animate-pulse", text: "Reconnecting…", cls: "text-amber-300 border-amber-500/40" },
    offline: { dot: "bg-red-400", text: "Offline", cls: "text-red-300 border-red-500/40" },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border ${config.cls}`}
      title={status === "connected" ? "Realtime channel active — panel auto-syncs" : "Panel will auto-reconcile when the connection returns"}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.text}
    </span>
  );
}
