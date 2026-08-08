import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StaffKitchenClient from "./StaffKitchenClient";

export default async function StaffKitchenPage({ params }: { params: Promise<{ restaurantSlug: string }> }) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: {
      categories: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!restaurant) notFound();

  // Fetch initial active orders for kitchen display
  const initialOrders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      status: { in: ["RECEIVED", "ACCEPTED", "PREPARING", "READY"] },
    },
    include: {
      table: true,
      items: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <StaffKitchenClient
        restaurant={restaurant}
        initialOrders={initialOrders}
      />
    </div>
  );
}
