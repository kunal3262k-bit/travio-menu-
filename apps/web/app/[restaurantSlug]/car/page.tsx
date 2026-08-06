import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CarOrderingClient from "./CarOrderingClient";

export default async function CarOrderingPage({ 
  params 
}: { 
  params: Promise<{ restaurantSlug: string }> 
}) {
  const { restaurantSlug } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: {
      categories: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            where: { active: true, available: true },
            orderBy: { sortOrder: "asc" }
          }
        }
      }
    }
  });

  if (!restaurant) notFound();

  return <CarOrderingClient restaurant={restaurant} />;
}
