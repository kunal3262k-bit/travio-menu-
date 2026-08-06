import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReviewClient from "./ReviewClient";

export default async function ReviewPage({
  params
}: {
  params: Promise<{ restaurantSlug: string, tableNumber: string }>
}) {
  const { restaurantSlug, tableNumber } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant) return notFound();

  const googleReviewUrl = restaurant.googleReviewUrl as string | null | undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-8">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
        <ReviewClient 
          restaurantName={restaurant.name} 
          googleReviewUrl={googleReviewUrl || ""} 
          restaurantSlug={restaurantSlug}
        />
        <div className="mt-8 text-center">
          <a href={`/${restaurantSlug}/t/${tableNumber}`} className="text-emerald-700 font-medium hover:underline">
            ← Back to Menu
          </a>
        </div>
      </div>
    </div>
  );
}
