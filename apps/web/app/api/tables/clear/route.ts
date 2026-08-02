import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(["ADMIN", "KITCHEN"]); // Waiters might share the admin or kitchen role depending on auth setup
    const { tableId } = await request.json();

    if (!tableId) {
      return NextResponse.json({ error: "Missing tableId" }, { status: 400 });
    }

    // Auto-close all open orders for this table so the session resets for the next customer
    await prisma.order.updateMany({
      where: {
        tableId,
        restaurantId: session.restaurantId,
        status: { notIn: ["COMPLETED", "CANCELLED"] }
      },
      data: { status: "COMPLETED" }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Clear table error:", error);
    return NextResponse.json({ error: "Failed to clear table orders" }, { status: 500 });
  }
}
