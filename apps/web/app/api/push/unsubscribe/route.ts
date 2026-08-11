import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/staffAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * Removes the authenticated staff member's subscription. Deletes are scoped
 * to the caller's staffId, so no cross-tenant (or cross-staff) deletion is
 * possible even if a valid endpoint string is guessed.
 */
export async function POST(req: NextRequest) {
  const staff = await requireStaff(["WAITER", "KITCHEN"]);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { endpoint } = (raw ?? {}) as { endpoint?: unknown };
  if (typeof endpoint !== "string" || endpoint.length < 10) {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }

  const result = await prisma.pushSubscription.deleteMany({
    where: { endpoint, staffId: staff.staffId },
  });

  return NextResponse.json({ ok: true, removed: result.count }, { status: 200 });
}
