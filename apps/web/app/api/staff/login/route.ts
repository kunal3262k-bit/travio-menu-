import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { signStaffSession, setStaffSessionCookie } from "@/lib/staffAuth";
import { StaffAuthConfigError } from "@/lib/staffAuthConfig";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`staff_login:${ip}`).allowed) {
      return NextResponse.json({ error: "Too many login attempts. Please wait 1 minute." }, { status: 429 });
    }

    const forwardedProto = request.headers.get("x-forwarded-proto");
    const requestSecure = forwardedProto?.split(",")[0]?.trim().toLowerCase() === "https";

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

    // Sign the session so staff identity is server-verifiable and tamper-proof.
    const token = await signStaffSession({
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role as "WAITER" | "KITCHEN",
      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug,
      restaurantName: restaurant.name,
      loggedInAt: Date.now(),
    });

    const response = NextResponse.json({
      success: true,
      session: sessionPayload,
    });

    // Store signed, httpOnly staff session cookie (server-verified, not client-tamperable).
    setStaffSessionCookie(response, token, { requestSecure });

    return response;
  } catch (error: any) {
    if (error instanceof StaffAuthConfigError) {
      console.error("POST /api/staff/login config error:", error.message);
      return NextResponse.json({ error: `Server configuration error: ${error.message}` }, { status: 503 });
    }
    console.error("POST /api/staff/login error:", error);
    return NextResponse.json({ error: "Staff login failed" }, { status: 500 });
  }
}
