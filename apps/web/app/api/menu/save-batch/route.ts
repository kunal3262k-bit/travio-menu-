import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = session.user.restaurantId;
    const { categories } = await req.json();

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Clear existing menu to prevent unique constraint errors during setup
      await tx.category.deleteMany({
        where: { restaurantId }
      });

      for (let cIdx = 0; cIdx < categories.length; cIdx++) {
        const cat = categories[cIdx];
        
        const rawName = (cat.categoryName || "Category").trim();
        const existingCount = categories.slice(0, cIdx).filter(c => (c.categoryName || "Category").trim() === rawName).length;
        const uniqueName = existingCount > 0 ? `${rawName} ${existingCount + 1}` : rawName;

        // 1. Create Category
        const category = await tx.category.create({
          data: {
            restaurantId,
            name: uniqueName,
            sortOrder: cIdx,
          }
        });

        // 2. Create Items
        if (cat.items && Array.isArray(cat.items)) {
          const itemsToCreate = cat.items.map((item: any, iIdx: number) => ({
            restaurantId,
            categoryId: category.id,
            name: item.name && item.name.trim() !== "" ? item.name : `Unnamed Item ${iIdx + 1}`,
            pricePaise: Math.round(Number(item.price || 0) * 100),
            foodType: item.isVeg === false ? "NON_VEG" : "VEG", // Default to VEG if unknown to satisfy schema
            sortOrder: iIdx,
            available: true,
            preparationMin: 15
          }));

          if (itemsToCreate.length > 0) {
            await tx.menuItem.createMany({
              data: itemsToCreate
            });
          }
        }
      }
    });

    return NextResponse.json({ message: "Menu saved successfully" });

  } catch (error: any) {
    console.error("Save Batch Error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
