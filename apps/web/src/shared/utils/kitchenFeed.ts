import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

/**
 * CAR payment gate: is this order visible/actionable on the KDS?
 *
 * Rules (single source of truth, used by both the kitchen feed and the
 * realtime new-order emit gate so a hidden ticket can never alarm the KDS):
 *  - TABLE orders: always visible.
 *  - CAR orders: Round 1 must be PAID before it shows in the kitchen.
 *    Subsequent rounds in an active session where a round was already PAID
 *    are allowed (open tab).
 */
export function isKitchenVisibleOrder(
  order: { sessionType: string; paymentStatus: string; tableSessionId: string | null },
  paidSessionIds: ReadonlySet<string>
): boolean {
  if (order.sessionType !== "CAR") return true;
  if (order.paymentStatus === "PAID") return true;
  if (order.tableSessionId && paidSessionIds.has(order.tableSessionId)) return true;
  return false;
}

/**
 * Should a freshly created order push a kitchen_new_order alert?
 * Mirrors isKitchenVisibleOrder: an unpaid round-1 CAR order is gated out of
 * the KDS, so it must not create a kitchen alarm. TABLE orders and CAR rounds
 * whose session already has a PAID round (open tab) always alert.
 */
export async function shouldEmitKitchenNewOrder(order: {
  restaurantId: string;
  sessionType: string;
  paymentStatus: string;
  tableSessionId: string | null;
}): Promise<boolean> {
  if (order.sessionType !== "CAR") return true;
  if (order.paymentStatus === "PAID") return true;
  if (!order.tableSessionId) return false;
  const paidRound = await prisma.order.findFirst({
    where: {
      restaurantId: order.restaurantId,
      paymentStatus: "PAID",
      tableSessionId: order.tableSessionId,
    },
    select: { id: true },
  });
  return !!paidRound;
}

/**
 * Server-side kitchen feed with the CAR payment gate enforced.
 *
 * The gate runs here so tampering clients cannot force tickets onto the KDS.
 */
export async function fetchGatedKitchenOrders(
  restaurantId: string,
  options?: { statuses?: string[] }
) {
  const statusFilter = options?.statuses?.length
    ? ({ in: options.statuses as OrderStatus[] } as const)
    : ({ notIn: ["COMPLETED", "CANCELLED", "SERVED"] as OrderStatus[] } as const);

  const [orders, paidSessions] = await Promise.all([
    prisma.order.findMany({
      where: {
        restaurantId,
        status: statusFilter,
      },
      include: { table: true, items: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: {
        restaurantId,
        paymentStatus: "PAID",
        tableSessionId: { not: null },
      },
      select: { tableSessionId: true },
      distinct: ["tableSessionId"],
    }),
  ]);

  const paidSessionIds = new Set(
    paidSessions.map((p) => p.tableSessionId).filter((id): id is string => !!id)
  );

  return orders.filter((order) => isKitchenVisibleOrder(order, paidSessionIds));
}
