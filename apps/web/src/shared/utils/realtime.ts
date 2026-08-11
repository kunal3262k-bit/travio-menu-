/**
 * Client-side realtime reliability layer (browser only — never import server
 * code from here).
 *
 * PROBLEM IT FIXES (production bug: staff panels went stale until manual
 * refresh):
 *  1. Socket.IO rooms are NOT persisted server-side across reconnects. The old
 *     code emitted `join_room` once at mount; after any temporary disconnect
 *     the client reconnected with a brand-new server socket that was in NO
 *     rooms, so it received zero events until a manual page refresh.
 *  2. There was no reconciliation after reconnect / visibility / online, so
 *     events emitted during the disconnect gap were lost forever.
 *  3. Concurrent unguarded refetches could resolve out of order and a stale
 *     snapshot could overwrite newer UI state.
 *  4. Clients joined both `kitchen_` and `admin_` rooms while the server emits
 *     the same event to both → every event was delivered twice (double
 *     refetch, duplicate alerts, duplicate notifications).
 *
 * DESIGN (matches the authoritative model):
 *   DATABASE = source of truth
 *   Socket.IO = low-latency change notification
 *   REST/API = authoritative reconciliation
 *
 *   socket event → update UI immediately → reconcile authoritative state
 *
 *   Reconciliation triggers: socket connect (initial AND every reconnect),
 *   browser becomes visible, browser comes back online, panel mount.
 */

import { io, Socket } from "socket.io-client";

export type RealtimeSocket = {
  socket: Socket;
  /** True when the transport is currently connected. */
  connected: boolean;
  /**
   * Registers a handler with duplicate-event protection. Server emits carry a
   * `ts` (emit timestamp); an event whose (event, entityId, ts, payload) was
   * already handled is dropped — this neutralizes double delivery through
   * overlapping rooms and replayed events.
   */
  on: (event: string, handler: (payload: any) => void) => () => void;
  /** Forces an immediate authoritative reconciliation + room re-join. */
  reconcile: () => void;
  disconnect: () => void;
  /** Diagnostic counters (Phase 3 instrumentation, dev-facing only). */
  diagnostics: {
    eventsReceived: number;
    eventsDeduped: number;
    reconnects: number;
    reconciles: number;
  };
};

const DEBUG =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_REALTIME_DEBUG === "1";

function debug(...args: unknown[]) {
  if (DEBUG) console.info("[realtime]", ...args);
}

function entityKey(payload: any): string {
  if (!payload || typeof payload !== "object") return "";
  return (
    payload.orderId ??
    payload.requestId ??
    payload.id ??
    payload.tableId ??
    payload.order ?? ""
  );
}

/**
 * Factory that creates a resilient socket. Rooms are re-joined on EVERY
 * `connect` (initial + reconnect), and `onReconcile` runs on every connect so
 * the authoritative API state is re-synced after any gap.
 */
export function createRealtimeSocket(options: {
  rooms: () => string[];
  onReconcile: () => void;
}): RealtimeSocket {
  const socket = io({
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    timeout: 15000,
  });

  let connected = false;
  let lastConnectedAt = 0;
  const seen = new Set<string>();
  const diagnostics = { eventsReceived: 0, eventsDeduped: 0, reconnects: 0, reconciles: 0 };

  const joinAllRooms = () => {
    for (const room of options.rooms()) {
      socket.emit("join_room", room);
      debug("join_room", room);
    }
  };

  const handleConnect = () => {
    const wasReconnect = connected;
    connected = true;
    if (wasReconnect) {
      diagnostics.reconnects += 1;
      debug("reconnected after gap — re-joining rooms + reconciling");
    } else {
      debug("connected (initial) — joining rooms + reconciling");
    }
    joinAllRooms();
    diagnostics.reconciles += 1;
    options.onReconcile();
  };

  socket.on("connect", handleConnect);
  socket.on("disconnect", (reason) => {
    connected = false;
    debug("disconnected", reason);
  });
  socket.on("connect_error", (err) => {
    debug("connect_error", err.message);
  });

  return {
    socket,
    connected,
    on: (event, handler) => {
      const wrapped = (payload: any) => {
        diagnostics.eventsReceived += 1;
        const ts = typeof payload?.ts === "number" ? payload.ts : lastConnectedAt;
        const key = `${event}|${entityKey(payload)}|${ts}|${JSON.stringify(payload ?? null)}`;
        if (seen.has(key)) {
          diagnostics.eventsDeduped += 1;
          debug("dropped duplicate event", event, key);
          return;
        }
        seen.add(key);
        handler(payload);
      };
      socket.on(event, wrapped);
      return () => {
        socket.off(event, wrapped);
      };
    },
    reconcile: () => {
      debug("manual reconcile");
      if (connected) joinAllRooms();
      diagnostics.reconciles += 1;
      options.onReconcile();
    },
    disconnect: () => {
      socket.disconnect();
    },
    diagnostics,
  };
}

/**
 * Debounced + stale-guarded reconciliation runner.
 *
 *  - `fetchFn()` performs the authoritative REST fetch and RETURNS the data
 *    (it must not mutate state itself).
 *  - `apply(data)` applies the data to React state — it only runs when this
 *    run is still the LATEST: bursts of events (duplicate deliveries, connect
 *    + visibility storms) coalesce into a single trailing fetch, and an older
 *    in-flight response that resolves after a newer one is discarded, so a
 *    stale REST snapshot can never overwrite newer socket-driven UI state.
 */
export function createReconcileGuard<T = unknown>(
  fetchFn: () => Promise<T | null>,
  apply: (data: T | null) => void,
  debounceMs = 200
) {
  let seq = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const run = () => {
    seq += 1;
    const mySeq = seq;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      Promise.resolve(fetchFn())
        .then((data) => {
          if (mySeq !== seq) {
            debug("discarded stale reconcile response", mySeq, "vs", seq);
            return;
          }
          apply(data);
        })
        .catch(() => {});
    }, debounceMs);
  };

  return { run };
}

/**
 * Binds the standard reconciliation triggers: visibilitychange → visible,
 * window online, and page focus. Returns a cleanup function.
 */
export function bindReconcileTriggers(onReconcile: () => void): () => void {
  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      debug("visibilitychange → visible — reconciling");
      onReconcile();
    }
  };
  const onOnline = () => {
    debug("online event — reconciling");
    onReconcile();
  };
  const onFocus = () => {
    debug("focus event — reconciling");
    onReconcile();
  };
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("online", onOnline);
  window.addEventListener("focus", onFocus);
  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("focus", onFocus);
  };
}
