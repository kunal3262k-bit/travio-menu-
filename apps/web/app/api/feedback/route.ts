import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { restaurantSlug, rating, comment } = await request.json();

    if (!restaurantSlug || typeof rating !== "number") {
      return NextResponse.json({ error: "Invalid feedback payload" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug }
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        restaurantId: restaurant.id,
        rating,
        comment: comment ? String(comment).trim() : null
      }
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error: any) {
    console.error("Feedback creation error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
