import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HistoryClient from "./HistoryClient";

export default async function OrderHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "WAITER")) {
    redirect("/login");
  }

  // Fetch last 100 orders as initial state
  const initialOrders = await prisma.order.findMany({
    where: {
      restaurantId: session.user.restaurantId
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: true,
      table: true
    }
  });

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId }
  });

  if (!restaurant) redirect("/login");

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <p className="text-sm text-gray-500">View past orders and reprint GST invoices.</p>
      </div>
      <HistoryClient initialOrders={initialOrders} restaurant={restaurant} />
    </div>
  );
}
