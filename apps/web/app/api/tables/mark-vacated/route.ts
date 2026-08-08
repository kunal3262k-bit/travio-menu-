import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/staffAuth";

export async function POST(request: NextRequest) {
  let auth;
  try {
    auth = await requireAdminOrStaff(["WAITER", "KITCHEN"]);
  } catch (error) {
    return error instanceof Response ? error : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tableId, tableSessionId } = body;

  if (!tableSessionId) {
    return NextResponse.json({ error: "Missing tableSessionId" }, { status: 400 });
  }

  const processedByStaffId = body.processedByStaffId || auth.staffId;
  const processedByStaffName = body.processedByStaffName || auth.staffName;

  await prisma.$transaction(async (tx) => {
    // If a physical table ID is present, unbind current session
    if (tableId) {
      await tx.table.update({
        where: { id: tableId },
        data: { currentSessionId: null },
      });
    }

    // Find any UNPAID orders tied to this session (scoped to THIS restaurant —
    // a staff member cannot cancel another restaurant's orders) and cancel them.
    const unpaidOrders = await tx.order.findMany({
      where: {
        tableSessionId,
        restaurantId: auth.restaurantId,
        paymentStatus: "UNPAID",
        status: { not: "CANCELLED" }
      }
    });

    if (unpaidOrders.length > 0) {
      await tx.order.updateMany({
        where: {
          id: { in: unpaidOrders.map(o => o.id) }
        },
        data: {
          status: "CANCELLED",
          processedByStaffId,
          processedByStaffName,
        }
      });
    }
  });

  return NextResponse.json({ success: true });
}
