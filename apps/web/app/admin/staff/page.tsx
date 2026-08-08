import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StaffClient from "./StaffClient";

export default async function AdminStaffPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    select: { name: true, slug: true },
  });

  const initialStaff = await prisma.staff.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h1 className="text-2xl font-black text-slate-900">Staff Roster Management</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage waiter & kitchen staff accounts, 4-digit PINs, and active status for {restaurant?.name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${restaurant?.slug}/staff/login`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
          >
            <span>📱 Staff Login Page</span>
          </a>
        </div>
      </header>

      <StaffClient initialStaff={initialStaff} restaurantSlug={restaurant?.slug || ""} />
    </div>
  );
}
