import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PrintButton from "./PrintButton";

export default async function SetupQRPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    include: { tables: { orderBy: { number: 'asc' } } }
  });

  if (!restaurant) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="print:hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Step 2 of 3</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Print QR Codes</h1>
            <p className="text-sm text-gray-500">
              {restaurant.tables.length} tables ready. Print this page and place the codes on your tables.
            </p>
          </div>
          <div className="flex gap-3">
            <PrintButton />
            <Link href="/admin/setup/live" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 text-center">
              Next: Go Live →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 print:grid-cols-3 print:gap-4">
        {restaurant.tables.map((table) => {
          const tableUrl = `${baseUrl}/${restaurant.slug}/t/${table.number}`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableUrl)}`;
          return (
            <div key={table.id} className="border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center bg-white print:border-black print:break-inside-avoid">
              <div className="w-full aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                <img src={qrUrl} alt={`Table ${table.number} QR`} className="w-full h-full object-contain" />
              </div>
              <h3 className="font-bold text-lg">{restaurant.name}</h3>
              <p className="text-gray-500 text-sm font-medium">Table {table.number}</p>
            </div>
          );
        })}
      </div>

      <div className="print:hidden flex items-center justify-between pt-4">
        <Link href="/admin/setup/menu" className="text-gray-500 hover:text-black font-medium text-sm">← Back to Menu</Link>
        <Link href="/admin/setup/live" className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800">Next: Go Live →</Link>
      </div>
    </div>
  );
}
