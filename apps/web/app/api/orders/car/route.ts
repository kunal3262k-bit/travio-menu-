import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getBusinessDayStart } from "@/src/shared/utils/dateUtils";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`car_order:${ip}`).allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const {
      restaurantSlug,
      customerName,
      customerPhone,
      carBrand,
      carColor,
      carLicensePlate,
      carOrderType = "EAT_IN_CAR",
      tableSessionId,
      items,
      instructions,
      idempotencyKey
    } = body;

    if (!restaurantSlug || !customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields for order" }, { status: 400 });
    }

    if (carOrderType === "EAT_IN_CAR" && (!carBrand || !carColor)) {
      return NextResponse.json({ error: "Car Model and Color are required for Eat in Car" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Helper string normalizers & matchers
    const cleanStr = (s?: string | null) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const isModelMatch = (m1?: string | null, m2?: string | null) => {
      const c1 = cleanStr(m1);
      const c2 = cleanStr(m2);
      if (!c1 || !c2) return true;
      return c1 === c2 || c1.includes(c2) || c2.includes(c1);
    };
    const isPlateMatch = (p1?: string | null, p2?: string | null) => {
      const c1 = cleanStr(p1);
      const c2 = cleanStr(p2);
      if (!c1 || !c2) return true;
      return c1 === c2;
    };

    let finalSessionKey = tableSessionId;
    let isJoinedSession = false;
    let joinedHostName: string | null = null;
    let isHijackRejected = false;

    if (tableSessionId) {
      const existingSessionOrder = await prisma.order.findFirst({
        where: {
          restaurantId: restaurant.id,
          tableSessionId: tableSessionId,
          status: { not: "CANCELLED" }
        },
        orderBy: { createdAt: "desc" }
      });

      if (existingSessionOrder) {
        const matchPlate = isPlateMatch(carLicensePlate, existingSessionOrder.carLicensePlate);
        const matchModel = isModelMatch(carBrand, existingSessionOrder.carBrand);

        if (!matchPlate || !matchModel) {
          // Contradictory vehicle details — reject session hijack & issue fresh session key
          finalSessionKey = `car_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          isJoinedSession = false;
          joinedHostName = null;
          isHijackRejected = true;
        } else {
          isJoinedSession = true;
          joinedHostName = existingSessionOrder.customerName;
        }
      }
    }

    // Auto-link second passenger in same car by license plate ONLY if no hijack attempt was rejected
    if (!isHijackRejected && !isJoinedSession && carLicensePlate && cleanStr(carLicensePlate).length >= 4) {
      const targetPlate = cleanStr(carLicensePlate);
      const activeOrders = await prisma.order.findMany({
        where: {
          restaurantId: restaurant.id,
          carLicensePlate: { not: null },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
          createdAt: { gte: new Date(Date.now() - 4 * 3600_000) }
        },
        orderBy: { createdAt: "desc" }
      });

      const matchedOrder = activeOrders.find(o => cleanStr(o.carLicensePlate) === targetPlate);
      if (matchedOrder && matchedOrder.tableSessionId) {
        finalSessionKey = matchedOrder.tableSessionId;
        isJoinedSession = true;
        joinedHostName = matchedOrder.customerName;
      }
    }

    if (!finalSessionKey) {
      finalSessionKey = `car_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    const requestedIds = items.map((item: any) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: restaurant.id,
        id: { in: requestedIds },
        available: true
      }
    });
    const menuById = new Map(menuItems.map((item) => [item.id, item]));

    if (menuItems.length !== new Set(requestedIds).size) {
      return NextResponse.json({ error: "One or more items are unavailable" }, { status: 409 });
    }

    const subtotalPaise = items.reduce((total: number, line: any) => {
      const item = menuById.get(line.menuItemId);
      return total + (item?.pricePaise ?? 0) * line.quantity;
    }, 0);

    const taxPaise = Math.round(subtotalPaise * 0.05);
    const totalPaise = subtotalPaise + taxPaise;

    const longestPrep = Math.max(...menuItems.map((item) => item.preparationMin), 12);
    const estimatedReadyAt = new Date(Date.now() + longestPrep * 60_000);

    // 5 AM Business-Day Cutoff calculation for dailyOrderNumber
    const startOfDay = getBusinessDayStart();

    const order = await prisma.$transaction(async (tx) => {
      const lastOrder = await tx.order.findFirst({
        where: { restaurantId: restaurant.id },
        orderBy: { orderNumber: "desc" },
        select: { orderNumber: true }
      });

      const lastDailyOrder = await tx.order.findFirst({
        where: {
          restaurantId: restaurant.id,
          createdAt: { gte: startOfDay }
        },
        orderBy: { dailyOrderNumber: "desc" },
        select: { dailyOrderNumber: true }
      });

      const dailyOrderNumber = (lastDailyOrder?.dailyOrderNumber ?? 0) + 1;

      const customer = await tx.customer.create({
        data: {
          restaurantId: restaurant.id,
          displayName: customerName,
          phone: customerPhone || null
        }
      });

      return tx.order.create({
        data: {
          restaurantId: restaurant.id,
          sessionType: "CAR",
          tableSessionId: finalSessionKey,
          carBrand: carBrand || null,
          carColor: carColor || null,
          carLicensePlate: carLicensePlate || null,
          carOrderType,
          customerName,
          customerPhone: customerPhone || null,
          customerId: customer.id,
          orderNumber: (lastOrder?.orderNumber ?? 0) + 1,
          dailyOrderNumber,
          subtotalPaise,
          taxPaise,
          totalPaise,
          instructions,
          estimatedReadyAt,
          idempotencyKey: idempotencyKey || null,
          items: {
            create: items.map((line: any) => {
              const item = menuById.get(line.menuItemId)!;
              return {
                menuItemId: item.id,
                nameSnapshot: item.name,
                pricePaise: item.pricePaise,
                quantity: line.quantity,
                instructions: line.instructions
              };
            })
          }
        },
        include: { items: true }
      });
    });

    return NextResponse.json({ order, isJoinedSession, joinedHostName }, { status: 201 });
  } catch (error: any) {
    console.error("Car Order API Error:", error);
    return NextResponse.json({ error: "Failed to place car order" }, { status: 500 });
  }
}
