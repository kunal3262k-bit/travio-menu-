import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QRPrintClient from "./QRPrintClient";

export default async function PrintQRPage({ searchParams }: { searchParams: Promise<{ tableId?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    include: { tables: { orderBy: { number: "asc" } } }
  });

  if (!restaurant) redirect("/login");

  const baseUrl = process.env.APP_URL || "http://localhost:3001";

  // Filter to single table if tableId is provided
  const resolvedParams = await searchParams;
  const tableId = resolvedParams?.tableId;
  const tables = tableId
    ? restaurant.tables.filter(t => t.id === tableId)
    : restaurant.tables;

  return <QRPrintClient restaurant={restaurant} tables={tables} baseUrl={baseUrl} />;
}
