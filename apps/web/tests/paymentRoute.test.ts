import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../src/shared/utils/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn(), updateMany: vi.fn() },
    restaurant: { update: vi.fn() },
    waiterRequest: { updateMany: vi.fn() },
    table: { updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

const { prisma } = await import("../src/shared/utils/prisma");
const { PATCH } = await import("../app/api/orders/[orderId]/payment/route");
const { emitPaymentConfirmed } = await import("../src/shared/utils/socket");
const { requireStaff } = await import("../src/shared/utils/staffAuth");

vi.mock("../src/shared/utils/socket", () => ({ emitPaymentConfirmed: vi.fn() }));
vi.mock("../src/shared/utils/staffAuth", () => ({ requireStaff: vi.fn() }));

const staff = { restaurantId: "demo-restaurant", staffId: "st-1", staffName: "W1" };
const orderA = { id: "order-A", tableId: "t1", tableSessionId: "sess-1", sessionType: "TABLE", restaurantId: "demo-restaurant" };
const orderB = { id: "order-B", tableId: "t1", tableSessionId: "sess-1", sessionType: "TABLE", restaurantId: "demo-restaurant" };
const orderC = { id: "order-C", tableId: null, tableSessionId: null, sessionType: "TABLE", restaurantId: "demo-restaurant" };

// findMany simulates the route's session-vs-single-order where clause
const makeTx = (sessionRows: unknown[] = [orderA, orderB]) => ({
  order: {
    findMany: vi.fn(async ({ where }: any = {}) =>
      where?.tableSessionId ? sessionRows : where?.id ? [orderC] : []
    ),
    updateMany: vi.fn().mockResolvedValue({ count: sessionRows.length }),
  },
  restaurant: { update: vi.fn().mockResolvedValue({ invoiceCounter: 12 }) },
  waiterRequest: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
  table: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
});

const request = (body = {}) => ({ json: vi.fn().mockResolvedValue(body) });

const patch = (orderId: string, firstOrder: unknown) => {
  prisma.order.findUnique.mockResolvedValue(firstOrder);
  return PATCH(request({}) as any, { params: Promise.resolve({ orderId }) } as any);
};

beforeEach(() => {
  vi.clearAllMocks();
  (requireStaff as any).mockResolvedValue(staff);
  (emitPaymentConfirmed as any).mockImplementation(() => {});
});

describe("BUG1 regression: PATCH /api/orders/[orderId]/payment settles the selected SESSION only", () => {
  it("settles every unpaid round of the session and returns settledOrderIds", async () => {
    const tx = makeTx();
    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));
    const res = (await patch("order-A", { ...orderA, id: "order-A" })) as Response;
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.settledOrderIds).toEqual(["order-A", "order-B"]);
    expect(tx.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tableSessionId: "sess-1" }) })
    );
  });

  it("never pays orders outside the session (scope = session unpaid rounds only)", async () => {
    const tx = makeTx();
    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));
    await patch("order-A", { ...orderA, id: "order-A" });
    const { updateMany } = tx.order;
    const updateCalls = JSON.stringify(updateMany.mock.calls);
    expect(updateCalls).toContain("order-A");
    expect(updateCalls).toContain("order-B");
    expect(updateCalls).not.toContain("order-C");
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: { in: ["order-A", "order-B"] } }) })
    );
  });

  it("resolves pending bill requests and frees the table session", async () => {
    const tx = makeTx();
    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));
    await patch("order-A", { ...orderA, id: "order-A" });
    expect(tx.waiterRequest.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: "REQUEST_BILL", status: "OPEN" }) })
    );
    expect(tx.table.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ currentSessionId: null }) })
    );
  });

  it("falls back to the single order when it has no tableSessionId", async () => {
    const tx = makeTx([]);
    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));
    const res = (await patch("order-C", orderC)) as Response;
    const json = await res.json();
    expect(json.settledOrderIds).toEqual(["order-C"]);
    expect(tx.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: "order-C" }) })
    );
  });

  it("is a no-op (no re-invoice) when the session is already fully paid", async () => {
    const emptyTx = makeTx([]);
    prisma.$transaction.mockImplementation(async (cb: any) => cb(emptyTx));
    const res = (await patch("order-A", { ...orderA, id: "order-A" })) as Response;
    const json = await res.json();
    expect(json.settledOrderIds).toEqual([]);
    expect(emptyTx.restaurant.update).not.toHaveBeenCalled();
    expect(emptyTx.order.updateMany).not.toHaveBeenCalled();
  });

  it("emits payment_confirmed with isCar=false for table orders", async () => {
    const tx = makeTx();
    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));
    await patch("order-A", { ...orderA, id: "order-A" });
    expect(emitPaymentConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({ restaurantId: "demo-restaurant", isCar: false })
    );
  });

  it("BUG2: marks TABLE orders COMPLETED on payment", async () => {
    const tx = makeTx();
    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));
    await patch("order-A", { ...orderA, id: "order-A" });
    expect(tx.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "COMPLETED", paymentStatus: "PAID" }) })
    );
  });

  it("BUG2: CAR orders keep their status (no COMPLETED) so the KDS gate still shows them", async () => {
    const tx = makeTx();
    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));
    await patch("car-A", { id: "car-A", tableId: null, tableSessionId: "car_session_1", sessionType: "CAR", restaurantId: "demo-restaurant" });
    const updateMany = tx.order.updateMany.mock.calls[0][0] as any;
    expect(updateMany.data.paymentStatus).toBe("PAID");
    expect(updateMany.data.status).toBeUndefined();
    expect(updateMany.data.invoiceNumber).toBe(12);
    expect(emitPaymentConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({ isCar: true })
    );
  });

  it("rejects unauthenticated staff", async () => {
    (requireStaff as any).mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    const res = (await patch("order-A", { ...orderA, id: "order-A" })) as Response;
    expect(res.status).toBe(401);
  });
});