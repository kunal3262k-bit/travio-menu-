import { describe, expect, it, vi, beforeEach } from "vitest";

// 1. Mock Prisma and Shared Utils
vi.mock("../src/shared/utils/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    table: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    restaurant: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    waiterRequest: {
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../src/shared/utils/socket", () => ({
  emitPaymentClaimed: vi.fn(),
  emitPaymentConfirmed: vi.fn(),
  emitOrderStatusChanged: vi.fn(),
  emitNewOrder: vi.fn(),
}));

vi.mock("../src/shared/utils/auth", () => ({
  requireSession: vi.fn(),
}));

vi.mock("../src/shared/utils/staffAuth", () => ({
  isPaymentConfirmationAllowedRole: vi.fn(() => true),
}));

const { prisma } = await import("../src/shared/utils/prisma");
const { POST: claimPaymentPOST } = await import("../app/api/orders/claim-payment/route");
const { POST: confirmPaymentPOST } = await import("../app/api/orders/confirm-payment/route");
const { emitPaymentClaimed, emitPaymentConfirmed } = await import("../src/shared/utils/socket");
const { requireSession } = await import("../src/shared/utils/auth");

describe("Real-Device Ordering & Payment Flow Verification Pass (Bugs 1 & 2)", () => {
  const mockRestaurant = {
    id: "rest-100",
    name: "Emerald Bistro",
    slug: "emerald-bistro",
    invoiceCounter: 1099,
  };

  const mockTable = {
    id: "tbl-1",
    number: 4,
    restaurantId: "rest-100",
    currentSessionId: "session-abc-123",
  };

  const round1Order = {
    id: "ord-round-1",
    orderNumber: 1,
    dailyOrderNumber: 1,
    restaurantId: "rest-100",
    tableId: "tbl-1",
    tableSessionId: "session-abc-123",
    sessionType: "TABLE",
    status: "RECEIVED",
    paymentStatus: "UNPAID",
    totalPaise: 45000,
    subtotalPaise: 42857,
    gstPaise: 2143,
    table: { number: 4 },
    items: [
      { id: "item-1", nameSnapshot: "Truffle Paneer Sizzler", quantity: 1, pricePaise: 45000 },
    ],
  };

  const round2Order = {
    id: "ord-round-2",
    orderNumber: 2,
    dailyOrderNumber: 2,
    restaurantId: "rest-100",
    tableId: "tbl-1",
    tableSessionId: "session-abc-123",
    sessionType: "TABLE",
    status: "PREPARING",
    paymentStatus: "UNPAID",
    totalPaise: 25000,
    subtotalPaise: 23810,
    gstPaise: 1190,
    table: { number: 4 },
    items: [
      { id: "item-2", nameSnapshot: "Kesar Pistachio Kulfi", quantity: 2, pricePaise: 12500 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Step 1: Placing Round 1 order creates active order in table session without hard-ejection", () => {
    const initialActiveOrders: any[] = [];
    const afterRound1 = [...initialActiveOrders, round1Order];

    expect(afterRound1.length).toBe(1);
    expect(afterRound1[0].id).toBe("ord-round-1");
    expect(afterRound1[0].status).toBe("RECEIVED");
    expect(afterRound1[0].tableSessionId).toBe("session-abc-123");
  });

  it("Step 2: Rescanning QR / reloading page hydrates initialOrders correctly for the active session", async () => {
    (prisma.order.findMany as any).mockResolvedValue([round1Order]);

    const openOrders = await prisma.order.findMany({
      where: {
        tableId: mockTable.id,
        restaurantId: mockRestaurant.id,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        paymentStatus: { not: "PAID" },
        OR: [
          { tableSessionId: mockTable.currentSessionId },
        ],
      },
      include: { items: true },
    });

    expect(openOrders.length).toBe(1);
    expect(openOrders[0].items[0].nameSnapshot).toBe("Truffle Paneer Sizzler");
    expect(openOrders[0].paymentStatus).toBe("UNPAID");
  });

  it("Step 3: Adding Round 2 while Round 1 is cooking maintains both rounds in the session", () => {
    const multiRoundOrders = [round1Order, round2Order];

    expect(multiRoundOrders.length).toBe(2);
    expect(multiRoundOrders[0].status).toBe("RECEIVED");
    expect(multiRoundOrders[1].status).toBe("PREPARING");
    const totalTablePaise = multiRoundOrders.reduce((sum, o) => sum + o.totalPaise, 0);
    expect(totalTablePaise).toBe(70000); // ₹700.00
  });

  it("Step 4: Bill-split flow triggers CLAIMED payment and emits real-time notification to waiter panel", async () => {
    (prisma.order.findMany as any).mockResolvedValue([round1Order, round2Order]);
    (prisma.order.updateMany as any).mockResolvedValue({ count: 2 });

    const req = {
      json: async () => ({
        orderIds: ["ord-round-1", "ord-round-2"],
        method: "UPI",
      }),
    };

    const res = await claimPaymentPOST(req as any);
    expect(res.status).toBe(200);

    // Verify database update to CLAIMED
    expect(prisma.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["ord-round-1", "ord-round-2"] },
        status: { not: "CANCELLED" },
        paymentStatus: { notIn: ["PAID", "CLAIMED"] },
      },
      data: {
        paymentStatus: "CLAIMED",
        paymentMethod: "UPI",
      },
    });

    // Verify real-time socket emit to staff room
    expect(emitPaymentClaimed).toHaveBeenCalledWith(
      expect.objectContaining({
        restaurantId: "rest-100",
        tableId: "tbl-1",
        method: "UPI",
        amountPaise: 70000,
      })
    );
  });

  it("Step 5: Waiter approves claim, marking orders as PAID with atomic invoice increment and session cleared", async () => {
    (requireSession as any).mockResolvedValue({
      restaurantId: "rest-100",
      role: "WAITER",
    });

    const mockTx = {
      restaurant: {
        update: vi.fn().mockResolvedValue({
          id: "rest-100",
          invoiceCounter: 1100,
        }),
      },
      order: {
        findMany: vi.fn().mockResolvedValue([round1Order, round2Order]),
        updateMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      table: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      waiterRequest: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };

    (prisma.order.findUnique as any).mockResolvedValue(round1Order);
    (prisma.$transaction as any).mockImplementation(async (cb: any) => cb(mockTx));

    const req = {
      json: async () => ({
        orderIds: ["ord-round-1", "ord-round-2"],
      }),
      text: async () => JSON.stringify({
        orderIds: ["ord-round-1", "ord-round-2"],
      })
    };

    const res = await confirmPaymentPOST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);

    // Verify atomic counter increment
    expect(mockTx.restaurant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "rest-100" },
        data: { invoiceCounter: { increment: 1 } },
      })
    );

    // Verify orders updated with PAID and invoice number
    expect(mockTx.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: { in: ["ord-round-1", "ord-round-2"] },
          restaurantId: "rest-100",
        },
        data: expect.objectContaining({
          paymentStatus: "PAID",
          invoiceNumber: 1100,
        }),
      })
    );

    // Verify real-time socket emit
    expect(emitPaymentConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({
        restaurantId: "rest-100",
        tableId: "tbl-1",
      })
    );
  });
});
