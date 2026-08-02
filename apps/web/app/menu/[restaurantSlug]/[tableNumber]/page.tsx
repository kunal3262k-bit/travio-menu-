import { notFound } from "next/navigation";
import { CustomerMenu } from "@/components/customer/CustomerMenu";
import { demoRestaurant } from "@/lib/demo-data";

export default async function MenuPage({ params }: { params: Promise<{ restaurantSlug: string; tableNumber: string }> }) {
  const { restaurantSlug, tableNumber } = await params;

  if (!restaurantSlug || !tableNumber) notFound();

  return (
    <CustomerMenu
      restaurant={{
        ...demoRestaurant,
        slug: restaurantSlug,
        tableNumber: Number(tableNumber)
      }}
    />
  );
}
