import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "local";
    if (!rateLimit(`feedback:${ip}`, { max: 30, windowMs: 60_000 }).allowed) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const { restaurantSlug, rating, comment } = await request.json();

    if (!restaurantSlug || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid feedback payload. Rating must be between 1 and 5." }, { status: 400 });
    }

    if (comment !== undefined && comment !== null) {
      if (typeof comment !== "string" || comment.trim().length > 1000) {
        return NextResponse.json({ error: "Feedback comment exceeds maximum length of 1000 characters." }, { status: 400 });
      }
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
