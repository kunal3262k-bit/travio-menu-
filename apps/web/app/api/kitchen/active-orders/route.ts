import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { fetchGatedKitchenOrders } from "@/lib/kitchenFeed";

export async function GET() {
  try {
    const session = await requireSession(["ADMIN", "KITCHEN"]);

    const orders = await fetchGatedKitchenOrders(session.restaurantId);

    return NextResponse.json({ orders });
  } catch (error: any) {
    if (error instanceof Response) return error;
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
