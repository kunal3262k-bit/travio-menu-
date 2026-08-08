import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffAuth";

/** Staff waiter live snapshot — scoped to the verified staff member's restaurant. */
export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(["WAITER"]);
    const restaurantId = staff.restaurantId;

    const [orders, tables, requests] = await Promise.all([
      prisma.order.findMany({
        where: {
          restaurantId,
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
        include: { table: true, items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.table.findMany({
        where: { restaurantId, active: true },
        include: {
          orders: {
            where: { status: { not: "CANCELLED" } },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { number: "asc" },
      }),
      prisma.waiterRequest.findMany({
        where: {
          restaurantId,
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
        },
        include: { table: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ orders, tables, requests });
  } catch (error: any) {
    if (error instanceof Response) return error;
    console.error("GET /api/waiter/active-state error:", error);
    return NextResponse.json({ error: "Failed to fetch active state" }, { status: 500 });
  }
}
