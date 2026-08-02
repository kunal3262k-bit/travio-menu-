import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function SetupLivePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    include: { tables: { orderBy: { number: 'asc' }, take: 1 } }
  });

  if (!restaurant) return null;

  async function goLive() {
    "use server";
    try {
      await prisma.restaurant.update({
        where: { id: restaurant!.id },
        data: { status: "LIVE" }
      });
      revalidatePath("/admin");
    } catch (e) {
      console.error("Failed to go live:", e);
    }
    redirect("/admin");
  }

  const firstTable = restaurant.tables[0];
  const previewUrl = firstTable ? `/${restaurant.slug}/t/${firstTable.number}` : `/${restaurant.slug}/t/1`;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">Step 3 of 3</p>
        <h1 className="text-4xl font-bold tracking-tight">You're ready to go live! 🎉</h1>
        <p className="text-gray-500 mt-3 max-w-md mx-auto">
          Your menu is digitized. Your tables are mapped. Your QR codes are ready.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-8 space-y-6 shadow-sm text-left">
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Preview Customer Experience</h3>
          <p className="text-sm text-gray-500">
            See exactly what your customers see when they scan a QR code.
          </p>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-emerald-700 font-medium hover:underline">
            Preview Table {firstTable?.number || 1} ↗
          </a>
        </div>

        <hr className="border-gray-200" />

        <form action={goLive}>
          <button type="submit" className="w-full bg-emerald-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-emerald-800 transition-colors">
            🚀 Go Live Now
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center">
          This will enable ordering. Your customers can start placing orders immediately.
        </p>
      </div>

      <Link href="/admin/setup/qr" className="text-gray-500 hover:text-black font-medium text-sm">← Back to QR Codes</Link>
    </div>
  );
}
