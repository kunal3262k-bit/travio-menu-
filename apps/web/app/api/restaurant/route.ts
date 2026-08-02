import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  let session;
  try {
    session = await requireSession(["ADMIN"]);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  // Strip out fields we don't want arbitrarily updated
  const { id, restaurantId, slug, createdAt, updatedAt, ...updatableData } = data;

  try {
    const restaurant = await prisma.restaurant.update({
      where: { id: session.restaurantId },
      data: updatableData
    });

    return NextResponse.json({ success: true, restaurant });
  } catch (error: any) {
    console.error("Restaurant update error:", error);
    return NextResponse.json({ error: "Failed to update restaurant" }, { status: 500 });
  }
}
