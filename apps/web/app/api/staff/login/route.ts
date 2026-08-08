import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`staff_login:${ip}`).allowed) {
      return NextResponse.json({ error: "Too many login attempts. Please wait 1 minute." }, { status: 429 });
    }

    const body = await request.json();
    const { restaurantSlug, staffId, pin } = body;

    if (!restaurantSlug || !staffId || !pin) {
      return NextResponse.json({ error: "Missing required login fields" }, { status: 400 });
    }

    if (!/^\d{4}$/.test(pin.toString())) {
      return NextResponse.json({ error: "PIN must be 4 numeric digits" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const staff = await prisma.staff.findFirst({
      where: {
        id: staffId,
        restaurantId: restaurant.id,
        active: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found or inactive" }, { status: 404 });
    }

    const pinMatch = await bcrypt.compare(pin.toString(), staff.pinHash);
    if (!pinMatch) {
      return NextResponse.json({ error: "Incorrect 4-digit PIN" }, { status: 401 });
    }

    const sessionPayload = {
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug,
      restaurantName: restaurant.name,
      loggedInAt: Date.now(),
      expiresAt: Date.now() + 2 * 3600_000, // 2-hour session
    };

    const response = NextResponse.json({
      success: true,
      session: sessionPayload,
    });

    // Store secure cookie for staff session
    response.cookies.set(`staff_session_${restaurant.slug}`, JSON.stringify(sessionPayload), {
      httpOnly: false, // Accessible to client JS for reactivity
      path: "/",
      maxAge: 7200, // 2 hours
    });

    return response;
  } catch (error: any) {
    console.error("POST /api/staff/login error:", error);
    return NextResponse.json({ error: "Staff login failed" }, { status: 500 });
  }
}
