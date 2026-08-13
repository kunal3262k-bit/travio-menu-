"use client";

import Image from "next/image";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(restaurant.categories[0]?.id || "");
  const [idempotencyKey, setIdempotencyKey] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36));

  const items = restaurant.categories.flatMap((category) => category.items);
  const itemById = new Map(items.map((item) => [item.id, item]));
  const cartLines = Object.values(cart);
  const totalItemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

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
      setIsMobileCartOpen(false); // Close mobile bottom sheet
      setIdempotencyKey(Math.random().toString(36).substring(2) + Date.now().toString(36));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const estimatedWait = useMemo(() => (cartLines.length ? "18-22 min wait" : "Add items to estimate"), [cartLines.length]);

  const [greeting, setGreeting] = useState("Here's our menu");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good morning — here's today's menu");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon — here's today's menu");
    else if (hour >= 17 && hour < 22) setGreeting("Good evening — here's tonight's menu");
    else setGreeting("Welcome — here's our late night menu");
  }, []);

  async function sendWaiterRequest(type: "CALL_WAITER" | "REQUEST_BILL") {
    try {
      const res = await fetch("/api/waiter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant.slug,
          tableNumber: restaurant.tableNumber,
          type,
        }),
      });
      if (!res.ok) throw new Error("Failed to send request");
      const label = type === "CALL_WAITER" ? "Waiter call" : "Bill request";
      showNotice(`${label} sent for Table ${restaurant.tableNumber}.`);
    } catch {
      showNotice("Unable to send request. Please try again.");
    }
  }

  return (
    <main className="min-h-svh bg-[#f8f4ed] pb-32 lg:pb-12">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-stone-300/70 bg-[#f8f4ed]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-800">
              {restaurant.tableNumber ? `Table ${restaurant.tableNumber}` : "Drive-In Menu"}
            </p>
            <h1 className="text-xl font-bold text-stone-950 sm:text-2xl">{restaurant.name}</h1>
            <p className="text-xs font-medium text-stone-500 sm:text-sm">{greeting}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => sendWaiterRequest("CALL_WAITER")}
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-900 active:scale-95"
              aria-label="Call waiter"
            >
              <Bell className="h-4 w-4 text-emerald-700" />
              <span className="hidden sm:inline">Call Waiter</span>
            </button>
            <button
              onClick={() => sendWaiterRequest("REQUEST_BILL")}
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-900 active:scale-95"
              aria-label="Request bill"
            >
              <ReceiptText className="h-4 w-4 text-emerald-700" />
              <span className="hidden sm:inline">Request Bill</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Mobile Category Navigation Pills */}
      <div className="sticky top-[61px] z-20 border-b border-stone-300/70 bg-[#f8f4ed]/95 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto scrollbar-none">
          {restaurant.categories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <a
                key={category.id}
                href={`#category-${category.id}`}
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "border border-stone-300 bg-white text-stone-700 hover:border-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {category.name} ({category.items.length})
              </a>
            );
          })}
        </div>
      </div>

      {/* Floating Notice Banner */}
      {notice && (
        <div className="fixed inset-x-4 top-24 z-50 mx-auto max-w-md rounded-xl border border-emerald-300 bg-white p-4 text-sm font-bold text-emerald-950 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{notice}</span>
          </div>
        </div>
      )}

      {/* Main Menu Layout */}
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          {restaurant.categories.map((category) => (
            <section key={category.id} id={`category-${category.id}`} className="scroll-mt-32">
              <h2 className="mb-4 text-lg font-bold text-stone-950 sm:text-xl">{category.name}</h2>
              <div className="space-y-4">
                {category.items.map((item) => {
                  const quantity = cart[item.id]?.quantity ?? 0;
                  return (
                    <article
                      key={item.id}
                      className="grid grid-cols-[80px_1fr] gap-3.5 border-b border-stone-300/80 pb-4 sm:grid-cols-[104px_1fr] sm:gap-4"
                    >
                      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-stone-200 sm:h-28 sm:w-28">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 80px, 104px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-stone-950 text-sm sm:text-base leading-snug">
                              {item.name}
                            </h3>
                            <span className="shrink-0 text-sm font-bold text-stone-900">
                              {formatMoney(item.pricePaise)}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600 sm:text-sm">
                            {item.description}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-stone-600 sm:text-xs">
                            <span
                              className={item.foodType === "NON_VEG" ? "text-red-700" : "text-emerald-700"}
                            >
                              <Utensils className="inline h-3 w-3 sm:h-3.5 sm:w-3.5" />{" "}
                              {item.foodType === "NON_VEG" ? "Non veg" : "Veg"}
                            </span>
                            {item.spicyLevel > 0 && (
                              <span>
                                <Flame className="inline h-3 w-3 text-red-700 sm:h-3.5 sm:w-3.5" /> Spicy
                              </span>
                            )}
                          </div>
                          {/* Quantity Selector */}
                          <div className="flex items-center rounded-xl border border-stone-300 bg-white shadow-sm">
                            <button
                              className="focus-ring flex h-8 w-8 items-center justify-center rounded-l-xl text-stone-700 transition hover:bg-stone-100 active:scale-95"
                              onClick={() => updateQuantity(item, -1)}
                              aria-label={`Remove ${item.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-stone-900">
                              {quantity}
                            </span>
                            <button
                              className="focus-ring flex h-8 w-8 items-center justify-center rounded-r-xl text-stone-700 transition hover:bg-stone-100 active:scale-95"
                              onClick={() => updateQuantity(item, 1)}
                              aria-label={`Add ${item.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
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

        {/* Desktop Sidebar Cart Panel */}
        <aside className="hidden lg:block">
          <div className="sticky top-32">
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
          </div>
        </aside>
      </section>

      {/* Mobile Floating Cart Bar (Visible on Mobile when items are added) */}
      {(totalItemCount > 0 || sessionDailyOrderNumber) && (
        <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-emerald-800 px-4 py-3.5 text-white shadow-2xl transition hover:bg-emerald-900 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-700 text-xs font-black text-white">
                {totalItemCount}
              </span>
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                  {sessionDailyOrderNumber ? `Order #${sessionDailyOrderNumber}` : "View Cart"}
                </p>
                <p className="text-sm font-bold">{formatMoney(total)} <span className="text-xs font-normal text-emerald-200">incl. GST</span></p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-100">
              <span>Review Order</span>
              <ChevronUp className="h-4 w-4" />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Slide-Up Bottom Sheet Modal */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div className="flex max-h-[85vh] flex-col rounded-t-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-bold text-stone-950">Your Order</h2>
              </div>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
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
            </div>
          </div>
        </div>
      )}
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
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h2 className="flex items-center gap-2 font-bold text-stone-950">
          <ShoppingBag className="h-4 w-4 text-emerald-700" /> Cart Summary
        </h2>
        <span className="text-xs font-semibold text-stone-500">{estimatedWait}</span>
      </div>

      <div className="mt-4 space-y-3">
        {cartLines.length === 0 && (
          <p className="text-sm font-medium text-stone-500 py-2 text-center">Your cart is empty. Tap + on menu items to add.</p>
        )}
        {cartLines.map((line) => (
          <div key={line.item.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-stone-800">
              {line.quantity} × {line.item.name}
            </span>
            <span className="font-bold text-stone-950">{formatMoney(line.item.pricePaise * line.quantity)}</span>
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-5 border-t border-stone-200 pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
            Recommended Add-ons
          </p>
          <div className="space-y-2">
            {recommendations.map((item) => (
              <button
                key={item.id}
                className="focus-ring flex w-full items-center justify-between rounded-xl bg-stone-100 px-3.5 py-2.5 text-left text-xs font-bold text-stone-800 transition hover:bg-emerald-50 hover:text-emerald-900"
                onClick={() => addItem(item)}
              >
                <span>{item.name} ({formatMoney(item.pricePaise)})</span>
                <Plus className="h-4 w-4 text-emerald-700" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-stone-200 pt-4 space-y-2 text-xs font-semibold">
        <div className="flex items-center justify-between text-stone-600">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-stone-600">
          <span>Taxes (5% GST)</span>
          <span>{formatMoney(gst)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-black text-stone-950 pt-2 border-t border-stone-100">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>
      </div>

      {sessionDailyOrderNumber && (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-950">
          ✓ Order #{sessionDailyOrderNumber} {rounds > 1 ? `(Round ${rounds}) ` : ""}sent to kitchen. Status: Preparing.
        </div>
      )}

      <Button
        className="mt-5 h-12 w-full rounded-xl bg-emerald-700 text-base font-bold text-white transition hover:bg-emerald-800 shadow-md"
        disabled={cartLines.length === 0 || isSubmitting}
        onClick={onPlaceOrder}
      >
        {isSubmitting ? "Sending to Kitchen..." : sessionDailyOrderNumber ? "Send Additional Order" : "Place Order Now"}
      </Button>
    </div>
  );
}
