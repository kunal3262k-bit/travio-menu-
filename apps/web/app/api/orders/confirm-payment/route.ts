import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(["ADMIN", "KITCHEN"]);
    const { orderIds } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Get the first order to find table + session context
      const firstOrder = await tx.order.findUnique({
        where: { id: orderIds[0] },
        select: { tableId: true, tableSessionId: true }
      });

      if (!firstOrder) return;

      // 2. Find ALL unpaid, non-cancelled orders in this session.
      //    CRITICAL FIX: We settle by sessionId (entire session), not just
      //    the orderIds passed in. This prevents partial billing when a customer
      //    orders in multiple rounds — even if only the latest order was passed in,
      //    all prior rounds in the session get settled together.
      const allUnpaidInSession = await tx.order.findMany({
        where: {
          restaurantId: session.restaurantId,
          // Fall back to the explicit orderIds if no sessionId exists (legacy orders)
          ...(firstOrder.tableSessionId
            ? { tableSessionId: firstOrder.tableSessionId }
            : { id: { in: orderIds } }),
          paymentStatus: { not: "PAID" },
          status: { not: "CANCELLED" }
        },
        select: { id: true }
      });

      const allOrderIds = allUnpaidInSession.map(o => o.id);
      if (allOrderIds.length === 0) return; // Already fully paid

      // 3. Get an atomic invoice number
      const restaurant = await tx.restaurant.update({
        where: { id: session.restaurantId },
        data: { invoiceCounter: { increment: 1 } },
        select: { invoiceCounter: true }
      });
      const invoiceNumber = restaurant.invoiceCounter;

      // 4. Mark ALL session orders as PAID and assign the same invoice number
      await tx.order.updateMany({
        where: {
          id: { in: allOrderIds },
          restaurantId: session.restaurantId
        },
        data: {
          paymentStatus: "PAID",
          status: "COMPLETED",
          invoiceNumber
        }
      });

      // 5. Resolve any pending REQUEST_BILL waiter requests for this table
      if (firstOrder.tableId) {
        await tx.waiterRequest.updateMany({
          where: {
            tableId: firstOrder.tableId,
            type: "REQUEST_BILL",
            status: "OPEN"
          },
          data: { status: "RESOLVED" }
        });

        // 6. Teardown the session — table is now free
        if (firstOrder.tableSessionId) {
          await tx.table.updateMany({
            where: {
              id: firstOrder.tableId,
              currentSessionId: firstOrder.tableSessionId
            },
            data: { currentSessionId: null }
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Confirm payment error:", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
