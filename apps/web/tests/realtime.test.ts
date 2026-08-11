import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Realtime reliability layer tests.
 * Fake socket.io client: proves rooms are re-joined on every connect,
 * reconciliation runs on connect/visibility/online, duplicate events are
 * dropped, and stale fetch responses can never overwrite newer state.
 */

type Listener = (...args: any[]) => void;

class FakeSocket {
  connected = false;
  private listeners = new Map<string, Set<Listener>>();
  emitted: Array<{ event: string; args: any[] }> = [];

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return this;
  }
  off(event: string, fn: Listener) {
    this.listeners.get(event)?.delete(fn);
    return this;
  }
  emit(event: string, ...args: any[]) {
    this.emitted.push({ event, args });
    return this;
  }
  disconnect() {
    this.connected = false;
    this.fire("disconnect", "io client disconnect");
  }
  fire(event: string, ...args: any[]) {
    for (const fn of [...(this.listeners.get(event) ?? [])]) fn(...args);
  }
}

let createdSockets: FakeSocket[];
const ioMock = vi.fn(() => {
  const s = new FakeSocket();
  createdSockets.push(s);
  return s;
});

vi.mock("socket.io-client", () => ({
  io: ioMock,
}));

const { createRealtimeSocket, createReconcileGuard } = await import("../src/shared/utils/realtime");

beforeEach(() => {
  vi.clearAllMocks();
  createdSockets = [];
});

describe("createRealtimeSocket — reconnect lifecycle", () => {
  it("re-joins ALL rooms on the initial connect", () => {
    const rt = createRealtimeSocket({
      rooms: () => ["kitchen_r1", "admin_r1"],
      onReconcile: () => {},
    });
    const socket = createdSockets[0];
    expect(ioMock).toHaveBeenCalledOnce();
    socket.fire("connect");
    expect(socket.emitted.filter((e) => e.event === "join_room").map((e) => e.args[0])).toEqual([
      "kitchen_r1",
      "admin_r1",
    ]);
    rt.disconnect();
  });

  it("BUG-FIX: re-joins rooms AFTER a reconnect (the production stale-panel bug)", () => {
    const rt = createRealtimeSocket({
      rooms: () => ["kitchen_r1", "admin_r1"],
      onReconcile: () => {},
    });
    const socket = createdSockets[0];
    socket.fire("connect");
    // Temporary drop: server-side rooms are lost on every new server socket.
    socket.fire("disconnect", "transport close");
    socket.fire("connect");
    const joins = socket.emitted.filter((e) => e.event === "join_room").map((e) => e.args[0]);
    expect(joins).toEqual(["kitchen_r1", "admin_r1", "kitchen_r1", "admin_r1"]);
    rt.disconnect();
  });

  it("runs reconciliation on every connect and on manual reconcile", () => {
    const onReconcile = vi.fn();
    const rt = createRealtimeSocket({ rooms: () => ["kitchen_r1"], onReconcile });
    const socket = createdSockets[0];
    socket.fire("connect");
    socket.fire("disconnect", "transport close");
    socket.fire("connect");
    rt.reconcile();
    expect(onReconcile).toHaveBeenCalledTimes(3);
    rt.disconnect();
  });

  it("routes events only to registered handlers and supports unsubscribe", () => {
    const rt = createRealtimeSocket({ rooms: () => ["waiter_r1"], onReconcile: () => {} });
    const socket = createdSockets[0];
    const handler = vi.fn();
    const unsub = rt.on("new_order", handler);
    socket.fire("new_order", { orderId: "o1", ts: 100 });
    expect(handler).toHaveBeenCalledTimes(1);
    unsub();
    socket.fire("new_order", { orderId: "o2", ts: 101 });
    expect(handler).toHaveBeenCalledTimes(1);
    rt.disconnect();
  });
});

describe("createRealtimeSocket — duplicate event protection (idempotency)", () => {
  it("drops an identical event delivered twice (overlapping rooms)", () => {
    const rt = createRealtimeSocket({ rooms: () => [], onReconcile: () => {} });
    const socket = createdSockets[0];
    const handler = vi.fn();
    rt.on("kitchen_new_order", handler);
    const payload = { orderId: "o1", ts: 5000 };
    socket.fire("kitchen_new_order", payload); // delivered via kitchen_ room
    socket.fire("kitchen_new_order", { ...payload }); // same event via admin_ room
    expect(handler).toHaveBeenCalledTimes(1);
    rt.disconnect();
  });

  it("does NOT drop a genuinely new event for the same order", () => {
    const rt = createRealtimeSocket({ rooms: () => [], onReconcile: () => {} });
    const socket = createdSockets[0];
    const handler = vi.fn();
    rt.on("kitchen_order_status_changed", handler);
    socket.fire("kitchen_order_status_changed", { orderId: "o1", status: "PREPARING", ts: 1000 });
    socket.fire("kitchen_order_status_changed", { orderId: "o1", status: "READY", ts: 1001 });
    expect(handler).toHaveBeenCalledTimes(2);
    rt.disconnect();
  });

  it("does not conflate different event types that share an entity", () => {
    const rt = createRealtimeSocket({ rooms: () => [], onReconcile: () => {} });
    const socket = createdSockets[0];
    const a = vi.fn();
    const b = vi.fn();
    rt.on("payment_claimed", a);
    rt.on("waiter_request", b);
    const shared = { tableId: "t1", ts: 777 };
    socket.fire("payment_claimed", shared);
    socket.fire("waiter_request", { ...shared, id: "req-1", requestType: "CALL_WAITER", status: "OPEN" });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    rt.disconnect();
  });
});

describe("createReconcileGuard — stale-fetch protection", () => {
  it("coalesces a burst of triggers into a single trailing fetch", async () => {
    vi.useFakeTimers();
    try {
      const fetchFn = vi.fn(async () => ({ orders: ["a"] }));
      const apply = vi.fn();
      const guard = createReconcileGuard(fetchFn, apply, 200);
      guard.run();
      guard.run();
      guard.run();
      expect(fetchFn).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(200);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      await Promise.resolve();
      expect(apply).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("discards a stale response that resolves after a newer one", async () => {
    vi.useFakeTimers();
    try {
      let resolveOld: (v: any) => void;
      const oldPromise = new Promise((r) => (resolveOld = r));
      const fetchFn = vi
        .fn()
        .mockImplementationOnce(() => oldPromise) // first (older) request
        .mockResolvedValueOnce({ orders: ["NEW"] }); // second (newer) request
      const apply = vi.fn();
      const guard = createReconcileGuard(fetchFn, apply, 200);

      guard.run();
      await vi.advanceTimersByTimeAsync(200); // request 1 in flight
      guard.run();
      await vi.advanceTimersByTimeAsync(200); // request 2 starts + resolves
      expect(apply).toHaveBeenCalledWith({ orders: ["NEW"] });

      resolveOld!({ orders: ["OLD"] });
      await Promise.resolve();
      // The older snapshot must NOT overwrite the newer state.
      expect(apply).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not apply a failed fetch", async () => {
    vi.useFakeTimers();
    try {
      const fetchFn = vi.fn().mockRejectedValue(new Error("network down"));
      const apply = vi.fn();
      const guard = createReconcileGuard(fetchFn, apply, 200);
      guard.run();
      await vi.advanceTimersByTimeAsync(200);
      await Promise.resolve();
      expect(apply).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
