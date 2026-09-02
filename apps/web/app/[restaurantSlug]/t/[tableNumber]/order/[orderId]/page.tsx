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
    <div className="min-h-screen bg-[#070D0B] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-black text-center mb-6 text-white">{order.restaurant.name}</h1>
        <OrderStatusClient order={order} />
        <div className="mt-6 text-center">
          <a href={`/${restaurantSlug}/t/${tableNumber}`} className="text-emerald-400 font-bold text-sm hover:underline">
            ← Return to Table Menu
          </a>
        </div>
      </div>
    </div>
  );
}
