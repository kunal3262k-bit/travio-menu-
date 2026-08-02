import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession(["ADMIN", "KITCHEN"]);
    const { itemId, available } = await request.json();

    const item = await prisma.menuItem.updateMany({
      where: { id: itemId, restaurantId: session.restaurantId },
      data: { available }
    });

    if (item.count === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 });
  }
}
