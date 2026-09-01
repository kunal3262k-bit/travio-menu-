"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  CheckCircle2,
  ChevronUp,
  Flame,
  MessageSquare,
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Split,
  Star,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";
import { selectUpsellRecommendations } from "@/lib/upsell";
import { estimateDishNutrition, calculateTableNutritionTotals } from "@/lib/macroEstimator";
import { resolveDishStudioAssets } from "@/lib/aiFoodStudio";
import { Dish3DModal, Dish3DModalItem } from "@/components/customer/Dish3DModal";
import { DietaryFilterBar, DietaryFilterType } from "@/components/customer/DietaryFilterBar";
import { TableNutritionMeter } from "@/components/customer/TableNutritionMeter";
import { SmartUpsellModal } from "@/components/customer/SmartUpsellModal";
import { WhatsAppBillModal } from "@/components/customer/WhatsAppBillModal";
import { GoogleReviewShieldModal } from "@/components/customer/GoogleReviewShieldModal";
import { TableBillSplitter } from "@/components/customer/TableBillSplitter";

export type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageSource?: string | null;
  imageGallery?: any;
  aiPrompt?: string | null;
  pricePaise: number;
  foodType: string;
  spicyLevel?: number | null;
  calories?: number | null;
  proteinGrams?: number | null;
  fatGrams?: number | null;
  carbsGrams?: number | null;
  fiberGrams?: number | null;
  allergens?: any;
  dietaryFlags?: any;
  chefNote?: string | null;
  isPopular?: boolean;
  isHotSizzler?: boolean;
  available?: boolean;
};

export type Category = {
  id: string;
  name: string;
  items: MenuItem[];
};

export type RestaurantView = {
  id?: string;
  name: string;
  slug: string;
  tableNumber: number;
  openOrdersCount: number;
  googleReviewUrl?: string | null;
  whatsappPhone?: string | null;
  categories: Category[];
  upsellRules?: { triggerMenuItemId: string; recommendedMenuItemId: string; priority: number; active: boolean }[];
};

type CartLine = { item: MenuItem; quantity: number; instructions: string };

export function CustomerMenu({
  restaurant,
  table,
  categories,
  openOrdersCount = 0,
}: {
  restaurant: any;
  table?: any;
  categories?: any[];
  openOrdersCount?: number;
}) {
  const router = useRouter();
  
  // Normalize restaurant view with AI macro and studio photo enrichment
  const view: RestaurantView = useMemo(() => {
    const rawCategories = categories ?? restaurant?.categories ?? [];
    return {
      id: restaurant?.id,
      name: restaurant?.name || "Restaurant",
      slug: restaurant?.slug || "",
      tableNumber: Number(table?.number ?? restaurant?.tableNumber ?? 1),
      openOrdersCount: Number(openOrdersCount ?? restaurant?.openOrdersCount ?? 0),
      googleReviewUrl: restaurant?.googleReviewUrl || null,
      whatsappPhone: restaurant?.whatsappPhone || null,
      categories: rawCategories.map((c: any) => ({
        id: c.id || String(Math.random()),
        name: c.name || "Menu",
        items: (c.items || []).map((i: any) => {
          const defaultNutrition = estimateDishNutrition(i.name, c.name, i.description, i.foodType);
          const defaultStudio = resolveDishStudioAssets(i.name, c.name, i.description, i.foodType);

          return {
            id: i.id || String(Math.random()),
            name: i.name,
            description: i.description || "",
            imageUrl: i.imageUrl || defaultStudio.primaryUrl,
            imageSource: i.imageSource || "AI_STUDIO",
            imageGallery: i.imageGallery || defaultStudio.gallery,
            aiPrompt: i.aiPrompt || defaultStudio.aiPrompt,
            pricePaise: typeof i.pricePaise === "number" ? i.pricePaise : Math.round((Number(i.price) || 0) * 100),
            foodType: i.foodType || (i.isVeg === false ? "NON_VEG" : "VEG"),
            spicyLevel: i.spicyLevel ?? 0,
            calories: i.calories ?? defaultNutrition.calories,
            proteinGrams: i.proteinGrams ?? defaultNutrition.proteinGrams,
            fatGrams: i.fatGrams ?? defaultNutrition.fatGrams,
            carbsGrams: i.carbsGrams ?? defaultNutrition.carbsGrams,
            fiberGrams: i.fiberGrams ?? defaultNutrition.fiberGrams,
            allergens: i.allergens ?? defaultNutrition.allergens,
            dietaryFlags: i.dietaryFlags ?? defaultNutrition.dietaryFlags,
            chefNote: i.chefNote || defaultStudio.chefNote,
            isPopular: i.isPopular ?? false,
            isHotSizzler: i.isHotSizzler ?? defaultStudio.isHotSizzler,
            available: i.available ?? true,
          };
        }),
      })),
      upsellRules: restaurant?.upsellRules || [],
    };
  }, [restaurant, table, categories, openOrdersCount]);

  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [sessionDailyOrderNumber, setSessionDailyOrderNumber] = useState<number | null>(null);
  const [rounds, setRounds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(view.categories[0]?.id || "");
  const [idempotencyKey, setIdempotencyKey] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36));

  // 3D Card & Modal States
  const [selected3DItem, setSelected3DItem] = useState<MenuItem | null>(null);
  const [selectedDietaryFilter, setSelectedDietaryFilter] = useState<DietaryFilterType>("ALL");
  const [upsellModalOpen, setUpsellModalOpen] = useState(false);
  const [upsellTriggerName, setUpsellTriggerName] = useState("");
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSplitBillModalOpen, setIsSplitBillModalOpen] = useState(false);

  const allItems = useMemo(() => view.categories.flatMap((category) => category.items), [view.categories]);
  const itemById = useMemo(() => new Map(allItems.map((item) => [item.id, item])), [allItems]);
  const cartLines = Object.values(cart);
  const totalItemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  const subtotal = cartLines.reduce((total, line) => total + line.item.pricePaise * line.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  // Live Table Nutrition Totals
  const nutritionTotals = useMemo(() => calculateTableNutritionTotals(cartLines), [cartLines]);

  // Upsell Recommendation Engine
  const recommendations = useMemo(() => {
    return selectUpsellRecommendations(
      cartLines.map((line) => ({ menuItemId: line.item.id })),
      view.upsellRules || []
    )
      .map((rule) => itemById.get(rule.recommendedMenuItemId))
      .filter(Boolean) as MenuItem[];
  }, [cartLines, view.upsellRules, itemById]);

  // Filter items based on selected dietary filter
  const filteredCategories = useMemo(() => {
    if (selectedDietaryFilter === "ALL") return view.categories;

    return view.categories
      .map((cat) => {
        const filtered = cat.items.filter((item) => {
          const flags: string[] = Array.isArray(item.dietaryFlags) 
            ? item.dietaryFlags 
            : typeof item.dietaryFlags === "string" 
              ? JSON.parse(item.dietaryFlags || "[]") 
              : [];

          if (selectedDietaryFilter === "HIGH_PROTEIN") return (item.proteinGrams || 0) >= 25 || flags.includes("HIGH_PROTEIN");
          if (selectedDietaryFilter === "LOW_CALORIE") return (item.calories || 0) <= 400 || flags.includes("LOW_CALORIE");
          if (selectedDietaryFilter === "KETO") return flags.includes("KETO");
          if (selectedDietaryFilter === "VEGAN") return flags.includes("VEGAN") || item.foodType === "VEG";
          if (selectedDietaryFilter === "GLUTEN_FREE") return flags.includes("GLUTEN_FREE");
          return true;
        });
        return { ...cat, items: filtered };
      })
      .filter((cat) => cat.items.length > 0);
  }, [view.categories, selectedDietaryFilter]);

  function updateQuantity(item: MenuItem, delta: number, instructions = "") {
    setCart((current) => {
      const existing = current[item.id];
      const quantity = Math.max(0, (existing?.quantity ?? 0) + delta);
      const next = { ...current };
      if (quantity === 0) delete next[item.id];
      else next[item.id] = { item, quantity, instructions: instructions || existing?.instructions || "" };
      return next;
    });

    // Check for upsell trigger when adding an item
    if (delta > 0 && recommendations.length > 0 && Math.random() > 0.4) {
      setUpsellTriggerName(item.name);
      setUpsellModalOpen(true);
    }
  }

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3200);
  }

  async function placeRealOrder() {
    if (cartLines.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: view.slug,
          tableNumber: view.tableNumber,
          idempotencyKey,
          items: cartLines.map((line) => ({
            menuItemId: line.item.id,
            quantity: line.quantity,
            instructions: line.instructions || undefined,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      setRounds((r) => r + 1);
      if (!sessionDailyOrderNumber && data.order?.dailyOrderNumber) {
        setSessionDailyOrderNumber(data.order.dailyOrderNumber);
      }

      const isFirstRound = rounds === 0;
      const displayOrderNumber = sessionDailyOrderNumber ?? data.order?.dailyOrderNumber ?? "1";
      const orderMessage = isFirstRound
        ? `Order #${data.order?.dailyOrderNumber || 1} sent to kitchen!`
        : `Order #${displayOrderNumber} (Round ${rounds + 1}) sent to kitchen!`;

      showNotice(orderMessage);
      setCart({});
      setIsMobileCartOpen(false);
      setIdempotencyKey(Math.random().toString(36).substring(2) + Date.now().toString(36));

      if (data.order?.id && view.slug && view.tableNumber) {
        router.push(`/${view.slug}/t/${view.tableNumber}/order/${data.order.id}`);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const estimatedWait = useMemo(() => (cartLines.length ? "15-20 min wait" : "Add items to estimate"), [cartLines.length]);

  const [greeting, setGreeting] = useState("Here's our menu");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good morning — here's today's menu");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon — here's today's menu");
    else if (hour >= 17 && hour < 22) setGreeting("Good evening — here's tonight's menu");
    else setGreeting("Welcome — here's our menu");
  }, []);

  async function sendWaiterRequest(type: "CALL_WAITER" | "REQUEST_BILL") {
    if (isCallingWaiter) return;
    setIsCallingWaiter(true);
    try {
      const res = await fetch("/api/waiter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: view.slug,
          tableNumber: view.tableNumber,
          type,
        }),
      });
      if (!res.ok) throw new Error("Failed to send request");
      const label = type === "CALL_WAITER" ? "Waiter notified" : "Bill requested";
      showNotice(`${label} for Table ${view.tableNumber}. A staff member is on the way! 🛎️`);
    } catch {
      showNotice("Unable to send request. Please alert your server directly.");
    } finally {
      setIsCallingWaiter(false);
    }
  }

  return (
    <main className="min-h-svh bg-[#f8f4ed] pb-36 lg:pb-16 text-slate-900">
      {/* 3D Interactive Dish Modal */}
      <Dish3DModal
        item={selected3DItem}
        isOpen={Boolean(selected3DItem)}
        onClose={() => setSelected3DItem(null)}
        onAddToCart={(item, qty, inst) => updateQuantity(item as MenuItem, qty, inst)}
        initialQuantity={selected3DItem ? cart[selected3DItem.id]?.quantity || 1 : 1}
        initialInstructions={selected3DItem ? cart[selected3DItem.id]?.instructions || "" : ""}
      />

      {/* Smart Upsell Modal */}
      <SmartUpsellModal
        isOpen={upsellModalOpen}
        onClose={() => setUpsellModalOpen(false)}
        triggerItemName={upsellTriggerName}
        recommendedItems={recommendations}
        onAddRecommendedItem={(item) => {
          updateQuantity(item, 1);
          setUpsellModalOpen(false);
          showNotice(`Added ${item.name} to order!`);
        }}
      />

      {/* WhatsApp Bill Modal */}
      <WhatsAppBillModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        restaurantName={view.name}
        totalPaise={total || 45000}
        tableNumber={view.tableNumber}
      />

      {/* Google Review Shield Modal */}
      <GoogleReviewShieldModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        restaurantName={view.name}
        googleReviewUrl={view.googleReviewUrl}
        tableNumber={view.tableNumber}
      />

      {/* Table Bill Splitter Modal */}
      <TableBillSplitter
        isOpen={isSplitBillModalOpen}
        onClose={() => setIsSplitBillModalOpen(false)}
        totalPaise={total || 45000}
        tableNumber={view.tableNumber}
        restaurantName={view.name}
      />

      {/* Active Orders Banner */}
      {view.openOrdersCount > 0 && cartLines.length === 0 && (
        <div
          onClick={() => router.push(`/${view.slug}/t/${view.tableNumber}/payment`)}
          className="bg-emerald-700 text-white px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-emerald-800 transition-colors sticky top-0 z-40 shadow-sm"
        >
          <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            You have {view.openOrdersCount} active {view.openOrdersCount === 1 ? "order" : "orders"}
          </div>
          <div className="font-bold text-xs sm:text-sm bg-black/20 px-3 py-1 rounded-full flex items-center gap-1">
            View / Pay Bill →
          </div>
        </div>
      )}

      {/* Sticky Top Header */}
      <header
        className={`sticky ${view.openOrdersCount > 0 && cartLines.length === 0 ? "top-[48px]" : "top-0"} z-30 border-b border-stone-300/70 bg-[#f8f4ed]/95 px-4 py-3 backdrop-blur-md`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              {view.tableNumber ? `TABLE ${view.tableNumber}` : "DINE-IN MENU"}
            </span>
            <h1 className="mt-1 text-xl font-bold text-stone-950 sm:text-2xl">{view.name}</h1>
            <p className="text-xs font-medium text-stone-600 sm:text-sm">{greeting}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => sendWaiterRequest("CALL_WAITER")}
              disabled={isCallingWaiter}
              className="flex items-center gap-1.5 rounded-full border border-emerald-700/30 bg-emerald-900/10 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-700 hover:text-white active:scale-95 disabled:opacity-50"
              aria-label="Call waiter"
            >
              <Bell className="h-3.5 w-3.5 text-emerald-700" />
              <span>Waiter</span>
            </button>
            <button
              onClick={() => sendWaiterRequest("REQUEST_BILL")}
              disabled={isCallingWaiter}
              className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-100 active:scale-95 disabled:opacity-50"
              aria-label="Request bill"
            >
              <ReceiptText className="h-3.5 w-3.5 text-stone-700" />
              <span>Bill</span>
            </button>
          </div>
        </div>

        {/* Dietary & Macro Filter Bar */}
        <div className="mx-auto max-w-5xl pt-2">
          <DietaryFilterBar
            selectedFilter={selectedDietaryFilter}
            onSelectFilter={setSelectedDietaryFilter}
          />
        </div>
      </header>

      {/* Sticky Mobile Category Navigation Pills */}
      {view.categories.length > 0 && (
        <div className="sticky top-[108px] z-20 border-b border-stone-300/70 bg-[#f8f4ed]/95 backdrop-blur-md">
          <div className="relative mx-auto max-w-5xl">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-4 py-2">
              {view.categories.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <a
                    key={category.id}
                    href={`#category-${category.id}`}
                    onClick={() => setActiveCategory(category.id)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-bold transition active:scale-95 ${
                      isActive
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "border border-stone-300 bg-white text-stone-700 hover:border-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {category.name} ({category.items.length})
                  </a>
                );
              })}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#f8f4ed] to-transparent" />
          </div>
        </div>
      )}

      {/* Floating Notice Toast */}
      {notice && (
        <div className="fixed inset-x-4 top-24 z-50 mx-auto max-w-md rounded-2xl border border-emerald-300 bg-white p-4 text-sm font-bold text-emerald-950 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{notice}</span>
          </div>
        </div>
      )}

      {/* Main Menu Layout */}
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 shadow-sm">
              <Utensils className="h-12 w-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-stone-800">No items match your dietary filter</h3>
              <p className="text-sm text-stone-500 mt-1">Try switching to &apos;All Items&apos; to view the complete menu.</p>
              <button
                onClick={() => setSelectedDietaryFilter("ALL")}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <section key={category.id} id={`category-${category.id}`} className="scroll-mt-36">
                <h2 className="mb-4 text-lg font-bold text-stone-950 sm:text-xl">{category.name}</h2>
                <div className="space-y-4">
                  {category.items.map((item) => {
                    const quantity = cart[item.id]?.quantity ?? 0;
                    return (
                      <article
                        key={item.id}
                        className="grid grid-cols-[100px_1fr] gap-3.5 border-b border-stone-300/80 pb-4 sm:grid-cols-[116px_1fr] sm:gap-4 bg-white/70 hover:bg-white rounded-2xl p-3 shadow-sm transition-all border border-stone-200/50"
                      >
                        {/* Image Thumbnail with 3D Trigger */}
                        <div
                          onClick={() => setSelected3DItem(item)}
                          className="relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-2xl bg-stone-200 shadow-sm cursor-pointer group shrink-0"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 100px, 116px"
                              className="object-cover group-hover:scale-108 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-stone-200 text-stone-400">
                              <Utensils className="h-7 w-7 text-stone-400" />
                            </div>
                          )}

                          {/* 3D Visual Pill */}
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[9px] font-bold text-white flex items-center gap-0.5 opacity-90 group-hover:opacity-100">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" /> 3D
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3
                                onClick={() => setSelected3DItem(item)}
                                className="font-bold text-stone-950 text-base leading-snug hover:text-emerald-800 cursor-pointer"
                              >
                                {item.name}
                              </h3>
                              <span className="shrink-0 text-base font-bold text-stone-950 font-mono">
                                {formatMoney(item.pricePaise)}
                              </span>
                            </div>

                            {item.description && (
                              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600 sm:text-sm">
                                {item.description}
                              </p>
                            )}

                            {/* Macro Pill */}
                            <div
                              onClick={() => setSelected3DItem(item)}
                              className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200/80 text-[11px] font-semibold text-stone-700 cursor-pointer transition-colors"
                            >
                              <span className="text-amber-700 font-bold">🔥 {item.calories || 380} kcal</span>
                              <span className="text-stone-300">·</span>
                              <span className="text-blue-700 font-bold">💪 {item.proteinGrams || 24}g P</span>
                              <span className="text-stone-300">·</span>
                              <span className="text-emerald-700 font-bold">🥑 {item.fatGrams || 16}g F</span>
                            </div>
                          </div>

                          {/* Badges & Add Button */}
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <FoodTypeBadge type={item.foodType} />
                              {item.spicyLevel && item.spicyLevel > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700">
                                  <Flame className="h-3.5 w-3.5" /> Spicy
                                </span>
                              ) : null}
                            </div>

                            {/* Quantity Selector */}
                            {quantity === 0 ? (
                              <button
                                onClick={() => updateQuantity(item, 1)}
                                className="flex items-center gap-1.5 rounded-xl border border-emerald-700 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-700 hover:text-white active:scale-95"
                              >
                                <Plus className="h-3.5 w-3.5" /> ADD
                              </button>
                            ) : (
                              <div className="flex items-center rounded-xl bg-emerald-700 text-white shadow-md">
                                <button
                                  className="flex h-8 w-8 items-center justify-center rounded-l-xl text-white transition hover:bg-emerald-800 active:scale-95"
                                  onClick={() => updateQuantity(item, -1)}
                                  aria-label={`Remove ${item.name}`}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-7 text-center text-xs font-bold text-white">
                                  {quantity}
                                </span>
                                <button
                                  className="flex h-8 w-8 items-center justify-center rounded-r-xl text-white transition hover:bg-emerald-800 active:scale-95"
                                  onClick={() => updateQuantity(item, 1)}
                                  aria-label={`Add ${item.name}`}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Desktop Sidebar Cart Panel */}
        <aside className="hidden lg:block">
          <div className="sticky top-40 space-y-4">
            {/* Live Table Macro Meter */}
            <TableNutritionMeter
              totalCalories={nutritionTotals.totalCalories}
              totalProtein={nutritionTotals.totalProtein}
              totalCarbs={nutritionTotals.totalCarbs}
              totalFat={nutritionTotals.totalFat}
              isHighProtein={nutritionTotals.isHighProteinOrder}
            />

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
              onOpenWhatsAppBill={() => setIsWhatsAppModalOpen(true)}
              onOpenSplitBill={() => setIsSplitBillModalOpen(true)}
              onOpenReview={() => setIsReviewModalOpen(true)}
            />
          </div>
        </aside>
      </section>

      {/* Floating Mobile Cart Bar */}
      {(totalItemCount > 0 || sessionDailyOrderNumber) && (
        <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-emerald-700 px-4 py-3.5 text-white shadow-2xl transition hover:bg-emerald-800 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-800 text-xs font-black text-white">
                {totalItemCount}
              </span>
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                  {sessionDailyOrderNumber ? `Order #${sessionDailyOrderNumber}` : "View Table Cart"}
                </p>
                <p className="text-sm font-bold">
                  {formatMoney(total)} <span className="text-xs font-normal text-emerald-100">incl. GST</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-100">
              <span className="text-[11px] bg-emerald-800 px-2 py-0.5 rounded-md">
                🔥 {nutritionTotals.totalCalories} kcal
              </span>
              <ChevronUp className="h-4 w-4 ml-1" />
            </div>
          </button>
        </div>
      )}

      {/* Mobile Slide-Up Bottom Sheet Modal */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div className="flex max-h-[85vh] flex-col rounded-t-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3.5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-bold text-stone-950">Your Table Order</h2>
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
              <TableNutritionMeter
                totalCalories={nutritionTotals.totalCalories}
                totalProtein={nutritionTotals.totalProtein}
                totalCarbs={nutritionTotals.totalCarbs}
                totalFat={nutritionTotals.totalFat}
                isHighProtein={nutritionTotals.isHighProteinOrder}
              />

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
                onOpenWhatsAppBill={() => setIsWhatsAppModalOpen(true)}
                onOpenSplitBill={() => setIsSplitBillModalOpen(true)}
                onOpenReview={() => setIsReviewModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default CustomerMenu;

function FoodTypeBadge({ type }: { type: string }) {
  if (type === "NON_VEG") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700">
        <span className="grid h-4 w-4 place-items-center rounded-[3px] border border-red-700 p-[2px]">
          <span className="h-0 w-0 border-x-[4px] border-x-transparent border-b-[7px] border-b-red-700" />
        </span>
        Non-veg
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
      <span className="grid h-4 w-4 place-items-center rounded-[3px] border border-emerald-700 p-[2px]">
        <span className="h-2 w-2 rounded-full bg-emerald-700" />
      </span>
      Veg
    </span>
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
  onOpenWhatsAppBill,
  onOpenSplitBill,
  onOpenReview,
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
  onOpenWhatsAppBill?: () => void;
  onOpenSplitBill?: () => void;
  onOpenReview?: () => void;
}) {
  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-sm">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="text-sm font-bold text-stone-900">Items Ordered ({itemCount})</h3>
        <span className="text-xs font-semibold text-emerald-800">{estimatedWait}</span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {cartLines.length === 0 && (
          <p className="text-sm font-medium text-stone-500 py-3 text-center">Your cart is empty. Add items from the menu.</p>
        )}
        {cartLines.map((line) => (
          <div key={line.item.id} className="flex items-center justify-between gap-3 text-sm">
            <div>
              <span className="font-bold text-stone-900">
                {line.quantity} × {line.item.name}
              </span>
              {line.instructions && (
                <p className="text-[11px] text-stone-500 italic">Note: {line.instructions}</p>
              )}
            </div>
            <span className="font-bold text-stone-950 font-mono">{formatMoney(line.item.pricePaise * line.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Recommended Add-ons */}
      {recommendations.length > 0 && (
        <div className="border-t border-stone-200 pt-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-700" /> Popular Add-ons
          </p>
          <div className="space-y-1.5">
            {recommendations.map((item) => (
              <button
                key={item.id}
                className="flex w-full items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/60 px-3 py-2 text-left text-xs font-bold text-emerald-950 transition hover:bg-emerald-100/80 active:scale-[0.98]"
                onClick={() => addItem(item)}
              >
                <span>{item.name} ({formatMoney(item.pricePaise)})</span>
                <Plus className="h-4 w-4 text-emerald-800" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs font-semibold">
        <div className="flex items-center justify-between text-stone-600">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-stone-600">
          <span>Taxes (5% GST)</span>
          <span>{formatMoney(gst)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-bold text-stone-950 pt-1.5 border-t border-stone-100">
          <span>Total Payable</span>
          <span className="font-mono">{formatMoney(total)}</span>
        </div>
      </div>

      {/* Order Status Banner */}
      {sessionDailyOrderNumber && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-950">
          ✓ Order #{sessionDailyOrderNumber} {rounds > 1 ? `(Round ${rounds}) ` : ""}sent to kitchen. Status: Preparing.
        </div>
      )}

      {/* Quick Tool Strip (WhatsApp Bill, Split Bill, Review) */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <button
          type="button"
          onClick={onOpenWhatsAppBill}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-stone-800 text-[11px] font-bold flex flex-col items-center gap-1 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
          <span>WA Bill</span>
        </button>
        <button
          type="button"
          onClick={onOpenSplitBill}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-stone-800 text-[11px] font-bold flex flex-col items-center gap-1 transition-colors"
        >
          <Split className="w-3.5 h-3.5 text-purple-700" />
          <span>Split Bill</span>
        </button>
        <button
          type="button"
          onClick={onOpenReview}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-stone-800 text-[11px] font-bold flex flex-col items-center gap-1 transition-colors"
        >
          <Star className="w-3.5 h-3.5 text-amber-600" />
          <span>Rate Us</span>
        </button>
      </div>

      {/* Primary Action Button */}
      <Button
        className="h-12 w-full rounded-xl bg-emerald-700 text-sm font-bold text-white transition hover:bg-emerald-800 shadow-md active:scale-[0.98]"
        disabled={cartLines.length === 0 || isSubmitting}
        onClick={onPlaceOrder}
      >
        {isSubmitting
          ? "Sending to Kitchen..."
          : sessionDailyOrderNumber
          ? `Send Additional Order (${itemCount} ${itemCount === 1 ? "item" : "items"} • ${formatMoney(total)}) →`
          : `Place Order Now (${itemCount} ${itemCount === 1 ? "item" : "items"} • ${formatMoney(total)}) →`}
      </Button>
    </div>
  );
}
