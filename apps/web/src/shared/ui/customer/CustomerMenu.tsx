"use client";

import Image from "next/image";
import { Bell, CheckCircle2, Flame, Minus, Plus, ReceiptText, ShoppingBag, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { selectUpsellRecommendations } from "@/lib/upsell";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pricePaise: number;
  foodType: string;
  spicyLevel: number;
  available: boolean;
};

type RestaurantView = {
  name: string;
  slug: string;
  tableNumber: number;
  categories: { id: string; name: string; items: MenuItem[] }[];
  upsellRules: { triggerMenuItemId: string; recommendedMenuItemId: string; priority: number; active: boolean }[];
};

type CartLine = { item: MenuItem; quantity: number; instructions: string };

export function CustomerMenu({ restaurant }: { restaurant: RestaurantView }) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const items = restaurant.categories.flatMap((category) => category.items);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const cartLines = Object.values(cart);

  const subtotal = cartLines.reduce((total, line) => total + line.item.pricePaise * line.quantity, 0);
  const recommendations = selectUpsellRecommendations(
    cartLines.map((line) => ({ menuItemId: line.item.id })),
    restaurant.upsellRules
  )
    .map((rule) => itemById.get(rule.recommendedMenuItemId))
    .filter(Boolean) as MenuItem[];

  function updateQuantity(item: MenuItem, delta: number) {
    setCart((current) => {
      const existing = current[item.id];
      const quantity = Math.max(0, (existing?.quantity ?? 0) + delta);
      const next = { ...current };
      if (quantity === 0) delete next[item.id];
      else next[item.id] = { item, quantity, instructions: existing?.instructions ?? "" };
      return next;
    });
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2800);
  }

  function placeDemoOrder() {
    if (cartLines.length === 0) return;
    setOrderNumber(1043);
    showNotice("Order #1043 sent to kitchen. Estimated wait: 18-22 min.");
  }

  const estimatedWait = useMemo(() => (cartLines.length ? "18-22 min" : "Add items to estimate"), [cartLines.length]);

  return (
    <main className="min-h-svh bg-[#f8f4ed] pb-36">
      <header className="sticky top-0 z-20 border-b border-stone-300/70 bg-[#f8f4ed]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Table {restaurant.tableNumber}</p>
            <h1 className="text-2xl font-semibold text-stone-950">{restaurant.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" aria-label="Call waiter" onClick={() => showNotice(`Waiter request sent for Table ${restaurant.tableNumber}.`)}>
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" aria-label="Request bill" onClick={() => showNotice(`Bill request sent for Table ${restaurant.tableNumber}.`)}>
              <ReceiptText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {notice && (
        <div className="fixed inset-x-4 top-20 z-40 mx-auto max-w-md rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-900 shadow-lg">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          {notice}
        </div>
      )}

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {restaurant.categories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-4 text-xl font-semibold text-stone-950">{category.name}</h2>
              <div className="space-y-3">
                {category.items.map((item) => {
                  const quantity = cart[item.id]?.quantity ?? 0;
                  return (
                    <article key={item.id} className="grid grid-cols-[104px_1fr] gap-4 border-b border-stone-300 pb-4">
                      <div className="relative h-28 overflow-hidden rounded-lg bg-stone-200">
                        <Image src={item.imageUrl} alt={item.name} fill sizes="104px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-stone-950">{item.name}</h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-700">{item.description}</p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold">{formatMoney(item.pricePaise)}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                            <span className={item.foodType === "NON_VEG" ? "text-red-700" : "text-emerald-700"}>
                              <Utensils className="inline h-3.5 w-3.5" /> {item.foodType === "NON_VEG" ? "Non veg" : "Veg"}
                            </span>
                            {item.spicyLevel > 0 && <span><Flame className="inline h-3.5 w-3.5 text-red-700" /> Spicy</span>}
                          </div>
                          <div className="flex items-center rounded-lg border border-stone-300">
                            <button className="focus-ring p-2" onClick={() => updateQuantity(item, -1)} aria-label={`Remove ${item.name}`}>
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                            <button className="focus-ring p-2" onClick={() => updateQuantity(item, 1)} aria-label={`Add ${item.name}`}>
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="hidden lg:block">
          <CartPanel
            cartLines={cartLines}
            subtotal={subtotal}
            estimatedWait={estimatedWait}
            recommendations={recommendations}
            addItem={(item) => updateQuantity(item, 1)}
            onPlaceOrder={placeDemoOrder}
            orderNumber={orderNumber}
          />
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-300 bg-[#f8f4ed] p-4 lg:hidden">
        <CartPanel
          cartLines={cartLines}
          subtotal={subtotal}
          estimatedWait={estimatedWait}
          recommendations={recommendations}
          addItem={(item) => updateQuantity(item, 1)}
          onPlaceOrder={placeDemoOrder}
          orderNumber={orderNumber}
          compact
        />
      </div>
    </main>
  );
}

function CartPanel({
  cartLines,
  subtotal,
  estimatedWait,
  recommendations,
  addItem,
  onPlaceOrder,
  orderNumber,
  compact
}: {
  cartLines: CartLine[];
  subtotal: number;
  estimatedWait: string;
  recommendations: MenuItem[];
  addItem: (item: MenuItem) => void;
  onPlaceOrder: () => void;
  orderNumber: number | null;
  compact?: boolean;
}) {
  return (
    <div className="rounded-lg border border-stone-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold"><ShoppingBag className="h-4 w-4" /> Cart</h2>
        <span className="text-sm text-stone-600">{estimatedWait}</span>
      </div>
      {!compact && (
        <div className="mt-4 space-y-3">
          {cartLines.length === 0 && <p className="text-sm text-stone-600">Add items to start an order.</p>}
          {cartLines.map((line) => (
            <div key={line.item.id} className="flex justify-between gap-3 text-sm">
              <span>{line.quantity} x {line.item.name}</span>
              <span className="font-semibold">{formatMoney(line.item.pricePaise * line.quantity)}</span>
            </div>
          ))}
        </div>
      )}
      {recommendations.length > 0 && !compact && (
        <div className="mt-5 border-t border-stone-200 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Recommended</p>
          <div className="space-y-2">
            {recommendations.map((item) => (
              <button key={item.id} className="focus-ring flex w-full items-center justify-between rounded-lg bg-stone-100 px-3 py-2 text-left text-sm" onClick={() => addItem(item)}>
                <span>{item.name}</span>
                <Plus className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
        <span className="font-semibold">Subtotal</span>
        <span className="text-lg font-semibold">{formatMoney(subtotal)}</span>
      </div>
      {orderNumber && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
          Order #{orderNumber} received. Status: Preparing.
        </div>
      )}
      <Button className="mt-4 w-full" disabled={cartLines.length === 0} onClick={onPlaceOrder}>
        {orderNumber ? "Order Sent" : "Place Order"}
      </Button>
    </div>
  );
}
