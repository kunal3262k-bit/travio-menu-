import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { requireSession } from "./auth";
import { resolveStaffCookieSecure, resolveStaffJwtSecret } from "./staffAuthConfig";

const PAYMENT_CONFIRMATION_ALLOWED_ROLES = new Set(["ADMIN", "WAITER", "KITCHEN"]);

export function isPaymentConfirmationAllowedRole(role?: string | null): boolean {
  return !!role && PAYMENT_CONFIRMATION_ALLOWED_ROLES.has(role);
}

export const STAFF_COOKIE_NAME = "swifttab_staff_session";

export type StaffSession = {
  staffId: string;
  staffName: string;
  role: "WAITER" | "KITCHEN";
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string;
  loggedInAt: number;
};

const getSecret = () => resolveStaffJwtSecret(process.env);

export async function signStaffSession(payload: StaffSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(getSecret());
}

export async function verifyStaffSessionToken(token?: string | null): Promise<StaffSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as StaffSession;
  } catch {
    return null;
  }
}

/** Reads + verifies the staff session JWT from the httpOnly cookie and validates active status in DB. */
export async function getStaffSession(options?: { verifyActive?: boolean }): Promise<StaffSession | null> {
  const store = await cookies();
  const token = store.get(STAFF_COOKIE_NAME)?.value;
  const session = await verifyStaffSessionToken(token);
  if (!session) return null;

  if (options?.verifyActive !== false) {
    const staff = await prisma.staff.findUnique({
      where: { id: session.staffId },
      select: { active: true, restaurantId: true, role: true }
    });
    if (!staff || !staff.active || staff.restaurantId !== session.restaurantId) {
      return null;
    }
  }

  return session;
}

/** Throws a 401 Response for route handlers when the staff session is missing/invalid or deactivated. */
export async function requireStaff(roles?: StaffSession["role"][]): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) {
    throw new Response("Unauthorized", { status: 401 });
  }
  if (roles && !roles.includes(session.role)) {
    throw new Response("Unauthorized - Invalid Role", { status: 401 });
  }
  return session;
}

/**
 * Accepts EITHER an admin next-auth session OR a verified staff cookie session.
 * Used by shared routes (mark-vacated, waiter-requests, order status).
 */
export async function requireAdminOrStaff(roles?: StaffSession["role"][]): Promise<{
  kind: "admin" | "staff";
  restaurantId: string;
  staffId?: string;
  staffName?: string;
  role?: string;
}> {
  const staff = await getStaffSession();
  if (staff) {
    if (roles && !roles.includes(staff.role)) {
      throw new Response("Unauthorized - Invalid Role", { status: 401 });
    }
    return {
      kind: "staff",
      restaurantId: staff.restaurantId,
      staffId: staff.staffId,
      staffName: staff.staffName,
      role: staff.role,
    };
  }

  const admin = await requireSession(["ADMIN", "KITCHEN", "WAITER"]);
  return {
    kind: "admin",
    restaurantId: admin.restaurantId,
    role: admin.role,
  };
}

/** Sets the signed, httpOnly staff session cookie on a NextResponse. */
export function setStaffSessionCookie(response: NextResponse, token: string, options?: { requestSecure?: boolean }) {
  response.cookies.set(STAFF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: resolveStaffCookieSecure(process.env, options?.requestSecure ?? false),
    sameSite: "lax",
    path: "/",
    maxAge: 7200,
  });
}

/** Explicitly clears the staff session cookie on logout. */
export function clearStaffSessionCookie(response: NextResponse, options?: { requestSecure?: boolean }) {
  response.cookies.set(STAFF_COOKIE_NAME, "", {
    httpOnly: true,
    secure: resolveStaffCookieSecure(process.env, options?.requestSecure ?? false),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

