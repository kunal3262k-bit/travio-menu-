import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;
  const restaurantId = session.user.restaurantId;

  const existingOrder = await prisma.order.findFirst({
    where: { id: orderId, restaurantId },
    include: { table: true, items: true }
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isAlreadyPrinted = existingOrder.printCount > 0 || existingOrder.paymentStatus === "PAID";

  let invoiceNumber = existingOrder.invoiceNumber;
  if (!invoiceNumber) {
    const lastInvoice = await prisma.order.findFirst({
      where: { restaurantId, invoiceNumber: { not: null } },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true }
    });
    invoiceNumber = (lastInvoice?.invoiceNumber ?? 1000) + 1;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      invoiceNumber,
      printCount: { increment: 1 },
      lastPrintedAt: new Date()
    },
    include: { table: true, items: true }
  });

  return NextResponse.json({
    order: {
      ...updatedOrder,
      isReprint: isAlreadyPrinted
    }
  });
}
