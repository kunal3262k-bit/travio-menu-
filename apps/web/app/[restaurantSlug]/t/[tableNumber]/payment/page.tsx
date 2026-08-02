import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PaymentClient from "./PaymentClient";

export default async function PaymentPage({
  params
}: {
  params: Promise<{ restaurantSlug: string, tableNumber: string }>
}) {
  const { restaurantSlug, tableNumber } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: {
      tables: { where: { number: parseInt(tableNumber, 10) } }
    }
  });

  if (!restaurant || restaurant.tables.length === 0) return notFound();

  // Find all open orders for this table
  const openOrders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      tableId: restaurant.tables[0].id,
      status: { notIn: ["COMPLETED", "CANCELLED"] }
    },
    include: { items: true }
  });

  if (openOrders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Open Bill</h1>
          <p className="text-gray-500">Your table does not have any active orders.</p>
          <a href={`/${restaurantSlug}/t/${tableNumber}`} className="mt-4 inline-block text-emerald-700 font-medium hover:underline">← Back to Menu</a>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotalPaise = openOrders.reduce((sum, order) => sum + order.subtotalPaise, 0);
  
  // Parse Settings for GST
  const settings = restaurant.settings as any;
  const gstEnabled = settings.gstEnabled ?? true; // Default true as per plan
  const gstPercentage = settings.gstPercentage ?? 5; // Default 5%
  
  const gstPaise = gstEnabled ? Math.round((subtotalPaise * gstPercentage) / 100) : 0;
  const grandTotalPaise = subtotalPaise + gstPaise;

  const orderIds = openOrders.map(o => o.id);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <PaymentClient 
        restaurant={restaurant}
        table={restaurant.tables[0]}
        orders={openOrders}
        subtotal={subtotalPaise}
        gstAmount={gstPaise}
        grandTotal={grandTotalPaise}
        orderIds={orderIds}
      />
    </div>
  );
}
