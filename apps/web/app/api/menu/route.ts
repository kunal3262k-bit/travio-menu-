import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession(["ADMIN"]);
    const { categories } = await request.json();

    // categories is an array of Category with an items array of MenuItem
    // We will do this in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Process Categories
      const incomingCategoryIds = categories.filter((c: any) => !c.isNew).map((c: any) => c.id);
      
      // Deactivate categories not in incoming payload and cascade deactivate their menu items
      await tx.category.updateMany({
        where: { 
          restaurantId: session.restaurantId,
          id: { notIn: incomingCategoryIds }
        },
        data: { active: false }
      });

      await tx.menuItem.updateMany({
        where: {
          restaurantId: session.restaurantId,
          categoryId: { notIn: incomingCategoryIds }
        },
        data: { active: false, available: false }
      });

      let categoryIndex = 0;
      for (const cat of categories) {
        let dbCategory;
        if (cat.isNew) {
          dbCategory = await tx.category.findFirst({
            where: { restaurantId: session.restaurantId, name: cat.name }
          });
          if (!dbCategory) {
            dbCategory = await tx.category.create({
              data: {
                restaurantId: session.restaurantId,
                name: cat.name,
                sortOrder: categoryIndex,
                active: true
              }
            });
          } else {
            dbCategory = await tx.category.update({
              where: { id: dbCategory.id },
              data: { sortOrder: categoryIndex, active: true }
            });
          }
        } else {
          dbCategory = await tx.category.update({
            where: { id: cat.id, restaurantId: session.restaurantId },
            data: { name: cat.name, sortOrder: categoryIndex, active: true }
          });
        }

        // 2. Process Items for this category
        const incomingItemIds = cat.items.filter((i: any) => !i.isNew).map((i: any) => i.id);
        
        // Deactivate items that were removed
        await tx.menuItem.updateMany({
          where: {
            restaurantId: session.restaurantId,
            categoryId: dbCategory.id,
            id: { notIn: incomingItemIds }
          },
          data: { active: false, available: false }
        });

        let itemIndex = 0;
        for (const item of cat.items) {
          if (item.isNew) {
            const existingItem = await tx.menuItem.findFirst({
              where: { restaurantId: session.restaurantId, categoryId: dbCategory.id, name: item.name }
            });
            if (!existingItem) {
              await tx.menuItem.create({
                data: {
                  restaurantId: session.restaurantId,
                  categoryId: dbCategory.id,
                  name: item.name,
                  description: item.description,
                  pricePaise: item.pricePaise,
                  foodType: item.foodType,
                  spicyLevel: item.spicyLevel,
                  preparationMin: item.preparationMin || 15,
                  sortOrder: itemIndex,
                  active: true,
                  available: true
                }
              });
            } else {
              await tx.menuItem.update({
                where: { id: existingItem.id },
                data: {
                  description: item.description,
                  pricePaise: item.pricePaise,
                  foodType: item.foodType,
                  spicyLevel: item.spicyLevel,
                  preparationMin: item.preparationMin || 15,
                  sortOrder: itemIndex,
                  active: true,
                  available: true
                }
              });
            }
          } else {
            await tx.menuItem.update({
              where: { id: item.id, restaurantId: session.restaurantId },
              data: {
                categoryId: dbCategory.id,
                name: item.name,
                description: item.description,
                pricePaise: item.pricePaise,
                foodType: item.foodType,
                spicyLevel: item.spicyLevel,
                preparationMin: item.preparationMin || 15,
                sortOrder: itemIndex,
                active: true
              }
            });
          }
          itemIndex++;
        }
        categoryIndex++;
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Menu Update Error:", error);
    return error instanceof Response ? error : NextResponse.json({ error: "Failed to update menu" }, { status: 500 });
  }
}
