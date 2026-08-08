import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

/**
 * Server-side kitchen feed with the CAR payment gate enforced.
 *
 * Rules (mirrors the old client-side filter in the admin kitchen panel):
 *  - TABLE orders: always visible.
 *  - CAR orders: Round 1 must be PAID before it shows in the kitchen.
 *    Subsequent rounds in an active session where a round was already PAID
 *    are allowed (open tab).
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

  const paidSessionIds = new Set(paidSessions.map((p) => p.tableSessionId));

  return orders.filter((order) => {
    if (order.sessionType !== "CAR") return true;
    if (order.paymentStatus === "PAID") return true;
    if (order.tableSessionId && paidSessionIds.has(order.tableSessionId)) return true;
    return false;
  });
}
