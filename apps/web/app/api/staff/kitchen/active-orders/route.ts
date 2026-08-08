import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("restaurantSlug");

    if (!slug) {
      return NextResponse.json({ error: "Missing restaurantSlug" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        status: { in: ["RECEIVED", "ACCEPTED", "PREPARING", "READY"] },
      },
      include: {
        table: true,
        items: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("GET /api/staff/kitchen/active-orders error:", error);
    return NextResponse.json({ error: "Failed to fetch kitchen orders" }, { status: 500 });
  }
}
