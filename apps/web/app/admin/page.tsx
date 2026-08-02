import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (session.user.role === "WAITER") redirect("/admin/waiter");
  if (session.user.role === "KITCHEN") redirect("/admin/kitchen");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Fetch today's orders
  const todayOrders = await prisma.order.findMany({
    where: { 
      restaurantId: session.user.restaurantId,
      createdAt: { gte: startOfDay }
    },
    include: { table: true }
  });

  const allTables = await prisma.table.findMany({
    where: { restaurantId: session.user.restaurantId }
  });

  // Calculate Metrics
  const completedOrders = todayOrders.filter(o => o.status === "COMPLETED");
  const pendingOrders = todayOrders.filter(o => ["PENDING", "PREPARING", "READY"].includes(o.status));
  
  const todaysSales = completedOrders.reduce((sum, o) => sum + o.subtotalPaise, 0);
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

  const metrics = {
    sales: todaysSales,
    orders: todaysOrdersCount,
    avgBill,
    tablesActive: tablesActiveCount,
    pending: pendingOrders.length,
    completed: completedOrders.length,
    scans: todayScans,
    conversion: conversionRate,
  };

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    select: { status: true }
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black mb-8">Restaurant Dashboard</h1>
      <DashboardClient initialMetrics={metrics} initialStatus={restaurant?.status || "LIVE"} />
    </div>
  );
}
