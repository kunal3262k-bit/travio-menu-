import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession(["ADMIN"]);
    const { status } = await request.json();

    if (!["LIVE", "PAUSED", "CLOSED", "TEMPORARILY_BUSY"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await prisma.restaurant.update({
      where: { id: session.restaurantId },
      data: { status }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return error instanceof Response ? error : NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
