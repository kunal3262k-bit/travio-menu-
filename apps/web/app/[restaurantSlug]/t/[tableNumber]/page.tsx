import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CustomerMenu from "@/components/customer/CustomerMenu";
import { ScanTracker } from "../../../../components/ScanTracker";

export default async function TablePage({ 
  params 
}: { 
  params: Promise<{ restaurantSlug: string, tableNumber: string }> 
}) {
  const { restaurantSlug, tableNumber } = await params;

  // 1. Fetch Restaurant & Validate
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: {
      categories: {
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          items: {
            where: { available: true, active: true },
            orderBy: { sortOrder: 'asc' }
          }
        }
      },
      tables: {
        where: { number: parseInt(tableNumber, 10) }
      },
      upsellRules: {
        where: { active: true },
        orderBy: { priority: 'asc' }
      }
    }
  });

  if (!restaurant || restaurant.tables.length === 0) {
    return notFound();
  }

  const table = restaurant.tables[0];

  const settings = restaurant.settings as any;
  const businessHours = settings.businessHours || "Mon-Sun, 11 AM - 11 PM";

  // 2. Handle Status
  if (restaurant.status === "CLOSED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <h1 className="text-3xl font-bold mb-4">{restaurant.name}</h1>
        <div className="bg-white border rounded-xl p-8 max-w-sm w-full">
          <h2 className="text-xl font-semibold text-gray-800">Restaurant Closed</h2>
          <p className="font-medium mt-4">Opening Hours</p>
          <p className="text-gray-500 mb-4">{businessHours}</p>
          <p className="text-red-500 font-bold">Ordering is currently closed.</p>
        </div>
      </div>
    );
  }

  if (restaurant.status === "TEMPORARILY_BUSY") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <h1 className="text-3xl font-bold mb-4">{restaurant.name}</h1>
        <div className="bg-white border rounded-xl p-8 max-w-sm w-full">
          <h2 className="text-xl font-semibold text-orange-600 mb-2">Kitchen is currently busy</h2>
          <p className="text-gray-600 font-medium">Estimated wait: 35 minutes.</p>
          <p className="text-sm text-gray-400 mt-4">Please check back shortly.</p>
        </div>
      </div>
    );
  }

  if (restaurant.status === "PAUSED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <h1 className="text-3xl font-bold mb-4">{restaurant.name}</h1>
        <div className="bg-white border rounded-xl p-8 max-w-sm w-full">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-orange-600" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">High Volume</h2>
          <p className="text-gray-600 font-medium">Our kitchen is currently experiencing high volume.</p>
          <p className="text-orange-600 font-bold mt-4">Please place your order directly with your waiter.</p>
        </div>
      </div>
    );
  }

  if (restaurant.status === "SETUP") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Menu Temporarily Unavailable</h1>
      </div>
    );
  }

  // 3. Check for Open Orders (strictly by session, with a 6-hour fallback for pre-migration orders)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const openOrdersCount = await prisma.order.count({
    where: {
      tableId: table.id,
      restaurantId: restaurant.id,
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      OR: [
        { tableSessionId: table.currentSessionId ?? "NONE_ACTIVE" },
        { tableSessionId: null, createdAt: { gte: sixHoursAgo } }
      ]
    }
  });

  // 4. Render Live Menu
  return (
    <>
      <ScanTracker restaurantId={restaurant.id} tableId={table.id} />
      <CustomerMenu 
        restaurant={restaurant} 
        table={table} 
        categories={restaurant.categories} 
        openOrdersCount={openOrdersCount}
      />
    </>
  );
}
