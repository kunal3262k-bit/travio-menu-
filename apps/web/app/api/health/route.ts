import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ping DB to ensure it's healthy
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ 
      status: "unhealthy",
      error: "Database connection failed"
    }, { status: 503 });
  }
}
