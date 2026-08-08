import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staffList = await prisma.staff.findMany({
      where: { restaurantId: session.user.restaurantId },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ staff: staffList });
  } catch (error: any) {
    console.error("GET /api/admin/staff error:", error);
    return NextResponse.json({ error: "Failed to fetch staff roster" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, pin, role } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Staff name is required" }, { status: 400 });
    }

    if (!pin || !/^\d{4}$/.test(pin.toString())) {
      return NextResponse.json({ error: "A 4-digit numeric PIN is required" }, { status: 400 });
    }

    if (!role || (role !== "KITCHEN" && role !== "WAITER")) {
      return NextResponse.json({ error: "Role must be KITCHEN or WAITER" }, { status: 400 });
    }

    const pinHash = await bcrypt.hash(pin.toString(), 10);

    const staffMember = await prisma.staff.create({
      data: {
        restaurantId: session.user.restaurantId,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        pinHash,
        role,
        active: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ staff: staffMember }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/staff error:", error);
    return NextResponse.json({ error: "Failed to add staff member" }, { status: 500 });
  }
}
