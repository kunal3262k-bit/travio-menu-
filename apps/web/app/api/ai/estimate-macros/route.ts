import { NextRequest, NextResponse } from "next/server";
import { estimateDishNutrition } from "@/lib/macroEstimator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (Array.isArray(items)) {
      // Bulk estimation
      const enriched = items.map((item: any) => {
        const nutrition = estimateDishNutrition(item.name, item.categoryName, item.description, item.foodType);
        return {
          ...item,
          ...nutrition
        };
      });
      return NextResponse.json({ success: true, items: enriched });
    }

    const { dishName, categoryName, description, foodType } = body;
    if (!dishName || typeof dishName !== "string") {
      return NextResponse.json({ error: "dishName or items array is required" }, { status: 400 });
    }

    const nutrition = estimateDishNutrition(dishName, categoryName, description, foodType);

    return NextResponse.json({
      success: true,
      dishName,
      ...nutrition
    });
  } catch (error: any) {
    console.error("AI Macro Estimation error:", error);
    return NextResponse.json({ error: error.message || "Failed to estimate macros" }, { status: 500 });
  }
}
