import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validation";
import { resolveRestaurantTable } from "@/lib/tenant";
import { rateLimit } from "@/lib/rate-limit";

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

  const longestPrep = Math.max(...menuItems.map((item) => item.preparationMin), 12);
  const estimatedReadyAt = new Date(Date.now() + longestPrep * 60_000);

  const order = await prisma.$transaction(async (tx) => {
    const lastOrder = await tx.order.findFirst({
      where: { restaurantId: context.restaurant.id },
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true }
    });

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
        subtotalPaise,
        instructions: parsed.data.instructions,
        estimatedReadyAt,
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

  return NextResponse.json({ order }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({
    message: "Use authenticated kitchen/admin order feeds in production. Realtime channel mirrors this resource."
  });
}
