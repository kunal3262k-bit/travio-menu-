import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MenuEditorClient from "./MenuEditorClient";

export default async function MenuEditorPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") redirect("/login");

  const [categories, restaurant] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId: session.user.restaurantId, active: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    }),
    prisma.restaurant.findUnique({
      where: { id: session.user.restaurantId },
      select: { slug: true, name: true }
    })
  ]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Menu Editor</h1>
          <p className="text-gray-500 mt-1">Add, edit, or remove categories and items. Changes update live on your QR menu.</p>
        </div>
        {restaurant?.slug && (
          <a
            href={`/${restaurant.slug}/t/1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-800 shadow-md transition active:scale-95 text-sm shrink-0"
          >
            <span>📱 Preview Customer QR Menu</span>
            <span className="text-xs bg-emerald-900/40 px-2 py-0.5 rounded-full font-semibold">Table 1</span>
          </a>
        )}
      </div>
      
      <MenuEditorClient initialCategories={categories} restaurantSlug={restaurant?.slug} />
    </div>
  );
}
