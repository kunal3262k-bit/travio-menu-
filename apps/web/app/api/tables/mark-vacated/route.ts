import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { tableId, tableSessionId } = await request.json();

    if (!tableSessionId) {
      return NextResponse.json({ error: "Missing tableSessionId" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // If a physical table ID is present, unbind current session
      if (tableId) {
        await tx.table.update({
          where: { id: tableId },
          data: { currentSessionId: null },
        });
      }

      // Find any UNPAID orders tied to this session and mark them as CANCELLED
      const unpaidOrders = await tx.order.findMany({
        where: {
          tableSessionId,
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
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking table vacated:", error);
    return NextResponse.json({ error: "Failed to mark vacated" }, { status: 500 });
  }
}
