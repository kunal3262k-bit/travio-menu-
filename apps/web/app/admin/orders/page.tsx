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

  // Fetch initial order history (most recent 200 orders across dates)
  const initialOrders = await prisma.order.findMany({
    where: {
      restaurantId: session.user.restaurantId,
    },
    include: {
      table: true,
      items: true
    },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return (
    <div className="min-h-screen bg-[#06080D] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-emerald-950/70 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </div>
            <div className="h-8 w-px bg-zinc-800 hidden sm:block" />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Vehicle Work Orders</h1>
              <p className="text-xs text-zinc-400 font-mono">Search, filter date ranges &amp; manage service invoices</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs rounded-xl transition"
            >
              ← Studio Dashboard
            </a>
          </div>
        </header>

        <OrdersClient
          initialOrders={initialOrders}
          restaurant={restaurant || { name: "Apex Auto Spa" }}
        />
      </div>
    </div>
  );
}
