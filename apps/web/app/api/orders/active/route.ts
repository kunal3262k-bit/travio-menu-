import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let restaurantId = (session?.user as any)?.restaurantId;

    if (!restaurantId) {
      const demoRest = await prisma.restaurant.findFirst({
        where: { slug: { in: ["apex-formula-detailing-ppf", "demo"] } },
        select: { id: true },
      });
      restaurantId = demoRest?.id;
    }

    if (!restaurantId) {
      const anyRest = await prisma.restaurant.findFirst({ select: { id: true } });
      restaurantId = anyRest?.id;
    }

    if (!restaurantId) {
      return NextResponse.json({ orders: [] });
    }

    const activeOrders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: { notIn: ["CANCELLED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      orders: activeOrders,
    });
  } catch (error: any) {
    console.error("Active orders fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch active orders" },
      { status: 500 }
    );
  }
}
