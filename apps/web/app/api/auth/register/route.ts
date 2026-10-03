import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email;
    const password = body.password;
    const studioName = body.studioName || body.restaurantName;
    const ownerName = body.ownerName;
    const phone = body.phone;
    const bayCount = parseInt(body.bayCount || "4", 10) || 4;

    if (!email || !password || !studioName || !ownerName || !phone) {
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
        { message: "A studio account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique clean slug
    let baseSlug = studioName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!baseSlug) baseSlug = "studio";
    
    let slug = baseSlug;
    let counter = 2;
    while (await prisma.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Studio record with default live status & bay count
      const restaurant = await tx.restaurant.create({
        data: {
          name: studioName,
          slug,
          phone,
          status: "LIVE", // Studio is live immediately, zero legacy setup trap
          currency: "USD",
          tables: {
            create: Array.from({ length: Math.min(Math.max(bayCount, 2), 12) }).map((_, i) => ({
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
          name: ownerName,
          role: "ADMIN",
          restaurantId: restaurant.id
        }
      });

      return { restaurant, user };
    });

    return NextResponse.json(
      { message: "Studio registered successfully", user: { id: result.user.id, email: result.user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Studio registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
