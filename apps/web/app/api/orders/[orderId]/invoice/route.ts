import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/staffAuth";
import { buildInvoicePdf } from "@/lib/invoicePdf";

/**
 * GET /api/orders/[orderId]/invoice?session=<tableSessionId>
 *
 * Returns the tax invoice PDF for a PAID order, generated from authoritative
 * database rows (never browser-rendered totals).
 *
 * AUTHORIZATION (built on the existing architecture, no new auth system):
 *  1. Staff/admin session cookie (requireAdminOrStaff) — the restaurant must
 *     own the order, same rule as every other staff route.
 *  2. Customer path — the query `session` token must equal the order's
 *     tableSessionId (a high-entropy UUID created when the customer's first
 *     order was placed and only ever handed back to that same browser's
 *     payment screen). Swapping the orderId without the matching session
 *     token returns 403, so one customer can never fetch another's invoice.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const sessionToken = request.nextUrl.searchParams.get("session");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, table: true, restaurant: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  if (order.paymentStatus !== "PAID" || order.invoiceNumber == null) {
    return NextResponse.json({ error: "Invoice is only available after payment is confirmed" }, { status: 404 });
  }

  // Staff/admin path.
  let staffAuthorized = false;
  try {
    const auth = await requireAdminOrStaff();
    if (auth.restaurantId === order.restaurantId) staffAuthorized = true;
  } catch {
    staffAuthorized = false;
  }

  // Customer path: possession of the order's own session key.
  const customerAuthorized =
    !!sessionToken && !!order.tableSessionId && sessionToken === order.tableSessionId;

  if (!staffAuthorized && !customerAuthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pdf = await buildInvoicePdf({ order, restaurant: order.restaurant });

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="SwiftTab-Invoice-${order.invoiceNumber}.pdf"`,
      "Content-Length": String(pdf.byteLength),
      "Cache-Control": "private, max-age=300",
    },
  });
}
