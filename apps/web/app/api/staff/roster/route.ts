import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("restaurantSlug");
    const role = searchParams.get("role");

    if (!slug) {
      return NextResponse.json({ error: "Missing restaurantSlug" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const where: any = {
      restaurantId: restaurant.id,
      active: true,
    };

    if (role === "KITCHEN" || role === "WAITER") {
      where.role = role;
    }

    const staffList = await prisma.staff.findMany({
      where,
      select: {
        id: true,
        name: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      restaurant,
      staff: staffList,
    });
  } catch (error: any) {
    console.error("GET /api/staff/roster error:", error);
    return NextResponse.json({ error: "Failed to fetch staff roster" }, { status: 500 });
  }
}
