"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Plus, 
  Minus, 
  Info, 
  ChevronRight,
  Utensils,
  Leaf,
  Activity,
  Layers
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

export type Dish3DModalItem = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  pricePaise: number;
  foodType: string;
  spicyLevel?: number | null;
  calories?: number | null;
  proteinGrams?: number | null;
  fatGrams?: number | null;
  carbsGrams?: number | null;
  fiberGrams?: number | null;
  allergens?: string[] | any;
  dietaryFlags?: string[] | any;
  chefNote?: string | null;
  isHotSizzler?: boolean | null;
  available?: boolean;
};

interface Dish3DModalProps {
  item: Dish3DModalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Dish3DModalItem, quantity: number, instructions: string) => void;
  initialQuantity?: number;
  initialInstructions?: string;
}

export function Dish3DModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
  initialQuantity = 1,
  initialInstructions = ""
}: Dish3DModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [instructions, setInstructions] = useState(initialInstructions);
  const [activeTab, setActiveTab] = useState<"overview" | "macros" | "chef">("overview");

  // 3D Parallax Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity || 1);
      setInstructions(initialInstructions || "");
      setActiveTab("overview");
      setRotateX(0);
      setRotateY(0);
      setGlarePos({ x: 50, y: 50, opacity: 0 });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, initialQuantity, initialInstructions, onClose]);

  if (!item) return null;

  const isVeg = item.foodType === "VEG";
  const isEgg = item.foodType === "EGG";
  const spicy = item.spicyLevel || 0;

  // Normalized macros
  const calories = item.calories || 380;
  const protein = item.proteinGrams || 24;
  const fat = item.fatGrams || 16;
  const carbs = item.carbsGrams || 36;
  const fiber = item.fiberGrams || 4;

  const totalMacroGrams = Math.max(1, protein + fat + carbs);
  const proteinPct = Math.round((protein / totalMacroGrams) * 100);
  const fatPct = Math.round((fat / totalMacroGrams) * 100);
  const carbsPct = Math.max(0, 100 - proteinPct - fatPct);

  const allergensList: string[] = Array.isArray(item.allergens) 
    ? item.allergens 
    : typeof item.allergens === "string" 
      ? JSON.parse(item.allergens || "[]") 
      : [];

  const dietaryList: string[] = Array.isArray(item.dietaryFlags) 
    ? item.dietaryFlags 
    : typeof item.dietaryFlags === "string" 
      ? JSON.parse(item.dietaryFlags || "[]") 
      : [];

  // Mouse / Touch Parallax Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12; // Max 12 deg tilt
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
      opacity: 0.35
    });
  };

  const handlePointerLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  const handleAdd = () => {
    onAddToCart(item, quantity, instructions);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* 3D Modal Perspective Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ perspective: 1200 }}
            className="relative w-full max-w-lg z-10 my-auto"
          >
            {/* Interactive 3D Card */}
            <div
              ref={cardRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              style={{
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transformStyle: "preserve-3d",
                transition: "transform 0.1s ease-out"
              }}
              className="relative bg-slate-900/95 border border-slate-700/70 rounded-3xl overflow-hidden shadow-2xl text-white backdrop-blur-xl"
            >
              {/* Dynamic Specular Lighting Glare */}
              <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-3xl"
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}) 0%, transparent 65%)`
                }}
              />

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-black/90 transition-all backdrop-blur-md shadow-lg border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Media / 3D Food Showcase */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover object-center transform scale-105 hover:scale-110 transition-transform duration-700"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                    <Utensils className="w-12 h-12 mb-2 opacity-40" />
                    <span className="text-sm font-medium">Studio Food Shot</span>
                  </div>
                )}

                {/* Dark Gradient Overlay for Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

                {/* Steam & Sizzle Visual Particles if hot */}
                {item.isHotSizzler && (
                  <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-md animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sizzling Hot Fresh Prep</span>
                  </div>
                )}

                {/* Veg / Non-Veg & Spice Badges */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-20">
                  <div className="flex items-center gap-2">
                    {/* Food Type Indicator */}
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg ${
                        isVeg
                          ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-400"
                          : isEgg
                          ? "bg-amber-950/80 border-amber-500/80 text-amber-400"
                          : "bg-rose-950/80 border-rose-500/80 text-rose-400"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isVeg ? "bg-emerald-400" : isEgg ? "bg-amber-400" : "bg-rose-500"
                        }`}
                      />
                      <span>{isVeg ? "100% VEG" : isEgg ? "EGG" : "NON-VEG"}</span>
                    </div>

                    {/* Spice Level */}
                    {spicy > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-950/80 border border-orange-500/80 text-orange-400 text-xs font-bold backdrop-blur-md">
                        <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                        <span>{spicy === 1 ? "Mild" : spicy === 2 ? "Spicy" : "Extra Hot"}</span>
                      </div>
                    )}
                  </div>

                  {/* High Protein Badge */}
                  {protein >= 25 && (
                    <div className="px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-400/80 text-blue-300 text-xs font-bold backdrop-blur-md flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      <span>{protein}g Protein 💪</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Title & Price */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">
                      {item.name}
                    </h2>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed line-clamp-2">
                      {item.description || "Freshly cooked to perfection with authentic flavors and spices."}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-emerald-400">
                      {formatMoney(item.pricePaise)}
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      + 5% GST
                    </span>
                  </div>
                </div>

                {/* Tab Navigation (Overview / Macros / Chef Note) */}
                <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                      activeTab === "overview"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Quick Order
                  </button>
                  <button
                    onClick={() => setActiveTab("macros")}
                    className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                      activeTab === "macros"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Nutrition & Macros</span>
                  </button>
                  {item.chefNote && (
                    <button
                      onClick={() => setActiveTab("chef")}
                      className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                        activeTab === "chef"
                          ? "bg-emerald-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Chef&apos;s Story</span>
                    </button>
                  )}
                </div>

                {/* Tab Content 1: Overview */}
                {activeTab === "overview" && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Live Macro Pill Strip */}
                    <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div className="p-1">
                        <span className="block text-[10px] text-slate-400 uppercase font-medium">Calories</span>
                        <span className="text-sm font-bold text-amber-400">{calories} kcal</span>
                      </div>
                      <div className="p-1 border-l border-slate-700/50">
                        <span className="block text-[10px] text-slate-400 uppercase font-medium">Protein</span>
                        <span className="text-sm font-bold text-blue-400">{protein}g</span>
                      </div>
                      <div className="p-1 border-l border-slate-700/50">
                        <span className="block text-[10px] text-slate-400 uppercase font-medium">Fats</span>
                        <span className="text-sm font-bold text-emerald-400">{fat}g</span>
                      </div>
                      <div className="p-1 border-l border-slate-700/50">
                        <span className="block text-[10px] text-slate-400 uppercase font-medium">Carbs</span>
                        <span className="text-sm font-bold text-purple-400">{carbs}g</span>
                      </div>
                    </div>

                    {/* Special Instructions Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Cooking Instructions / Customization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Less spicy, no onions, extra crispy..."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Macros & Allergens */}
                {activeTab === "macros" && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Visual Macro Split Progress Bar */}
                    <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">Macro Calorie Split</span>
                        <span className="text-emerald-400">{calories} Total kcal</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-700 flex overflow-hidden">
                        <div style={{ width: `${proteinPct}%` }} className="bg-blue-500" title={`Protein: ${proteinPct}%`} />
                        <div style={{ width: `${fatPct}%` }} className="bg-emerald-500" title={`Fat: ${fatPct}%`} />
                        <div style={{ width: `${carbsPct}%` }} className="bg-purple-500" title={`Carbs: ${carbsPct}%`} />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500" /> Protein ({protein}g · {proteinPct}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Fat ({fat}g · {fatPct}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500" /> Carbs ({carbs}g · {carbsPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Dietary Badges */}
                    {dietaryList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {dietaryList.map((flag) => (
                          <span
                            key={flag}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300"
                          >
                            ✓ {flag.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Allergen Transparency */}
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                      <span className="block text-xs font-semibold text-slate-300 mb-1.5">Allergen Transparency</span>
                      {allergensList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {allergensList.map((alg) => (
                            <span
                              key={alg}
                              className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-950/60 border border-rose-600/40 text-rose-300"
                            >
                              Contains {alg}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No major common allergens declared.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Chef's Story */}
                {activeTab === "chef" && item.chefNote && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-800/60 border border-amber-500/30 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>CHEF&apos;S SIGNATURE NOTES</span>
                    </div>
                    <p className="text-sm text-amber-100/90 italic leading-relaxed">
                      &ldquo;{item.chefNote}&rdquo;
                    </p>
                  </div>
                )}

                {/* Bottom Order Bar */}
                <div className="pt-2 flex items-center gap-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Decrease quantity"
                      className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Increase quantity"
                      className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAdd}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/50 flex items-center justify-between transition-all transform active:scale-[0.98]"
                  >
                    <span>Add to Table Order</span>
                    <span className="font-mono">{formatMoney(item.pricePaise * quantity)}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default Dish3DModal;
