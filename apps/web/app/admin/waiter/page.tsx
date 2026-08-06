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

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { name: true, gstNumber: true, address: true, phone: true }
  });

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
      table: true,
      items: true
    },
    orderBy: { updatedAt: 'asc' }
  });

  // Fetch claimed payments
  const claimedOrders = await prisma.order.findMany({
    where: {
      restaurantId,
      paymentStatus: "CLAIMED"
    },
    include: { table: true, items: true }
  });

  // Group claimed orders by table or car session
  const claimsByTable = claimedOrders.reduce((acc: any, order: any) => {
    const key = order.tableId || `car_${order.id}`;
    if (!acc[key]) {
      const carLabel = (order.carColor || order.carBrand) 
        ? `🚗 ${order.carColor || ""} ${order.carBrand || ""} (${order.customerName || "Car"})`.trim() 
        : `🚗 ${order.customerName || "Car Customer"}`;

      acc[key] = {
        tableId: key,
        tableNumber: order.table?.number ? `Table ${order.table.number}` : carLabel,
        method: order.paymentMethod,
        totalPaise: 0,
        subtotalPaise: 0,
        taxPaise: 0,
        orderIds: [],
        orderNumber: order.dailyOrderNumber || order.orderNumber,
        customerName: order.customerName,
        items: []
      };
    }
    acc[key].totalPaise += order.totalPaise;
    acc[key].subtotalPaise += (order.subtotalPaise || Math.round(order.totalPaise / 1.05));
    acc[key].taxPaise += (order.taxPaise || 0);
    acc[key].orderIds.push(order.id);
    if (order.items) {
      acc[key].items.push(...order.items);
    }
    return acc;
  }, {});

  const pendingPayments = Object.values(claimsByTable);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex items-center justify-between pb-4 border-b mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo-full.png" alt="SwiftTab" className="h-8 object-contain" />
          <div className="h-6 w-px bg-gray-200"></div>
          <h1 className="text-xl font-black text-slate-900">Waiter Panel</h1>
        </div>
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
        initialPendingPayments={pendingPayments}
        restaurantId={restaurantId}
        restaurant={restaurant || { name: "SwiftTab Restaurant" }} 
      />
    </div>
  );
}
