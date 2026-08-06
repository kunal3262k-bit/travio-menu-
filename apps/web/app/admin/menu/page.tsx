import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MenuEditorClient from "./MenuEditorClient";

export default async function MenuEditorPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") redirect("/login");

  const categories = await prisma.category.findMany({
    where: { restaurantId: session.user.restaurantId, active: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        where: { active: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black mb-2">Menu Editor</h1>
      <p className="text-gray-500 mb-8">Add, edit, or remove categories and items. Changes are saved instantly.</p>
      
      <MenuEditorClient initialCategories={categories} />
    </div>
  );
}
