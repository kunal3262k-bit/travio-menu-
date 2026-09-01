import { NextRequest, NextResponse } from "next/server";
import { resolveDishStudioAssets } from "@/lib/aiFoodStudio";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dishName, categoryName, description, foodType } = body;

    if (!dishName || typeof dishName !== "string") {
      return NextResponse.json({ error: "dishName is required" }, { status: 400 });
    }

    const studioAssets = resolveDishStudioAssets(dishName, categoryName, description, foodType);

    return NextResponse.json({
      success: true,
      dishName,
      primaryUrl: studioAssets.primaryUrl,
      gallery: studioAssets.gallery,
      aiPrompt: studioAssets.aiPrompt,
      isHotSizzler: studioAssets.isHotSizzler,
      chefNote: studioAssets.chefNote
    });
  } catch (error: any) {
    console.error("AI Food Studio generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate studio assets" }, { status: 500 });
  }
}
