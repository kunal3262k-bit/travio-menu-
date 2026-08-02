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

  const isSetup = restaurant.status === "SETUP";

  return (
    <div className="min-h-screen bg-gray-50">
      {!isSetup && <AdminNav restaurantName={restaurant.name} userRole={session.user.role} />}
      <main className={!isSetup ? "lg:ml-64 pt-14 lg:pt-0" : ""}>
        {children}
      </main>
      {restaurant && <AdminNotifications restaurantId={restaurant.id} />}
    </div>
  );
}
