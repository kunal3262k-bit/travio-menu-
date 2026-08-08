import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffAuth";
import { fetchGatedKitchenOrders } from "@/lib/kitchenFeed";

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(["KITCHEN"]);

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

    if (restaurant.id !== staff.restaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orders = await fetchGatedKitchenOrders(restaurant.id, {
      statuses: ["RECEIVED", "ACCEPTED", "PREPARING", "READY"],
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error("GET /api/staff/kitchen/active-orders error:", error);
    return NextResponse.json({ error: "Failed to fetch kitchen orders" }, { status: 500 });
  }
}
