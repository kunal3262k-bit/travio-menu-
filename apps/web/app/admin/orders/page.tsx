import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrdersClient from "./OrdersClient";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  if (session.user.role === "WAITER") redirect("/admin/waiter");
  if (session.user.role === "KITCHEN") redirect("/admin/kitchen");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    select: { name: true, gstNumber: true, address: true, phone: true }
  });

  // Calculate default 5am business day cutoff for "Today"
  const now = new Date();
  const startOfDay = new Date(now);
  if (now.getHours() < 5) {
    startOfDay.setDate(startOfDay.getDate() - 1);
  }
  startOfDay.setHours(5, 0, 0, 0);

  // Fetch initial order history
  const initialOrders = await prisma.order.findMany({
    where: { 
      restaurantId: session.user.restaurantId,
      createdAt: { gte: startOfDay }
    },
    include: {
      table: true,
      items: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-4">
            <img src="/logo-full.png" alt="SwiftTab" className="h-10 object-contain bg-white p-1.5 rounded-lg" />
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <h1 className="text-2xl font-black text-white">Order History & Admin Billing</h1>
              <p className="text-xs text-slate-400">Search, filter date ranges & reprint GST bills</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl transition"
            >
              ← Admin Dashboard
            </a>
          </div>
        </header>

        <OrdersClient 
          initialOrders={initialOrders} 
          restaurant={restaurant || { name: "SwiftTab Restaurant" }} 
        />
      </div>
    </div>
  );
}
