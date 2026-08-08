import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { emitPaymentConfirmed } from "@/lib/socket";

/**
 * Car-side "done / close session" checkout. Called by the customer's own
 * browser after they claim/confirm payment. Only ever called with an orderId.
 * Settles the whole session (all unpaid rounds) with one atomic invoice number
 * and pushes payment_confirmed server-side.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`close_session:${ip}`).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        restaurantId: true,
        tableSessionId: true,
        tableId: true,
        sessionType: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const settled = await prisma.$transaction(async (tx) => {
      const unpaidInSession = await tx.order.findMany({
        where: {
          restaurantId: order.restaurantId,
          ...(order.tableSessionId
            ? { tableSessionId: order.tableSessionId }
            : { id: order.id }),
          paymentStatus: { not: "PAID" },
          status: { not: "CANCELLED" }
        },
        select: { id: true }
      });

      const ids = unpaidInSession.map((o) => o.id);
      if (ids.length === 0) return false;

      const restaurant = await tx.restaurant.update({
        where: { id: order.restaurantId },
        data: { invoiceCounter: { increment: 1 } },
        select: { invoiceCounter: true }
      });

      await tx.order.updateMany({
        where: {
          id: { in: ids },
          restaurantId: order.restaurantId
        },
        data: {
          status: "COMPLETED",
          paymentStatus: "PAID",
          invoiceNumber: restaurant.invoiceCounter
        }
      });

      return true;
    });

    if (settled) {
      emitPaymentConfirmed({
        restaurantId: order.restaurantId,
        tableId: order.tableId,
        isCar: order.sessionType === "CAR",
      });
    }

    return NextResponse.json({ success: true, message: "Session closed successfully" });
  } catch (error: any) {
    console.error("Close Session Error:", error);
    return NextResponse.json({ error: "Failed to close session" }, { status: 500 });
  }
}
