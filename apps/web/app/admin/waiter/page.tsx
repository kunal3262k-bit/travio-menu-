import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WaiterClient from "./WaiterClient";

export default async function WaiterDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const restaurantId = session.user.restaurantId;

  // Fetch initial waiter requests
  const requests = await prisma.waiterRequest.findMany({
    where: { 
      restaurantId,
      status: { notIn: ["RESOLVED"] }
    },
    include: {
      table: true
    },
    orderBy: { createdAt: 'asc' }
  });
  
  // Fetch ready orders
  const readyOrders = await prisma.order.findMany({
    where: { 
      restaurantId,
      status: "READY"
    },
    include: {
      table: true
    },
    orderBy: { updatedAt: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex items-center justify-between pb-4 border-b mb-6">
        <h1 className="text-2xl font-bold">Waiter Panel</h1>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="flex items-center gap-2 text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Sync Active
          </span>
        </div>
      </header>
      
      <WaiterClient 
        initialRequests={requests} 
        initialReadyOrders={readyOrders} 
        restaurantId={restaurantId} 
      />
    </div>
  );
}
