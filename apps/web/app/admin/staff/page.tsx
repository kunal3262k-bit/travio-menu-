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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 p-5 sm:p-6 rounded-2xl border border-emerald-950/70 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 w-[18px] h-[18px] text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Technicians Roster</h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Manage technician accounts, 4-digit PINs &amp; active status for {restaurant?.name}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${restaurant?.slug}/staff/login`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/50 transition flex items-center gap-2"
          >
            <span>📱 Technician Login</span>
          </a>
        </div>
      </header>

      <StaffClient initialStaff={initialStaff} restaurantSlug={restaurant?.slug || ""} />
    </div>
  );
}
