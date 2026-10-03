import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { prisma } from "@/lib/prisma";
import { emitOrderCreated } from "@/lib/socket";

const PACKAGE_PRICES: Record<string, number> = {
  "Concourse 2-Stage Polish + Ceramic": 245000,
  "Full Body XPEL Stealth PPF Wrap": 480000,
  "Track Package PPF + Wheel Ceramic": 320000,
  "Maintenance Wash & Graphene Topcoat": 45000,
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let restaurantId = (session?.user as any)?.restaurantId;

    if (!restaurantId) {
      // Fallback for demo mode
      const demoRest = await prisma.restaurant.findFirst({
        where: { slug: { in: ["apex-formula-detailing-ppf", "demo"] } },
        select: { id: true },
      });
      restaurantId = demoRest?.id;
    }

    if (!restaurantId) {
      const anyRest = await prisma.restaurant.findFirst({ select: { id: true } });
      restaurantId = anyRest?.id;
    }

    if (!restaurantId) {
      return NextResponse.json({ error: "No studio restaurant found" }, { status: 400 });
    }

    const body = await request.json();
    const {
      customerName = "Alexander Wright",
      phone = "(555) 019-2834",
      customerPhone,
      carYear = 2024,
      carBrand = "Porsche",
      carModel = "911 GT3 RS",
      carColor = "Guards Red",
      carLicensePlate = "GT3-APEX",
      servicePackage = "Concourse 2-Stage Polish + Ceramic",
      notes = "Customer requested extra focus on front bumper stone chips.",
      stage = "DECON_WASH",
      photos,
      signature,
    } = body;

    const contactPhone = customerPhone || phone;
    const totalPaise = PACKAGE_PRICES[servicePackage] || 245000;

    // Sequential order number
    const lastOrder = await prisma.order.findFirst({
      where: { restaurantId },
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });
    const nextOrderNumber = (lastOrder?.orderNumber ?? 0) + 1;

    // Daily operational number
    const now = new Date();
    const startOfDay = new Date(now);
    if (now.getHours() < 5) startOfDay.setDate(startOfDay.getDate() - 1);
    startOfDay.setHours(5, 0, 0, 0);

    const todayCount = await prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: startOfDay },
      },
    });
    const nextDailyNumber = todayCount + 1;

    const newOrder = await prisma.order.create({
      data: {
        restaurantId,
        orderNumber: nextOrderNumber,
        dailyOrderNumber: nextDailyNumber,
        sessionType: "CAR",
        carBrand,
        carModel,
        carYear: typeof carYear === "string" ? parseInt(carYear, 10) || 2024 : carYear,
        carColor,
        carLicensePlate,
        customerName,
        customerPhone: contactPhone,
        stage: stage || "DECON_WASH",
        status: "RECEIVED",
        defectsSummary: `${servicePackage}. Notes: ${notes || "None"}${signature ? " (Client Pre-Inspection Waiver Signed)" : ""}`,
        instructions: notes || servicePackage,
        intakePhotos: Array.isArray(photos) && photos.length > 0 ? photos : [
          "Front Bumper: Cleanroom Inspection ✓",
          "Driver Side: Cleanroom Inspection ✓",
          "Rear Diffuser: Cleanroom Inspection ✓",
          "Pass. Side: Cleanroom Inspection ✓",
        ],
        subtotalPaise: totalPaise,
        taxPaise: Math.round(totalPaise * 0.05),
        totalPaise: Math.round(totalPaise * 1.05),
      },
    });

    try {
      emitOrderCreated(restaurantId, newOrder.id);
    } catch {
      // Socket emission optional in demo
    }

    return NextResponse.json({
      success: true,
      message: "Vehicle intake recorded and dispatched to Bay 1",
      order: newOrder,
    });
  } catch (error: any) {
    console.error("Intake API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to record vehicle intake" },
      { status: 500 }
    );
  }
}
