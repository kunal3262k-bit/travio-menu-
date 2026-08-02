import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, restaurantName } = await req.json();

    if (!email || !password || !restaurantName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique clean slug
    let baseSlug = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!baseSlug) baseSlug = "restaurant";
    
    let slug = baseSlug;
    let counter = 2;
    while (await prisma.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Restaurant with 10 default tables
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          slug,
          status: "SETUP",
          tables: {
            create: Array.from({ length: 10 }).map((_, i) => ({
              number: i + 1
            }))
          }
        }
      });

      // 2. Create User
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: "Admin", // Default name
          role: "ADMIN",
          restaurantId: restaurant.id
        }
      });

      return { restaurant, user };
    });

    return NextResponse.json(
      { message: "Registration successful", user: { id: result.user.id, email: result.user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
