import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { orderIds, method } = await request.json();

    if (!orderIds || !method || !Array.isArray(orderIds)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment claim error:", error);
    return NextResponse.json({ error: "Failed to claim payment" }, { status: 500 });
  }
}
