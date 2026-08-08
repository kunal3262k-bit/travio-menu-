import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getStaffSession } from "@/lib/staffAuth";
import { fetchGatedKitchenOrders } from "@/lib/kitchenFeed";
import StaffKitchenClient from "./StaffKitchenClient";

export default async function StaffKitchenPage({ params }: { params: Promise<{ restaurantSlug: string }> }) {
  const { restaurantSlug } = await params;

  const staff = await getStaffSession();
  if (!staff || staff.role !== "KITCHEN") {
    redirect(`/${restaurantSlug}/staff/login`);
  }

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

  if (restaurant.id !== staff.restaurantId) {
    redirect(`/${restaurantSlug}/staff/login`);
  }

  // Fetch initial active orders for kitchen display — CAR payment gate enforced server-side.
  const initialOrders = await fetchGatedKitchenOrders(restaurant.id, {
    statuses: ["RECEIVED", "ACCEPTED", "PREPARING", "READY"],
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
