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
    <div className="min-h-screen bg-[#06080D] text-slate-100 font-sans">
      {/* ── PREMIUM HEADER BAR ── */}
      <header className="sticky top-0 z-40 bg-[#070D0B]/90 backdrop-blur-xl border-b border-emerald-950/70 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">{restaurant?.name || "Apex Auto Spa"}</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">Studio OS</span>
            </div>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>
            <p className="text-xs text-zinc-400 hidden sm:block">Shop Floor Dispatch & Defect Vault</p>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="/demo"
              target="_blank"
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>📱</span>
              <span className="hidden sm:inline">Live Client Tracker</span>
            </a>
            <a
              href="/admin/orders"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-md shadow-emerald-950/50 flex items-center gap-1.5 transition-all"
            >
              <span>📋</span>
              <span className="hidden sm:inline">Active Work Orders</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── DASHBOARD BODY ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <DashboardClient initialMetrics={metrics} initialStatus={restaurant?.status || "LIVE"} restaurant={restaurant} />
      </main>

      {/* ── FOOTER ── */}
      <footer className="text-center py-6 text-xs font-mono text-zinc-600 border-t border-zinc-900">
        SwiftTab Auto OS • Secure Studio Dispatch Engine
      </footer>
    </div>
  );
}
