import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(["ADMIN"]);
    const { number, label } = await request.json();

    const table = await prisma.table.create({
      data: {
        restaurantId: session.restaurantId,
        number: parseInt(number, 10),
        label
      }
    });

    return NextResponse.json({ table });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Table number already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession(["ADMIN"]);
    const { id, number, label, active } = await request.json();

    const table = await prisma.table.updateMany({
      where: { id, restaurantId: session.restaurantId },
      data: {
        ...(number !== undefined && { number: parseInt(number, 10) }),
        ...(label !== undefined && { label }),
        ...(active !== undefined && { active })
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSession(["ADMIN"]);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.table.deleteMany({
      where: { id, restaurantId: session.restaurantId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 });
  }
}
