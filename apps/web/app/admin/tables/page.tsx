import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TablesClient from "./TablesClient";

export default async function TablesAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    include: { tables: { orderBy: { number: 'asc' } } }
  });

  if (!restaurant) redirect("/login");

  const baseUrl = process.env.APP_URL || "http://localhost:3001";

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <TablesClient restaurant={restaurant} initialTables={restaurant.tables} baseUrl={baseUrl} />
    </div>
  );
}
