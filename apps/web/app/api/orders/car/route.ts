import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

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
      carBrand,
      carColor,
      carLicensePlate,
      items,
      instructions,
      idempotencyKey
    } = body;

    if (!restaurantSlug || !customerName || !carBrand || !carColor || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields for car order" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
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
    const now = new Date();
    const startOfDay = new Date(now);
    if (now.getHours() < 5) {
      startOfDay.setDate(startOfDay.getDate() - 1);
    }
    startOfDay.setHours(5, 0, 0, 0);

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

      const lastInvoice = await tx.order.findFirst({
        where: { restaurantId: restaurant.id, invoiceNumber: { not: null } },
        orderBy: { invoiceNumber: "desc" },
        select: { invoiceNumber: true }
      });

      const dailyOrderNumber = (lastDailyOrder?.dailyOrderNumber ?? 0) + 1;
      const invoiceNumber = (lastInvoice?.invoiceNumber ?? 1000) + 1;

      const customer = await tx.customer.create({
        data: {
          restaurantId: restaurant.id,
          displayName: customerName
        }
      });

      return tx.order.create({
        data: {
          restaurantId: restaurant.id,
          sessionType: "CAR",
          carBrand,
          carColor,
          carLicensePlate: carLicensePlate || null,
          customerName,
          customerId: customer.id,
          orderNumber: (lastOrder?.orderNumber ?? 0) + 1,
          dailyOrderNumber,
          invoiceNumber,
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

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Car Order API Error:", error);
    return NextResponse.json({ error: "Failed to place car order" }, { status: 500 });
  }
}
