import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password !== process.env.DEMO_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Delete existing demo restaurant
    await prisma.restaurant.deleteMany({
      where: { slug: "demo" }
    });

    const hashedPassword = await bcrypt.hash("demo123", 10);

    // 2. Create Restaurant & Owner
    const restaurant = await prisma.restaurant.create({
      data: {
        name: "Demo Kitchen",
        slug: "demo",
        phone: "9999999999",
        brandColor: "#059669",
        users: {
          create: {
            name: "Demo Owner",
            email: "demo@dineflow.com",
            passwordHash: hashedPassword,
            role: UserRole.ADMIN
          }
        },
        tables: {
          create: [
            { number: 1, label: "Table 1" },
            { number: 2, label: "Table 2" }
          ]
        }
      }
    });

    // 3. Create Categories & Items
    await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "Starters",
        items: {
          create: [
            { restaurantId: restaurant.id, name: "Paneer Tikka", pricePaise: 25000, foodType: "VEG", available: true },
            { restaurantId: restaurant.id, name: "Chicken Wings", pricePaise: 32000, foodType: "NON_VEG", available: true }
          ]
        }
      }
    });

    await prisma.category.create({
      data: {
        restaurantId: restaurant.id,
        name: "Main Course",
        items: {
          create: [
            { restaurantId: restaurant.id, name: "Butter Chicken", pricePaise: 45000, foodType: "NON_VEG", available: true },
            { restaurantId: restaurant.id, name: "Dal Makhani", pricePaise: 28000, foodType: "VEG", available: true }
          ]
        }
      }
    });

    return NextResponse.json({ success: true, message: "Demo environment seeded successfully." });
  } catch (error: any) {
    console.error("Demo seed error:", error);
    return NextResponse.json({ error: "Failed to seed demo environment" }, { status: 500 });
  }
}
