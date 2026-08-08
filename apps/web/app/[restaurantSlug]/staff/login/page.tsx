import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StaffLoginClient from "./StaffLoginClient";

export default async function StaffLoginPage({ params }: { params: Promise<{ restaurantSlug: string }> }) {
  const { restaurantSlug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });

  if (!restaurant) notFound();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <StaffLoginClient restaurant={restaurant} />
    </div>
  );
}
