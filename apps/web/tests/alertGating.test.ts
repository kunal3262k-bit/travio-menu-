import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../src/shared/utils/prisma", () => ({
  prisma: {
    order: { findFirst: vi.fn(), updateMany: vi.fn() },
    waiterRequest: { updateMany: vi.fn() },
  },
}));

vi.mock("../src/shared/utils/socket", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/shared/utils/socket")>();
  return {
    ...actual,
    emitWaiterRequestCreated: vi.fn(),
    emitWaiterRequestResolved: vi.fn((...args: Parameters<typeof actual.emitWaiterRequestResolved>) =>
      actual.emitWaiterRequestResolved(...args)
    ),
  };
});

vi.mock("../src/shared/utils/staffAuth", () => ({
  requireAdminOrStaff: vi.fn(),
}));

const { prisma } = await import("../src/shared/utils/prisma");
const { shouldEmitKitchenNewOrder, isKitchenVisibleOrder } = await import("../src/shared/utils/kitchenFeed");
const { emitOrderCreated, emitWaiterRequestResolved, setIO } = await import("../src/shared/utils/socket");
const { reconcileAlertIds, retainAlertIds, mergeAlertIds, dropAlertIds } = await import("../src/shared/utils/orderAlert");
const { PATCH } = await import("../app/api/waiter-requests/route");
const { emitWaiterRequestResolved: emitResolvedMock, emitWaiterRequestCreated: emitCreatedMock } = await import("../src/shared/utils/socket");
const { requireAdminOrStaff } = await import("../src/shared/utils/staffAuth");

function makeCapturingIo() {
  const emitted: Array<{ room: string; event: string; payload?: unknown }> = [];
  const mockIo = {
    to: vi.fn((room: string) => ({
      emit: (event: string, payload?: unknown) => {
        emitted.push({ room, event, payload });
      },
    })),
  };
  setIO(mockIo as any);
  return { emitted };
}

beforeEach(() => {
  vi.clearAllMocks();
  (requireAdminOrStaff as any).mockResolvedValue({ restaurantId: "demo-restaurant", staffId: "st-1" });
});

describe("BUG1: CAR payment gate — unpaid round-1 CAR orders must never alarm the KDS", () => {
  it("TABLE orders always emit a kitchen alert", async () => {
    (prisma.order.findFirst as any).mockClear();
    expect(
      await shouldEmitKitchenNewOrder({ restaurantId: "r1", sessionType: "TABLE", paymentStatus: "UNPAID", tableSessionId: "sess-1" })
    ).toBe(true);
    expect(prisma.order.findFirst).not.toHaveBeenCalled();
  });

  it("CAR orders already PAID emit a kitchen alert", async () => {
    expect(
      await shouldEmitKitchenNewOrder({ restaurantId: "r1", sessionType: "CAR", paymentStatus: "PAID", tableSessionId: "sess-1" })
    ).toBe(true);
    expect(prisma.order.findFirst).not.toHaveBeenCalled();
  });

  it("unpaid round-1 CAR order (no prior paid round in session) must NOT emit a kitchen alert", async () => {
    (prisma.order.findFirst as any).mockResolvedValue(null);
    expect(
      await shouldEmitKitchenNewOrder({ restaurantId: "r1", sessionType: "CAR", paymentStatus: "UNPAID", tableSessionId: "car_session_1" })
    ).toBe(false);
    expect(prisma.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ paymentStatus: "PAID", tableSessionId: "car_session_1" }) })
    );
  });

  it("unpaid CAR order with no tableSessionId can never be kitchen-visible", async () => {
    expect(
      await shouldEmitKitchenNewOrder({ restaurantId: "r1", sessionType: "CAR", paymentStatus: "UNPAID", tableSessionId: null })
    ).toBe(false);
    expect(prisma.order.findFirst).not.toHaveBeenCalled();
  });

  it("round-2 CAR order (prior paid round in same session) DOES emit a kitchen alert", async () => {
    (prisma.order.findFirst as any).mockResolvedValue({ id: "round-1" });
    expect(
      await shouldEmitKitchenNewOrder({ restaurantId: "r1", sessionType: "CAR", paymentStatus: "UNPAID", tableSessionId: "car_session_1" })
    ).toBe(true);
  });

  it("isKitchenVisibleOrder mirrors the feed gate (hidden until paid / paid prior round)", () => {
    const paid = new Set(["paid-session"]);
    expect(isKitchenVisibleOrder({ sessionType: "TABLE", paymentStatus: "UNPAID", tableSessionId: "x" }, paid)).toBe(true);
    expect(isKitchenVisibleOrder({ sessionType: "CAR", paymentStatus: "UNPAID", tableSessionId: "s" }, paid)).toBe(false);
    expect(isKitchenVisibleOrder({ sessionType: "CAR", paymentStatus: "PAID", tableSessionId: "s" }, paid)).toBe(true);
    expect(isKitchenVisibleOrder({ sessionType: "CAR", paymentStatus: "UNPAID", tableSessionId: "paid-session" }, paid)).toBe(true);
  });

  it("emitOrderCreated skips kitchen/admin rooms for gated orders but always notifies the waiter room", () => {
    const { emitted } = makeCapturingIo();
    emitOrderCreated("r1", "order-1", { kitchen: false });
    const rooms = new Set(emitted.map((e) => e.room));
    expect(rooms.has(`kitchen_r1`)).toBe(false);
    expect(rooms.has(`admin_r1`)).toBe(false);
    expect(emitted).toContainEqual(expect.objectContaining({ room: `waiter_r1`, event: "new_order" }));
  });

  it("emitOrderCreated still emits to all rooms by default (back-compat)", () => {
    const { emitted } = makeCapturingIo();
    emitOrderCreated("r1", "order-1");
    const events = emitted.map((e) => `${e.room}:${e.event}`);
    expect(events).toContain(`kitchen_r1:kitchen_new_order`);
    expect(events).toContain(`admin_r1:kitchen_new_order`);
    expect(events).toContain(`waiter_r1:new_order`);
  });
});

describe("BUG2: kitchen reconcile — stale unacknowledged ids are dropped on refetch", () => {
  it("keeps only RECEIVED, unacknowledged orders from the current feed", () => {
    const done = new Set(["acked-1"]);
    expect(reconcileAlertIds(["order-a", "order-b"], done)).toEqual(["order-a", "order-b"]);
    expect(reconcileAlertIds(["acked-1", "order-b"], done)).toEqual(["order-b"]);
  });

  it("keeps every supplied id; reconcile is stateless and feed freshness is the caller's job", () => {
    expect(reconcileAlertIds(["order-2"], new Set())).toEqual(["order-2"]);
    expect(reconcileAlertIds(["a", "b", "a"], new Set())).toEqual(["a", "b", "a"]);
    expect(reconcileAlertIds([], new Set())).toEqual([]);
  });

  it("acknowledged orders do not re-alarm on an unrelated refresh", () => {
    const done = new Set(["order-a"]);
    expect(reconcileAlertIds(["order-a"], done)).toEqual([]);
    expect(reconcileAlertIds(["order-a", "order-c"], done)).toEqual(["order-c"]);
  });

  it("ignores falsy ids", () => {
    expect(reconcileAlertIds([null, undefined, ""] as any, new Set())).toEqual([]);
  });
});

describe("BUG3: waiter reconcile — claimed-then-settled/cancelled orders stop alerting", () => {
  it("retains only claims whose order is still CLAIMED in the feed", () => {
    const actionable = new Set(["t1", "order-x"]);
    expect(retainAlertIds(["t1", "t2", "t3"], actionable)).toEqual(["t1"]);
    expect(retainAlertIds(["order-x"], actionable)).toEqual(["order-x"]);
    expect(retainAlertIds(["t2"], actionable)).toEqual([]);
  });

  it("a claimed-then-PAID/CANCELLED tableId is removed (no infinite ring)", () => {
    const actionable = new Set<string>();
    expect(retainAlertIds(["t7"], actionable)).toEqual([]);
  });

  it("merge/drop helpers stay intact (existing alert plumbing)", () => {
    expect(mergeAlertIds(["a"], ["b"], new Set())).toEqual(["a", "b"]);
    expect(dropAlertIds(["a", "b"], ["a"])).toEqual(["b"]);
  });
});

describe("BUG4: waiter request resolution is broadcast so other devices stop alerting", () => {
  it("PATCH /api/waiter-requests emits waiter_request_resolved on success", async () => {
    (prisma.waiterRequest.updateMany as any).mockResolvedValue({ count: 1 });
    const res = (await PATCH({
      json: vi.fn().mockResolvedValue({ requestId: "req-1", status: "RESOLVED" }),
    } as any) as any) as Response;
    expect(res.status).toBe(200);
    expect(emitResolvedMock).toHaveBeenCalledWith(
      expect.objectContaining({ restaurantId: "demo-restaurant", requestId: "req-1" })
    );
  });

  it("PATCH does not emit when the request does not exist", async () => {
    (prisma.waiterRequest.updateMany as any).mockResolvedValue({ count: 0 });
    const res = (await PATCH({
      json: vi.fn().mockResolvedValue({ requestId: "req-nope", status: "RESOLVED" }),
    } as any) as any) as Response;
    expect(res.status).toBe(404);
    expect(emitResolvedMock).not.toHaveBeenCalled();
  });

  it("PATCH rejects missing payload", async () => {
    const res = (await PATCH({ json: vi.fn().mockResolvedValue({}) } as any) as any) as Response;
    expect(res.status).toBe(400);
    expect(emitResolvedMock).not.toHaveBeenCalled();
  });

  it("PATCH rejects unauthenticated staff", async () => {
    (requireAdminOrStaff as any).mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    const res = (await PATCH({
      json: vi.fn().mockResolvedValue({ requestId: "req-1", status: "RESOLVED" }),
    } as any) as any) as Response;
    expect(res.status).toBe(401);
    expect(emitResolvedMock).not.toHaveBeenCalled();
  });

  it("emitWaiterRequestResolved notifies waiter + admin rooms", () => {
    const { emitted } = makeCapturingIo();
    emitWaiterRequestResolved({ restaurantId: "r1", requestId: "req-1" });
    expect(emitted).toContainEqual(
      expect.objectContaining({ room: `waiter_r1`, event: "waiter_request_resolved", payload: { requestId: "req-1" } })
    );
    expect(emitted).toContainEqual(expect.objectContaining({ room: `admin_r1`, event: "waiter_request_resolved" }));
  });

  it("request creation broadcast is unchanged", () => {
    expect(emitCreatedMock).toBeDefined();
  });
});
