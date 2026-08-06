import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  if (session.user.role === "WAITER") redirect("/admin/waiter");
  if (session.user.role === "KITCHEN") redirect("/admin/kitchen");

  const now = new Date();
  const startOfDay = new Date(now);
  if (now.getHours() < 5) {
    startOfDay.setDate(startOfDay.getDate() - 1);
  }
  startOfDay.setHours(5, 0, 0, 0);

  // Fetch today's orders
  const todayOrders = await prisma.order.findMany({
    where: { 
      restaurantId: session.user.restaurantId,
      createdAt: { gte: startOfDay }
    },
    include: { table: true, items: true }
  });

  const allTables = await prisma.table.findMany({
    where: { restaurantId: session.user.restaurantId }
  });

  // Calculate Metrics
  const completedOrders = todayOrders.filter(o => o.status === "COMPLETED");
  const pendingOrders = todayOrders.filter(o => ["RECEIVED", "PREPARING", "READY"].includes(o.status));
  const cancelledOrders = todayOrders.filter(o => o.status === "CANCELLED");
  
  const todaysSales = completedOrders.reduce((sum, o) => sum + o.totalPaise, 0);
  const todaysOrdersCount = todayOrders.length;
  const avgBill = completedOrders.length > 0 ? (todaysSales / completedOrders.length) : 0;
  
  const activeTableIds = new Set(pendingOrders.map(o => o.tableId));
  const tablesActiveCount = activeTableIds.size;

  const todayScans = await prisma.tableScan.count({
    where: {
      restaurantId: session.user.restaurantId,
      createdAt: { gte: startOfDay }
    }
  });

  const conversionRate = todayScans > 0 ? ((todaysOrdersCount / todayScans) * 100).toFixed(1) : 0;

  // Payment Breakdown (using totalPaise for paid orders)
  const upiSales = completedOrders.filter(o => o.paymentMethod === "UPI").reduce((sum, o) => sum + o.totalPaise, 0);
  const cashSales = completedOrders.filter(o => o.paymentMethod === "CASH").reduce((sum, o) => sum + o.totalPaise, 0);
  const cardSales = completedOrders.filter(o => o.paymentMethod === "CARD").reduce((sum, o) => sum + o.totalPaise, 0);

  // Item Breakdown
  const itemMap: Record<string, { name: string, quantity: number, revenue: number }> = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemMap[item.nameSnapshot]) {
        itemMap[item.nameSnapshot] = { name: item.nameSnapshot, quantity: 0, revenue: 0 };
      }
      itemMap[item.nameSnapshot].quantity += item.quantity;
      itemMap[item.nameSnapshot].revenue += (item.pricePaise * item.quantity);
    });
  });
  const itemBreakdown = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5); // Top 5

  const lifetimePaidOrders = await prisma.order.count({
    where: {
      restaurantId: session.user.restaurantId,
      paymentStatus: "PAID"
    }
  });

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    select: { name: true, status: true, gstNumber: true, address: true, phone: true, createdAt: true }
  });

  const detailedOrders = todayOrders.map(o => ({
    id: o.id,
    orderNumber: o.dailyOrderNumber || o.orderNumber,
    sessionType: o.sessionType,
    tableNumber: o.table?.number || null,
    carBrand: o.carBrand,
    carColor: o.carColor,
    carLicensePlate: o.carLicensePlate,
    customerName: o.customerName,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod || "UNPAID",
    subtotalPaise: o.subtotalPaise,
    taxPaise: o.taxPaise,
    totalPaise: o.totalPaise,
    createdAt: o.createdAt,
    items: o.items.map(i => ({
      name: i.nameSnapshot,
      quantity: i.quantity,
      pricePaise: i.pricePaise
    }))
  }));

  const metrics = {
    sales: todaysSales,
    orders: todaysOrdersCount,
    avgBill,
    tablesActive: tablesActiveCount,
    pending: pendingOrders.length,
    completed: completedOrders.length,
    scans: todayScans,
    conversion: conversionRate,
    upiSales,
    cashSales,
    cardSales,
    cancelledOrders: cancelledOrders.length,
    itemBreakdown,
    lifetimePaidOrders,
    joinedDate: restaurant?.createdAt ? new Date(restaurant.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "launch",
    detailedOrders
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50">
      {/* ── PREMIUM HEADER BAR ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logo-full.png" alt="SwiftTab" className="h-8 object-contain" />
            <div className="h-5 w-px bg-slate-200"></div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">{restaurant?.name || "Dashboard"}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Admin Console</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/orders"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <span>📦</span>
              <span className="hidden sm:inline">Order History</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── DASHBOARD BODY ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <DashboardClient initialMetrics={metrics} initialStatus={restaurant?.status || "LIVE"} restaurant={restaurant} />
      </main>

      {/* ── FOOTER ── */}
      <footer className="text-center py-4 text-[11px] text-slate-400 font-semibold">
        Powered by SwiftTab
      </footer>
    </div>
  );
}
