import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReactNode } from "react";
import { AdminNav } from "../../components/admin/AdminNav";
import { AdminNotifications } from "../../components/admin/AdminNotifications";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    select: { id: true, name: true, status: true, slug: true }
  });

  if (!restaurant) redirect("/login");

  return (
    <div className="min-h-screen bg-[#06080D] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 antialiased">
      <AdminNav restaurantName={restaurant.name} userRole={session.user.role} />
      <main className="lg:ml-64 pt-14 lg:pt-0 print:ml-0 print:pt-0">
        {children}
      </main>
      <AdminNotifications restaurantId={restaurant.id} />
    </div>
  );
}
