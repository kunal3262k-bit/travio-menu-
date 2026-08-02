import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { updateOrderStatusSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  let session;
  try {
    session = await requireSession(["ADMIN", "KITCHEN"]);
  } catch (error) {
    return error instanceof Response ? error : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = updateOrderStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { orderId } = await params;
  const order = await prisma.order.updateMany({
    where: { id: orderId, restaurantId: session.restaurantId },
    data: { status: parsed.data.status }
  });

  if (order.count === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
