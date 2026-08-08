import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrStaff } from "@/lib/staffAuth";
import { updateOrderStatusSchema } from "@/lib/validation";
import { emitOrderStatusChanged } from "@/lib/socket";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  let auth;
  try {
    auth = await requireAdminOrStaff(["KITCHEN", "WAITER"]);
  } catch (error) {
    return error instanceof Response ? error : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = updateOrderStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { orderId } = await params;
  const existing = await prisma.order.findFirst({
    where: { id: orderId, restaurantId: auth.restaurantId },
    select: { id: true, tableId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: parsed.data.status },
  });

  // Server-side push: status changes are broadcast from here, never from a client socket.
  emitOrderStatusChanged({
    restaurantId: auth.restaurantId,
    orderId,
    status: parsed.data.status,
    tableId: existing.tableId,
  });

  return NextResponse.json({ ok: true });
}
