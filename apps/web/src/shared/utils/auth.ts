import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";

export type Session = {
  sub: string;
  restaurantId: string;
  role: "ADMIN" | "KITCHEN" | "WAITER";
  email: string;
};

export async function requireSession(roles?: Session["role"][]) {
  const nextSession = await getServerSession(authOptions);

  if (!nextSession || !nextSession.user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // NextAuth types might need assertion depending on how they are augmented
  const user = nextSession.user as any;
  const role = user.role || "ADMIN";
  const restaurantId = user.restaurantId;

  if (!restaurantId) {
    throw new Response("Unauthorized - No Restaurant Assigned", { status: 401 });
  }

  if (roles && !roles.includes(role)) {
    throw new Response("Unauthorized - Invalid Role", { status: 401 });
  }

  return {
    sub: user.id || "",
    restaurantId,
    role,
    email: user.email || ""
  } as Session;
}
