import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validation";
import { resolveRestaurantTable } from "@/lib/tenant";
import { rateLimit } from "@/lib/rate-limit";
import { emitOrderCreated } from "@/lib/socket";
import { shouldEmitKitchenNewOrder } from "@/lib/kitchenFeed";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`order:${ip}`).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = createOrderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order", details: parsed.error.flatten() }, { status: 400 });
  }

  const context = await resolveRestaurantTable(parsed.data.restaurantSlug, parsed.data.tableNumber);
  if (!context) {
    return NextResponse.json({ error: "Restaurant or table not available" }, { status: 404 });
  }

  const requestedIds = parsed.data.items.map((item) => item.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: {
      restaurantId: context.restaurant.id,
      id: { in: requestedIds },
      available: true
    }
  });
  const menuById = new Map(menuItems.map((item) => [item.id, item]));

  if (menuItems.length !== new Set(requestedIds).size) {
    return NextResponse.json({ error: "One or more items are unavailable" }, { status: 409 });
  }

  const subtotalPaise = parsed.data.items.reduce((total, line) => {
    const item = menuById.get(line.menuItemId);
    return total + (item?.pricePaise ?? 0) * line.quantity;
  }, 0);

  // Apply 5% Restaurant GST (2.5% CGST + 2.5% SGST)
  const taxPaise = Math.round(subtotalPaise * 0.05);
  const totalPaise = subtotalPaise + taxPaise;

  const longestPrep = Math.max(...menuItems.map((item) => item.preparationMin), 12);
  const estimatedReadyAt = new Date(Date.now() + longestPrep * 60_000);

  // Idempotency check: If this exact key was already sent, return the existing order
  if (parsed.data.idempotencyKey) {
    const existingOrder = await prisma.order.findUnique({
      where: {
        restaurantId_idempotencyKey: {
          restaurantId: context.restaurant.id,
          idempotencyKey: parsed.data.idempotencyKey
        }
      },
      include: { items: true, table: true }
    });

    if (existingOrder) {
      return NextResponse.json({ order: existingOrder }, { status: 200 }); // 200 OK means it already existed
    }
  }

  // 5 AM Business-Day Cutoff calculation for dailyOrderNumber
  const now = new Date();
  const startOfDay = new Date(now);
  if (now.getHours() < 5) {
    startOfDay.setDate(startOfDay.getDate() - 1);
  }
  startOfDay.setHours(5, 0, 0, 0);

  const order = await prisma.$transaction(async (tx) => {
    const lastOrder = await tx.order.findFirst({
      where: { restaurantId: context.restaurant.id },
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true }
    });

    const lastDailyOrder = await tx.order.findFirst({
      where: {
        restaurantId: context.restaurant.id,
        createdAt: { gte: startOfDay }
      },
      orderBy: { dailyOrderNumber: "desc" },
      select: { dailyOrderNumber: true }
    });

    const dailyOrderNumber = (lastDailyOrder?.dailyOrderNumber ?? 0) + 1;
    
    // NOTE: invoiceNumber is NO LONGER assigned at creation to prevent gaps from cancelled orders.
    // It is assigned atomically in a separate route ONLY when the bill is fully PAID.

    let currentSessionId = context.table.currentSessionId;
    if (!currentSessionId) {
      const { randomUUID } = require('crypto');
      currentSessionId = randomUUID();
      await tx.table.update({
        where: { id: context.table.id },
        data: { currentSessionId }
      });
    }

    const customer =
      parsed.data.customerName || parsed.data.customerPhone
        ? await tx.customer.create({
            data: {
              restaurantId: context.restaurant.id,
              displayName: parsed.data.customerName,
              phone: parsed.data.customerPhone
            }
          })
        : null;

    return tx.order.create({
      data: {
        restaurantId: context.restaurant.id,
        tableId: context.table.id,
        customerId: customer?.id,
        orderNumber: (lastOrder?.orderNumber ?? 0) + 1,
        dailyOrderNumber,
        tableSessionId: currentSessionId,
        subtotalPaise,
        taxPaise,
        totalPaise,
        instructions: parsed.data.instructions,
        estimatedReadyAt,
        idempotencyKey: parsed.data.idempotencyKey,
        items: {
          create: parsed.data.items.map((line) => {
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
      include: { items: true, table: true }
    });
  });

  // Server-side push: notify kitchen + waiter rooms that a new order exists.
  // Kitchen alert is gated so tickets hidden by the CAR payment gate never alarm the KDS.
  const emitKitchen = await shouldEmitKitchenNewOrder(order);
  emitOrderCreated(context.restaurant.id, order.id, { kitchen: emitKitchen });

  return NextResponse.json({ order }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({
    message: "Use authenticated kitchen/admin order feeds in production. Realtime channel mirrors this resource."
  });
}
