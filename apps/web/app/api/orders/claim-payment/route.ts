import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitPaymentClaimed, emitCashRequested } from "@/lib/socket";

export async function POST(request: NextRequest) {
  try {
    const { orderIds, method } = await request.json();

    if (!orderIds || !method || !Array.isArray(orderIds)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: { id: true, restaurantId: true, tableId: true, totalPaise: true },
    });

    if (orders.length === 0) {
      return NextResponse.json({ error: "Orders not found" }, { status: 404 });
    }

    const restaurantId = orders[0].restaurantId;
    const tableId = orders[0].tableId ?? null;
    const amountPaise = orders.reduce((sum, o) => sum + o.totalPaise, 0);

    await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        paymentStatus: { notIn: ["PAID", "CLAIMED"] },
        status: { not: "CANCELLED" }
      },
      data: {
        paymentMethod: method,
        paymentStatus: "CLAIMED"
      }
    });

    // Server-side push: notify waiter/admin that a payment was claimed.
    if (method === "CASH") {
      emitCashRequested({ restaurantId, tableId, amountPaise });
    } else {
      emitPaymentClaimed({ restaurantId, tableId, method, amountPaise });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment claim error:", error);
    return NextResponse.json({ error: "Failed to claim payment" }, { status: 500 });
  }
}
