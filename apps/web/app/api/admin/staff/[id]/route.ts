import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, phone, pin, role, active } = body;

    const existing = await prisma.staff.findFirst({
      where: { id, restaurantId: session.user.restaurantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (role !== undefined && (role === "KITCHEN" || role === "WAITER")) updateData.role = role;
    if (active !== undefined) updateData.active = Boolean(active);

    if (pin && /^\d{4}$/.test(pin.toString())) {
      updateData.pinHash = await bcrypt.hash(pin.toString(), 10);
    }

    const updated = await prisma.staff.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        active: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ staff: updated });
  } catch (error: any) {
    console.error("PATCH /api/admin/staff/[id] error:", error);
    return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Deactivate instead of deleting to preserve history/audit trail
    await prisma.staff.updateMany({
      where: { id, restaurantId: session.user.restaurantId },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/staff/[id] error:", error);
    return NextResponse.json({ error: "Failed to deactivate staff member" }, { status: 500 });
  }
}
