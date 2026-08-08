import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getStaffSession } from "@/lib/staffAuth";
import StaffWaiterClient from "./StaffWaiterClient";

export default async function StaffWaiterPage({ params }: { params: Promise<{ restaurantSlug: string }> }) {
  const { restaurantSlug } = await params;

  const staff = await getStaffSession();
  if (!staff || staff.role !== "WAITER") {
    redirect(`/${restaurantSlug}/staff/login`);
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    select: { id: true, name: true, slug: true, upiQrUrl: true },
  });

  if (!restaurant) notFound();

  if (restaurant.id !== staff.restaurantId) {
    redirect(`/${restaurantSlug}/staff/login`);
  }

  // Fetch initial active tables & car sessions
  const tables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id, active: true },
    include: {
      orders: {
        where: { status: { not: "CANCELLED" } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { number: "asc" },
  });

  const activeOrders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
    },
    include: { table: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  const waiterRequests = await prisma.waiterRequest.findMany({
    where: {
      restaurantId: restaurant.id,
      status: { in: ["OPEN", "ACKNOWLEDGED"] },
    },
    include: { table: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <StaffWaiterClient
        restaurant={restaurant}
        initialTables={tables}
        initialOrders={activeOrders}
        initialRequests={waiterRequests}
      />
    </div>
  );
}
