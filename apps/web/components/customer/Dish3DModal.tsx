"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Layers,
  RotateCcw,
  Compass,
  Eye,
  Camera,
  Maximize2
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

export type StudioImageCandidate = {
  url: string;
  label: string;
  source?: string;
  aspectRatio?: string;
};

export type Dish3DModalItem = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageGallery?: StudioImageCandidate[] | any;
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
  const [activeTab, setActiveTab] = useState<"3d_view" | "macros" | "chef">("3d_view");
  const [selectedAngleIndex, setSelectedAngleIndex] = useState<number>(0);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [gyroActive, setGyroActive] = useState<boolean>(false);

  // 3D Motion & Parallax Physics
  const stageRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartPos = useRef<{ x: number; y: number; startRotX: number; startRotY: number }>({
    x: 0,
    y: 0,
    startRotX: 0,
    startRotY: 0
  });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0.15 });

  // Resolve Image Gallery (3 angles minimum)
  const gallery: StudioImageCandidate[] = React.useMemo(() => {
    if (!item) return [];
    
    let rawGallery: StudioImageCandidate[] = [];
    if (Array.isArray(item.imageGallery)) {
      rawGallery = item.imageGallery;
    } else if (typeof item.imageGallery === "string") {
      try {
        rawGallery = JSON.parse(item.imageGallery);
      } catch (e) {
        rawGallery = [];
      }
    }

    const primaryUrl = item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85";
    
    if (rawGallery.length >= 3) {
      return rawGallery;
    }

    // Default 3 Multi-Angle Gallery Fallbacks
    return [
      {
        url: primaryUrl,
        label: "Front 45° Hero Angle",
        source: "AI_STUDIO"
      },
      {
        url: rawGallery[1]?.url || primaryUrl,
        label: "Top-Down Flatlay View",
        source: "AI_STUDIO"
      },
      {
        url: rawGallery[2]?.url || rawGallery[0]?.url || primaryUrl,
        label: "Macro Texture Close-Up",
        source: "AI_STUDIO"
      }
    ];
  }, [item]);

  // Mobile Device Orientation (Gyroscope)
  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      setGyroActive(true);
      // Damped tilt range: -25 to +25 deg
      const tiltY = Math.max(-25, Math.min(25, e.gamma * 0.8));
      const tiltX = Math.max(-25, Math.min(25, (e.beta - 45) * 0.6));
      setRotateX(tiltX);
      setRotateY(tiltY);
      setGlarePos({
        x: Math.round(50 + tiltY * 1.5),
        y: Math.round(50 + tiltX * 1.5),
        opacity: 0.35
      });
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, [isOpen]);

  // Keyboard accessibility
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity || 1);
      setInstructions(initialInstructions || "");
      setActiveTab("3d_view");
      setSelectedAngleIndex(0);
      setRotateX(0);
      setRotateY(0);
      setGlarePos({ x: 50, y: 50, opacity: 0.2 });

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

  // Normalized Nutrition
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

  // Mouse / Touch Drag 3D Rotator
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      startRotX: rotateX,
      startRotY: rotateY
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      const newRotY = dragStartPos.current.startRotY + deltaX * 0.35;
      const newRotX = Math.max(-30, Math.min(30, dragStartPos.current.startRotX - deltaY * 0.35));
      
      setRotateX(newRotX);
      setRotateY(newRotY);
      setGlarePos({
        x: Math.round((x / rect.width) * 100),
        y: Math.round((y / rect.height) * 100),
        opacity: 0.4
      });
    } else {
      // Subtle hover parallax when not dragging
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotX = ((y - centerY) / centerY) * -14;
      const rotY = ((x - centerX) / centerX) * 14;
      setRotateX(rotX);
      setRotateY(rotY);
      setGlarePos({
        x: Math.round((x / rect.width) * 100),
        y: Math.round((y / rect.height) * 100),
        opacity: 0.3
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const reset3DView = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0.2 });
  };

  const handleAdd = () => {
    onAddToCart(item, quantity, instructions);
    onClose();
  };

  const currentDisplayImage = gallery[selectedAngleIndex]?.url || item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-xl z-10 my-auto bg-[#0B0F17] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl text-white backdrop-blur-2xl"
          >
            {/* Header Controls */}
            <div className="relative z-30 flex items-center justify-between px-5 pt-4 pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> 3D Interactive Food Stage
                </span>
                {gyroActive && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-semibold">
                    Phone Gyro Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={reset3DView}
                  title="Reset 3D Perspective"
                  className="p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Reset</span>
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-2 rounded-full bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.15] transition-all border border-white/[0.08]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3D Interactive Hero Stage */}
            <div 
              ref={stageRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{ perspective: 1400 }}
              className="relative h-72 sm:h-80 w-full overflow-hidden bg-gradient-to-b from-[#0B0F17] via-[#0E1422] to-[#0B0F17] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            >
              {/* Radial Lighting Spotlight */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_70%)] pointer-events-none" />

              {/* Dynamic Specular Floor Shadow */}
              <div 
                style={{
                  transform: `translateX(${rotateY * 1.8}px) scale(${1 - Math.abs(rotateX) * 0.008})`,
                  opacity: 0.6
                }}
                className="absolute bottom-6 w-56 h-12 rounded-full bg-black/80 blur-xl pointer-events-none transition-transform duration-75"
              />

              {/* True 3D Floating Food Plate */}
              <motion.div
                animate={{
                  y: [0, -6, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`,
                  transformStyle: "preserve-3d",
                  transition: isDragging ? "none" : "transform 0.12s ease-out"
                }}
                className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2.5 bg-gradient-to-tr from-white/[0.08] via-white/[0.18] to-white/[0.05] shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/[0.15] backdrop-blur-sm"
              >
                {/* Specular Glare Reflection on Plate Rim */}
                <div
                  className="pointer-events-none absolute inset-0 z-30 rounded-full transition-opacity duration-150"
                  style={{
                    background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}) 0%, transparent 60%)`
                  }}
                />

                {/* Main Food Photo Circle */}
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-inner border border-white/[0.1]">
                  <Image
                    src={currentDisplayImage}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 280px, 320px"
                    className="object-cover object-center transform scale-110 pointer-events-none transition-transform duration-500"
                    priority
                  />

                  {/* Sizzle Steam Vapor Animation */}
                  {item.isHotSizzler && (
                    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                      <div className="w-24 h-36 bg-gradient-to-t from-white/20 via-white/10 to-transparent blur-md rounded-full animate-pulse opacity-75" />
                    </div>
                  )}

                  {/* Tap-to-Inspect Hotspots */}
                  {isInspecting && (
                    <>
                      <div className="absolute top-1/4 left-1/3 z-30 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-amber-400 text-[10px] font-bold text-amber-300 shadow-lg animate-bounce">
                        ✨ Artisanal Glaze
                      </div>
                      <div className="absolute bottom-1/4 right-1/4 z-30 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-emerald-400 text-[10px] font-bold text-emerald-300 shadow-lg animate-bounce">
                        💪 {protein}g Protein Core
                      </div>
                    </>
                  )}
                </div>

                {/* Sizzler Hot Badge */}
                {item.isHotSizzler && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-lg backdrop-blur-md">
                    <Flame className="w-3.5 h-3.5 fill-slate-950" />
                    <span>🔥 Sizzling Fresh</span>
                  </div>
                )}
              </motion.div>

              {/* Drag / Gyro Hint Overlay */}
              <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <span className="text-[11px] font-medium text-slate-300 bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/[0.08]">
                  👆 Drag or tilt phone to rotate in 3D
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsInspecting(!isInspecting);
                  }}
                  className="pointer-events-auto px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 backdrop-blur-md transition-all flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>{isInspecting ? "Hide Hotspots" : "Inspect Plate"}</span>
                </button>
              </div>
            </div>

            {/* 3-Angle Studio Switcher */}
            <div className="px-5 py-2.5 bg-[#0E131F] border-y border-white/[0.08] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Angle:</span>
              </div>

              <div className="flex items-center gap-1.5 flex-1 max-w-md justify-end">
                {gallery.map((cand, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedAngleIndex(idx);
                      reset3DView();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedAngleIndex === idx
                        ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold scale-105"
                        : "bg-white/[0.06] text-slate-300 hover:bg-white/[0.12] hover:text-white"
                    }`}
                  >
                    <span>{idx === 0 ? "1. Front 45°" : idx === 1 ? "2. Top-Down" : "3. Close-Up"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Body & Tabs */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[50vh] overflow-y-auto">
              {/* Title & Price Bar */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isVeg
                          ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-400"
                          : isEgg
                          ? "bg-amber-950/80 border-amber-500/80 text-amber-400"
                          : "bg-rose-950/80 border-rose-500/80 text-rose-400"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? "bg-emerald-400" : isEgg ? "bg-amber-400" : "bg-rose-500"}`} />
                      {isVeg ? "100% VEG" : isEgg ? "EGG" : "NON-VEG"}
                    </span>

                    {spicy > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-950/80 border border-orange-500/80 text-orange-400 text-xs font-bold">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        {spicy === 1 ? "Mild" : spicy === 2 ? "Spicy" : "Extra Hot"}
                      </span>
                    )}

                    {protein >= 25 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/80 text-emerald-300 text-xs font-bold flex items-center gap-1">
                        💪 {protein}g Protein
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                    {item.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {item.description || "Freshly cooked to perfection with signature chef spices."}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {formatMoney(item.pricePaise)}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                    + 5% GST
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center p-1 bg-white/[0.04] rounded-xl border border-white/[0.08] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("3d_view")}
                  className={`flex-1 py-2 rounded-lg transition-all text-center ${
                    activeTab === "3d_view"
                      ? "bg-emerald-600 text-white shadow-md font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Quick Order
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("macros")}
                  className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                    activeTab === "macros"
                      ? "bg-emerald-600 text-white shadow-md font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Macros & Diet</span>
                </button>
                {item.chefNote && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("chef")}
                    className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                      activeTab === "chef"
                        ? "bg-emerald-600 text-white shadow-md font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Chef&apos;s Story</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Quick Order & Live Macro Summary */}
              {activeTab === "3d_view" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="p-1">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Calories</span>
                      <span className="text-sm font-bold text-amber-400">{calories} kcal</span>
                    </div>
                    <div className="p-1 border-l border-white/[0.06]">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Protein</span>
                      <span className="text-sm font-bold text-blue-400">{protein}g</span>
                    </div>
                    <div className="p-1 border-l border-white/[0.06]">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Fats</span>
                      <span className="text-sm font-bold text-emerald-400">{fat}g</span>
                    </div>
                    <div className="p-1 border-l border-white/[0.06]">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Carbs</span>
                      <span className="text-sm font-bold text-purple-400">{carbs}g</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Special Cooking Notes (e.g. less oil, extra crispy, spicy)
                    </label>
                    <input
                      type="text"
                      placeholder="Type cooking instructions..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Nutrition & Diet Breakdown */}
              {activeTab === "macros" && (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Macro Calorie Split</span>
                      <span className="text-emerald-400">{calories} Total kcal</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
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

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="block text-xs font-semibold text-slate-300 mb-1">Allergen Transparency</span>
                    {allergensList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {allergensList.map((alg) => (
                          <span
                            key={alg}
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-950/60 border border-rose-600/40 text-rose-300"
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

              {/* Tab 3: Chef's Story */}
              {activeTab === "chef" && item.chefNote && (
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>CHEF&apos;S PROVENANCE NOTE</span>
                  </div>
                  <p className="text-sm text-amber-100/90 italic leading-relaxed">
                    &ldquo;{item.chefNote}&rdquo;
                  </p>
                </div>
              )}

              {/* Bottom Quick-Add Bar */}
              <div className="pt-2 flex items-center gap-3 border-t border-white/[0.08]">
                {/* Quantity */}
                <div className="flex items-center bg-white/[0.05] rounded-xl border border-white/[0.1] p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.1] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.1] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-between"
                >
                  <span>Add to Table Order</span>
                  <span className="font-mono">{formatMoney(item.pricePaise * quantity)}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Dish3DModal;
