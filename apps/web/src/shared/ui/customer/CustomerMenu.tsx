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
  const [sessionDailyOrderNumber, setSessionDailyOrderNumber] = useState<number | null>(null);
  const [rounds, setRounds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36));
  const items = restaurant.categories.flatMap((category) => category.items);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const cartLines = Object.values(cart);

  const subtotal = cartLines.reduce((total, line) => total + line.item.pricePaise * line.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;
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

  async function placeRealOrder() {
    if (cartLines.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant.slug,
          tableNumber: restaurant.tableNumber,
          idempotencyKey,
          items: cartLines.map((line) => ({
            menuItemId: line.item.id,
            quantity: line.quantity,
            instructions: line.instructions
          }))
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }
      
      import("socket.io-client").then(({ io }) => {
        const socket = io();
        socket.emit("new_order", { restaurantId: data.order.restaurantId, orderId: data.order.id });
      });

      setRounds((r) => r + 1);
      if (!sessionDailyOrderNumber) {
        setSessionDailyOrderNumber(data.order.dailyOrderNumber);
      }
      
      const isFirstRound = rounds === 0;
      const displayOrderNumber = sessionDailyOrderNumber ?? data.order.dailyOrderNumber;
      const orderMessage = isFirstRound 
        ? `Order #${data.order.dailyOrderNumber} sent to kitchen.`
        : `Order #${displayOrderNumber} (Round ${rounds + 1}) sent to kitchen.`;

      showNotice(orderMessage);
      setCart({}); // Clear cart on success
      setIdempotencyKey(Math.random().toString(36).substring(2) + Date.now().toString(36)); // Rotate key for next possible order
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const estimatedWait = useMemo(() => (cartLines.length ? "18-22 min" : "Add items to estimate"), [cartLines.length]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning — here's today's menu";
    if (hour >= 12 && hour < 17) return "Good afternoon — here's today's menu";
    if (hour >= 17 && hour < 22) return "Good evening — here's tonight's menu";
    return "Welcome — here's our late night menu";
  }, []);

  return (
    <main className="min-h-svh bg-[#f8f4ed] pb-36">
      <header className="sticky top-0 z-20 border-b border-stone-300/70 bg-[#f8f4ed]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
              {restaurant.tableNumber ? `Table ${restaurant.tableNumber}` : "Drive-In Menu"}
            </p>
            <h1 className="text-2xl font-semibold text-stone-950">{restaurant.name}</h1>
            <p className="text-sm font-medium text-stone-500 mt-0.5">{greeting}</p>
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
            gst={gst}
            total={total}
            estimatedWait={estimatedWait}
            recommendations={recommendations}
            addItem={(item) => updateQuantity(item, 1)}
            onPlaceOrder={placeRealOrder}
            isSubmitting={isSubmitting}
            sessionDailyOrderNumber={sessionDailyOrderNumber}
            rounds={rounds}
          />
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-300 bg-[#f8f4ed] p-4 lg:hidden">
        <CartPanel
          cartLines={cartLines}
          subtotal={subtotal}
          gst={gst}
          total={total}
          estimatedWait={estimatedWait}
          recommendations={recommendations}
          addItem={(item) => updateQuantity(item, 1)}
          onPlaceOrder={placeRealOrder}
          isSubmitting={isSubmitting}
          sessionDailyOrderNumber={sessionDailyOrderNumber}
          rounds={rounds}
          compact
        />
      </div>
    </main>
  );
}

function CartPanel({
  cartLines,
  subtotal,
  gst,
  total,
  estimatedWait,
  recommendations,
  addItem,
  onPlaceOrder,
  sessionDailyOrderNumber,
  rounds,
  isSubmitting,
  compact
}: {
  cartLines: CartLine[];
  subtotal: number;
  gst: number;
  total: number;
  estimatedWait: string;
  recommendations: MenuItem[];
  addItem: (item: MenuItem) => void;
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
  sessionDailyOrderNumber: number | null;
  rounds: number;
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
      <div className="mt-4 border-t border-stone-200 pt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between text-stone-600">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-stone-600">
          <span>Taxes (5% GST)</span>
          <span>{formatMoney(gst)}</span>
        </div>
        <div className="flex items-center justify-between font-bold text-lg pt-2 border-t border-stone-100 mt-2">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
      </div>
      {sessionDailyOrderNumber && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
          Order #{sessionDailyOrderNumber} {rounds > 1 ? `(Round ${rounds}) ` : ""}received. Status: Preparing.
        </div>
      )}
      <Button className="mt-4 w-full" disabled={cartLines.length === 0 || isSubmitting} onClick={onPlaceOrder}>
        {isSubmitting ? "Sending..." : (sessionDailyOrderNumber ? "Order Sent" : "Place Order")}
      </Button>
    </div>
  );
}
