import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireSession(["ADMIN", "KITCHEN"]);
    
    const orders = await prisma.order.findMany({
      where: { 
        restaurantId: session.restaurantId,
        status: { notIn: ["COMPLETED", "CANCELLED", "SERVED"] }
      },
      include: {
        table: true,
        items: true
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
