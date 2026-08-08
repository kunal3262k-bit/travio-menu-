import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fetchGatedKitchenOrders } from "@/lib/kitchenFeed";
import KitchenClient from "./KitchenClient";

export default async function KitchenDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const restaurantId = session.user.restaurantId;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { name: true, gstNumber: true, address: true, phone: true }
  });

  // Fetch initial active orders — CAR payment gate enforced server-side.
  const initialOrders = await fetchGatedKitchenOrders(restaurantId);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="flex items-center justify-between pb-4 border-b border-gray-700 mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo-full.png" alt="SwiftTab" className="h-8 object-contain bg-white p-1 rounded" />
          <div className="h-6 w-px bg-gray-700"></div>
          <h1 className="text-2xl font-bold">Kitchen Display</h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Sync
          </span>
        </div>
      </header>
      
      <KitchenClient initialOrders={initialOrders} restaurantId={restaurantId} restaurant={restaurant || { name: "SwiftTab Restaurant" }} />
    </div>
  );
}
