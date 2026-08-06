import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { orderId, tableId, restaurantId } = await request.json();

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "COMPLETED",
          paymentStatus: "PAID"
        }
      });
    } else if (tableId) {
      await prisma.order.updateMany({
        where: {
          tableId,
          status: { notIn: ["COMPLETED", "CANCELLED"] }
        },
        data: {
          status: "COMPLETED",
          paymentStatus: "PAID"
        }
      });
    } else if (restaurantId) {
      await prisma.order.updateMany({
        where: {
          restaurantId,
          status: { notIn: ["COMPLETED", "CANCELLED"] }
        },
        data: {
          status: "COMPLETED",
          paymentStatus: "PAID"
        }
      });
    }

    return NextResponse.json({ success: true, message: "Session closed successfully" });
  } catch (error: any) {
    console.error("Close Session Error:", error);
    return NextResponse.json({ error: "Failed to close session" }, { status: 500 });
  }
}
