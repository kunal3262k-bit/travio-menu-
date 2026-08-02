import { prisma } from "@/lib/prisma";

export async function getRestaurantBySlug(slug: string) {
  return prisma.restaurant.findUnique({
    where: { slug },
    include: {
      tables: { where: { active: true }, orderBy: { number: "asc" } },
      categories: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            where: { available: true },
            orderBy: { sortOrder: "asc" }
          }
        }
      }
    }
  });
}

export async function resolveRestaurantTable(slug: string, tableNumber: number) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, serviceEnabled: true }
  });

  if (!restaurant || !restaurant.serviceEnabled) return null;

  const table = await prisma.table.findUnique({
    where: { restaurantId_number: { restaurantId: restaurant.id, number: tableNumber } }
  });

  if (!table || !table.active) return null;
  return { restaurant, table };
}
