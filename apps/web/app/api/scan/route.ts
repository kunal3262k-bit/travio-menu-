import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { restaurantId, tableId } = await req.json();

    if (!restaurantId || !tableId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Ensure table exists and has an active session
    const table = await prisma.table.findUnique({
      where: { id: tableId }
    });

    if (table && !table.currentSessionId) {
      const { randomUUID } = require('crypto');
      await prisma.table.update({
        where: { id: tableId },
        data: { currentSessionId: randomUUID() }
      });
    }

    await prisma.tableScan.create({
      data: {
        restaurantId,
        tableId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Scan log error:", error);
    return NextResponse.json({ error: "Failed to log scan" }, { status: 500 });
  }
}
