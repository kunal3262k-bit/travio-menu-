import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AvailabilityClient from "./AvailabilityClient";

export default async function MenuAvailabilityPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black mb-2">Menu Availability</h1>
      <p className="text-gray-500 mb-8">Quickly mark items as out of stock during a rush. Customers will instantly see these changes.</p>
      
      <AvailabilityClient categories={categories} />
    </div>
  );
}
