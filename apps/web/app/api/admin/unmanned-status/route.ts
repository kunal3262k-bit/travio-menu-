import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slugParam = searchParams.get("restaurantSlug");

    const session = await getServerSession(authOptions);
    let restaurantId = session?.user?.restaurantId;

    if (!restaurantId && slugParam) {
      const rest = await prisma.restaurant.findUnique({ where: { slug: slugParam }, select: { id: true } });
      if (rest) restaurantId = rest.id;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { settings: true },
    });

    const settings = (restaurant?.settings as any) || {};
    const openTime = settings.openTime || "09:00"; // default 9:00 AM
    const closeTime = settings.closeTime || "23:00"; // default 11:00 PM

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMin = currentHours * 60 + currentMinutes;

    const [openH, openM] = openTime.split(":").map(Number);
    const [closeH, closeM] = closeTime.split(":").map(Number);
    const openTotalMin = openH * 60 + openM;
    const closeTotalMin = closeH * 60 + closeM;

    const isOpenNow = currentTotalMin >= openTotalMin && currentTotalMin <= closeTotalMin;
    const minutesSinceOpen = currentTotalMin - openTotalMin;

    // Unmanned check triggers if restaurant is OPEN AND it's at least 15 mins past opening time
    const shouldCheckUnmanned = isOpenNow && minutesSinceOpen >= 15;

    let kitchenUnmanned = false;
    let waiterUnmanned = false;

    if (shouldCheckUnmanned) {
      // 1. Check if active staff members exist in Roster
      const activeKitchenStaff = await prisma.staff.findMany({
        where: { restaurantId, role: "KITCHEN", active: true },
      });
      const activeWaiterStaff = await prisma.staff.findMany({
        where: { restaurantId, role: "WAITER", active: true },
      });

      // 2. Check recent staff action attribution within last 15 mins (or active status updates)
      const fifteenMinAgo = new Date(Date.now() - 15 * 60_000);
      const recentStaffActions = await prisma.order.findMany({
        where: {
          restaurantId,
          updatedAt: { gte: fifteenMinAgo },
          processedByStaffId: { not: null },
        },
        select: { processedByStaffId: true },
      });

      // If no active staff members exist for role OR zero actions performed during operating hours, flag unmanned
      kitchenUnmanned = activeKitchenStaff.length === 0;
      waiterUnmanned = activeWaiterStaff.length === 0;
    }

    return NextResponse.json({
      isOpenNow,
      shouldCheckUnmanned,
      minutesSinceOpen,
      openTime,
      closeTime,
      kitchenUnmanned,
      waiterUnmanned,
    });
  } catch (error: any) {
    console.error("GET /api/admin/unmanned-status error:", error);
    return NextResponse.json({ error: "Failed to calculate unmanned status" }, { status: 500 });
  }
}
