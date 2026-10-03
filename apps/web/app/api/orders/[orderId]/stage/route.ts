import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitOrderStatusChanged } from "@/lib/socket";

const VALID_STAGES = [
  "DECON_WASH",
  "PAINT_CORRECTION",
  "CERAMIC_PPF",
  "IR_CURING",
  "COMPLETED",
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { stage } = body;

    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${VALID_STAGES.join(", ")}` },
        { status: 400 }
      );
    }

    // Handle demo mock vehicle IDs gracefully
    if (orderId.startsWith("wo-") || orderId.startsWith("demo-")) {
      return NextResponse.json({
        ok: true,
        isDemo: true,
        orderId,
        stage,
        message: "Demo vehicle stage advanced in memory",
      });
    }

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, restaurantId: true, tableId: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map bay stage to operational OrderStatus
    let nextStatus = existing.status;
    if (stage === "DECON_WASH") nextStatus = "RECEIVED";
    else if (stage === "PAINT_CORRECTION" || stage === "CERAMIC_PPF") nextStatus = "PREPARING";
    else if (stage === "IR_CURING") nextStatus = "READY";
    else if (stage === "COMPLETED") nextStatus = "COMPLETED";

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        stage,
        status: nextStatus,
        ...(stage === "COMPLETED" ? { paymentStatus: "PAID" } : {}),
      },
    });

    try {
      emitOrderStatusChanged({
        restaurantId: existing.restaurantId,
        orderId: existing.id,
        status: nextStatus,
        tableId: existing.tableId,
      });
    } catch {
      // Socket optional
    }

    return NextResponse.json({
      ok: true,
      order: updated,
      message: `Vehicle transitioned to ${stage}`,
    });
  } catch (error: any) {
    console.error("Stage update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update vehicle bay stage" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        dailyOrderNumber: true,
        carBrand: true,
        carModel: true,
        carYear: true,
        carColor: true,
        carLicensePlate: true,
        stage: true,
        status: true,
        customerName: true,
        customerPhone: true,
        defectsSummary: true,
        intakePhotos: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}
