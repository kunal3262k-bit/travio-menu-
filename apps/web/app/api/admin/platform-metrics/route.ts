import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalPaidOrders = await prisma.order.count({
      where: {
        paymentStatus: "PAID"
      }
    });

    const totalRestaurants = await prisma.restaurant.count();
    
    return NextResponse.json({
      platform: "SwiftTab",
      totalPaidOrdersServed: totalPaidOrders,
      totalRestaurants,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to compute platform metrics" }, { status: 500 });
  }
}
