import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/staffAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const subscriptionBodySchema = z.object({
  subscription: z.object({
    endpoint: z.string().min(10),
    keys: z.object({
      p256dh: z.string().min(10),
      auth: z.string().min(10),
    }),
  }),
  userAgent: z.string().trim().min(1).optional(),
});

/**
 * Registers (or re-registers) a push subscription for the authenticated
 * staff member. Staff-only (WAITER/KITCHEN). Tenant isolation is enforced by
 * using ONLY the restaurant/staff identity from the verified JWT cookie —
 * the client cannot choose which restaurant it subscribes to.
 *
 * Endpoint ownership: a browser endpoint can be re-used by another staff
 * member on the same device (switch staff). We detect that and re-assign the
 * endpoint to the current staff member instead of failing.
 */
export async function POST(req: NextRequest) {
  const staff = await requireStaff(["WAITER", "KITCHEN"]);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = subscriptionBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid subscription payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { subscription, userAgent } = parsed.data;
  const { endpoint, keys } = subscription;

  const existing = await prisma.pushSubscription.findUnique({ where: { endpoint } });
  if (existing && existing.staffId !== staff.staffId) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  }

  const record = await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      restaurantId: staff.restaurantId,
      restaurantSlug: staff.restaurantSlug,
      staffId: staff.staffId,
      role: staff.role,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: userAgent ?? null,
    },
    update: {
      restaurantId: staff.restaurantId,
      restaurantSlug: staff.restaurantSlug,
      staffId: staff.staffId,
      role: staff.role,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: userAgent ?? null,
    },
  });

  return NextResponse.json({ ok: true, id: record.id }, { status: 200 });
}
