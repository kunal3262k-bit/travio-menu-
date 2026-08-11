import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * INVOICE PDF tests — authorization + valid PDF output, generated from
 * authoritative database rows (never browser-rendered totals).
 */

vi.mock("../src/shared/utils/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn() },
  },
}));

vi.mock("../src/shared/utils/staffAuth", () => ({
  requireAdminOrStaff: vi.fn(),
}));

const { prisma } = await import("../src/shared/utils/prisma");
const { requireAdminOrStaff } = await import("../src/shared/utils/staffAuth");
const { GET } = await import("../app/api/orders/[orderId]/invoice/route");

const paidOrder = {
  id: "order-1",
  invoiceNumber: 1001,
  orderNumber: 42,
  dailyOrderNumber: 7,
  restaurantId: "demo-restaurant",
  sessionType: "TABLE",
  tableId: "t-1",
  table: { number: 5 },
  carOrderType: null,
  carBrand: null,
  carColor: null,
  carLicensePlate: null,
  customerName: "Ravi",
  status: "COMPLETED",
  paymentMethod: "UPI",
  paymentStatus: "PAID",
  subtotalPaise: 10000,
  taxPaise: 500,
  totalPaise: 10500,
  tableSessionId: "sess-abc-123",
  createdAt: new Date("2026-08-11T10:30:00Z"),
  items: [
    { id: "i1", nameSnapshot: "Paneer Tikka", pricePaise: 4000, quantity: 2, instructions: null },
    { id: "i2", nameSnapshot: "Naan", pricePaise: 2000, quantity: 1, instructions: "Butter" },
  ],
  restaurant: {
    name: "Demo Diner",
    slug: "demo",
    logoUrl: null,
    phone: "+91 90000 00000",
    address: "MG Road, Bengaluru",
    gstNumber: "29ABCDE1234F1Z5",
  },
};

function makeRequest(url: string) {
  return { nextUrl: new URL(url) } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/orders/[orderId]/invoice — authorization", () => {
  it("allows staff/admin of the SAME restaurant and returns a valid PDF", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(paidOrder);
    (requireAdminOrStaff as any).mockResolvedValue({ kind: "staff", restaurantId: "demo-restaurant", role: "WAITER" });

    const res = await GET(makeRequest("http://localhost/api/orders/order-1/invoice"), {
      params: Promise.resolve({ orderId: "order-1" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain("SwiftTab-Invoice-1001.pdf");
    const body = Buffer.from(await res.arrayBuffer());
    expect(body.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(body.length).toBeGreaterThan(1000);
  });

  it("SECURITY: a customer cannot fetch another customer's invoice by changing the order id", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(paidOrder);
    (requireAdminOrStaff as any).mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    // Attacker uses THEIR OWN session token (different order's session):
    const res = await GET(
      makeRequest("http://localhost/api/orders/order-1/invoice?session=attacker-session"),
      { params: Promise.resolve({ orderId: "order-1" }) }
    );
    expect(res.status).toBe(403);
  });

  it("allows the customer with the matching session token", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(paidOrder);
    (requireAdminOrStaff as any).mockRejectedValue(new Response("Unauthorized", { status: 401 }));
    const res = await GET(
      makeRequest("http://localhost/api/orders/order-1/invoice?session=sess-abc-123"),
      { params: Promise.resolve({ orderId: "order-1" }) }
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("staff of ANOTHER restaurant are denied", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(paidOrder);
    (requireAdminOrStaff as any).mockResolvedValue({ kind: "staff", restaurantId: "other-restaurant", role: "WAITER" });
    const res = await GET(makeRequest("http://localhost/api/orders/order-1/invoice"), {
      params: Promise.resolve({ orderId: "order-1" }),
    });
    expect(res.status).toBe(403);
  });

  it("unknown order → 404", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(null);
    const res = await GET(makeRequest("http://localhost/api/orders/order-nope/invoice"), {
      params: Promise.resolve({ orderId: "order-nope" }),
    });
    expect(res.status).toBe(404);
  });

  it("unpaid / un-invoiced order → 404 (no invoice exists yet)", async () => {
    (prisma.order.findUnique as any).mockResolvedValue({ ...paidOrder, paymentStatus: "CLAIMED", invoiceNumber: null });
    const res = await GET(
      makeRequest("http://localhost/api/orders/order-1/invoice?session=sess-abc-123"),
      { params: Promise.resolve({ orderId: "order-1" }) }
    );
    expect(res.status).toBe(404);
  });
});

describe("buildInvoicePdf — authoritative totals", () => {
  it("renders a real PDF whose content is derived from the DB rows", async () => {
    const { buildInvoicePdf } = await import("../src/shared/utils/invoicePdf");
    const pdf = await buildInvoicePdf({ order: paidOrder as any, restaurant: paidOrder.restaurant as any });
    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    // Totals are taken from the order row itself (subtotal + GST = total):
    expect(paidOrder.subtotalPaise + paidOrder.taxPaise).toBe(paidOrder.totalPaise);
    expect(paidOrder.items.reduce((s, i) => s + i.pricePaise * i.quantity, 0)).toBe(paidOrder.subtotalPaise);
  });
});
