import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderStatusClient from "./OrderStatusClient";

export default async function OrderTrackingPage({
  params
}: {
  params: Promise<{ restaurantSlug: string, tableNumber: string, orderId: string }>
}) {
  const { restaurantSlug, tableNumber, orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      restaurant: true,
      table: true
    }
  });

  if (!order || order.restaurant.slug !== restaurantSlug) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">{order.restaurant.name}</h1>
        <OrderStatusClient order={order} />
        <div className="mt-8 text-center">
          <a href={`/${restaurantSlug}/t/${tableNumber}`} className="text-emerald-700 font-medium hover:underline">
            ← Back to Menu
          </a>
        </div>
      </div>
    </div>
  );
}
