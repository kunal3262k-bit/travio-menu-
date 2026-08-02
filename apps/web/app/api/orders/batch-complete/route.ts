import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderIds } = await req.json();

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: "COMPLETED" }
    });

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error("Batch Complete Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
