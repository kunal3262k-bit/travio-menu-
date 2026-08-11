import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRestaurantTable } from "@/lib/tenant";
import { waiterRequestSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { requireAdminOrStaff } from "@/lib/staffAuth";
import { emitWaiterRequestCreated, emitWaiterRequestResolved } from "@/lib/socket";
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`waiter:${ip}`).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = waiterRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const context = await resolveRestaurantTable(parsed.data.restaurantSlug, parsed.data.tableNumber);
  if (!context) {
    return NextResponse.json({ error: "Restaurant or table not available" }, { status: 404 });
  }

  const waiterRequest = await prisma.waiterRequest.create({
    data: {
      restaurantId: context.restaurant.id,
      tableId: context.table.id,
      type: parsed.data.type
    }
  });

  // Server-side push: waiter calls / bill requests are broadcast from here.
  emitWaiterRequestCreated({
    restaurantId: context.restaurant.id,
    request: {
      id: waiterRequest.id,
      type: waiterRequest.type,
      tableId: waiterRequest.tableId,
    },
    table: { id: context.table.id, number: context.table.number },
  });

  return NextResponse.json({ request: waiterRequest }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  let session;
  try {
    session = await requireAdminOrStaff(["WAITER", "KITCHEN"]);
  } catch (error) {
    return error instanceof Response ? error : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { requestId, status } = body;

  if (!requestId || !status) {
    return NextResponse.json({ error: "Missing requestId or status" }, { status: 400 });
  }

  const updatedRequest = await prisma.waiterRequest.updateMany({
    where: { 
      id: requestId,
      restaurantId: session.restaurantId
    },
    data: { status }
  });

  if (updatedRequest.count === 0) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // Broadcast the resolution so every waiter device drops the request from its
  // actionable alert state immediately — no refresh required.
  emitWaiterRequestResolved({ restaurantId: session.restaurantId, requestId });

  return NextResponse.json({ ok: true });
}
