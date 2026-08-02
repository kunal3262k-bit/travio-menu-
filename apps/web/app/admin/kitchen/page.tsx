import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KitchenClient from "./KitchenClient";

export default async function KitchenDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const restaurantId = session.user.restaurantId;

  // Fetch initial active orders
  const initialOrders = await prisma.order.findMany({
    where: { 
      restaurantId,
      status: { notIn: ["COMPLETED", "CANCELLED", "SERVED"] }
    },
    include: {
      table: true,
      items: true
    },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="flex items-center justify-between pb-4 border-b border-gray-700 mb-6">
        <h1 className="text-2xl font-bold">Kitchen Display</h1>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Sync
          </span>
        </div>
      </header>
      
      <KitchenClient initialOrders={initialOrders} restaurantId={restaurantId} />
    </div>
  );
}
