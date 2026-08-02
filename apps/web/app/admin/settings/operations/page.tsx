import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OperationsClient from "./OperationsClient";

export default async function OperationsSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId }
  });

  if (!restaurant) redirect("/login");

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Operations & Status</h2>
      <OperationsClient restaurant={restaurant} />
    </div>
  );
}
