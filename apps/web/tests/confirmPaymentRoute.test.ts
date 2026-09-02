import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../src/shared/utils/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
    restaurant: { update: vi.fn() },
    waiterRequest: { updateMany: vi.fn() },
    table: { updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

const { prisma } = await import("../src/shared/utils/prisma");
const { POST } = await import("../app/api/orders/confirm-payment/route");
const { emitPaymentConfirmed } = await import("../src/shared/utils/socket");
const { requireSession } = await import("../src/shared/utils/auth");
const { isPaymentConfirmationAllowedRole } = await import("../src/shared/utils/staffAuth");

vi.mock("../src/shared/utils/socket", () => ({ emitPaymentConfirmed: vi.fn() }));
vi.mock("../src/shared/utils/auth", () => ({ requireSession: vi.fn() }));
vi.mock("../src/shared/utils/staffAuth", () => ({ isPaymentConfirmationAllowedRole: vi.fn(() => true) }));

const carOrder = { id: "car-A", tableId: null, tableSessionId: "car_session_1", sessionType: "CAR", restaurantId: "demo-restaurant" };
const tableOrder = { id: "table-A", tableId: "t1", tableSessionId: "sess-1", sessionType: "TABLE", restaurantId: "demo-restaurant" };

const makeTx = (rows: any[] = [carOrder]) => ({
  order: {
    findMany: vi.fn(async ({ where }: any = {}) => (where?.tableSessionId ? rows : [])),
    updateMany: vi.fn().mockResolvedValue({ count: rows.length }),
  },
  restaurant: { update: vi.fn().mockResolvedValue({ invoiceCounter: 7 }) },
  waiterRequest: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
  table: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
});

const request = (body: object) => ({ 
  json: vi.fn().mockResolvedValue(body),
  text: vi.fn().mockResolvedValue(JSON.stringify(body))
});

beforeEach(() => {
  vi.clearAllMocks();
  (requireSession as any).mockResolvedValue({ restaurantId: "demo-restaurant", role: "ADMIN" });
  (emitPaymentConfirmed as any).mockImplementation(() => {});
});

describe("BUG2 regression: POST /api/orders/confirm-payment keeps CAR orders kitchen-visible", () => {
  it("does not stamp COMPLETED on CAR orders (status stays RECEIVED for the KDS gate)", async () => {
    const tx = makeTx();
    (prisma.order.findUnique as any).mockResolvedValue(carOrder);
    (prisma.$transaction as any).mockImplementation(async (cb: any) => cb(tx));
    const res = (await POST(request({ orderIds: ["car-A"] }) as any)) as Response;
    expect(res.status).toBe(200);
    const call = tx.order.updateMany.mock.calls[0][0] as any;
    expect(call.data.paymentStatus).toBe("PAID");
    expect(call.data.status).toBeUndefined();
    expect(emitPaymentConfirmed).toHaveBeenCalledWith(expect.objectContaining({ isCar: true }));
  });

  it("still stamps COMPLETED on TABLE orders", async () => {
    const tx = makeTx([tableOrder]);
    (prisma.order.findUnique as any).mockResolvedValue(tableOrder);
    (prisma.$transaction as any).mockImplementation(async (cb: any) => cb(tx));
    await POST(request({ orderIds: ["table-A"] }) as any);
    const call = tx.order.updateMany.mock.calls[0][0] as any;
    expect(call.data.status).toBe("COMPLETED");
    expect(call.data.paymentStatus).toBe("PAID");
    expect(emitPaymentConfirmed).toHaveBeenCalledWith(expect.objectContaining({ isCar: false }));
  });

  it("rejects empty orderIds", async () => {
    const res = (await POST(request({ orderIds: [] }) as any)) as Response;
    expect(res.status).toBe(400);
  });
});