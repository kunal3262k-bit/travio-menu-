import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffAuth";
import { emitPaymentConfirmed } from "@/lib/socket";

/**
 * Staff-facing payment confirmation (PIN-logged-in waiter/kitchen).
 * Settles the ENTIRE session (all unpaid rounds), assigns one atomic invoice
 * number, and pushes the payment_confirmed event server-side.
 * Previously this route did not exist (staff waiter panel 404'd).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  let staff;
  try {
    staff = await requireStaff(["WAITER", "KITCHEN"]);
  } catch (error) {
    return error instanceof Response ? error : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  const firstOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      tableId: true,
      tableSessionId: true,
      sessionType: true,
      restaurantId: true,
    },
  });

  if (!firstOrder || firstOrder.restaurantId !== staff.restaurantId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const processedByStaffId = body.processedByStaffId || staff.staffId;
  const processedByStaffName = body.processedByStaffName || staff.staffName;

  const settled = await prisma.$transaction(async (tx) => {
    // Settle by sessionId (entire session) so every round is covered.
    const allUnpaidInSession = await tx.order.findMany({
      where: {
        restaurantId: staff.restaurantId,
        ...(firstOrder.tableSessionId
          ? { tableSessionId: firstOrder.tableSessionId }
          : { id: orderId }),
        paymentStatus: { not: "PAID" },
        status: { not: "CANCELLED" }
      },
      select: { id: true }
    });

    const allOrderIds = allUnpaidInSession.map((o) => o.id);
    if (allOrderIds.length === 0) {
      const paid = await tx.order.findFirst({
        where: {
          id: orderId,
          restaurantId: staff.restaurantId,
          paymentStatus: "PAID",
        },
        select: { invoiceNumber: true },
      });
      return { settledOrderIds: [], invoiceNumber: paid?.invoiceNumber ?? null };
    }

    const restaurant = await tx.restaurant.update({
      where: { id: staff.restaurantId },
      data: { invoiceCounter: { increment: 1 } },
      select: { invoiceCounter: true }
    });
    const invoiceNumber = restaurant.invoiceCounter;
    await tx.order.updateMany({
      where: {
        id: { in: allOrderIds },
        restaurantId: staff.restaurantId
      },
      data: {
        paymentStatus: "PAID",
        ...(firstOrder.sessionType === "CAR" ? {} : { status: "COMPLETED" }),
        invoiceNumber,
        processedByStaffId,
        processedByStaffName,
      }
    });

    // Resolve pending bill requests and free the table for the next customer.
    if (firstOrder.tableId) {
      await tx.waiterRequest.updateMany({
        where: {
          tableId: firstOrder.tableId,
          type: "REQUEST_BILL",
          status: "OPEN"
        },
        data: { status: "RESOLVED" }
      });

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

    return { settledOrderIds: allOrderIds, invoiceNumber };
  });

  emitPaymentConfirmed({
    restaurantId: staff.restaurantId,
    tableId: firstOrder.tableId,
    isCar: firstOrder.sessionType === "CAR",
    orderId: settled.settledOrderIds[0] ?? null,
    invoiceNumber: settled.invoiceNumber ?? null,
  });

  return NextResponse.json({ success: true, ...settled });
}