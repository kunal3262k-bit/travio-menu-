"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Flame, 
  Sparkles, 
  Plus, 
  Minus, 
  Utensils, 
  Activity, 
  RotateCcw, 
  Compass, 
  Eye, 
  Camera,
  Layers,
  ShieldCheck,
  Award
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
  const [isInspecting, setIsInspecting] = useState<boolean>(true);
  const [gyroActive, setGyroActive] = useState<boolean>(false);

  // 3D Motion Physics & Gesture Tracking
  const stageRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(10);
  const [rotateY, setRotateY] = useState<number>(-15);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartPos = useRef<{ x: number; y: number; startRotX: number; startRotY: number }>({
    x: 0,
    y: 0,
    startRotX: 10,
    startRotY: -15
  });
  const [glarePos, setGlarePos] = useState({ x: 42, y: 38, opacity: 0.28 });

  // Resolve 3-Angle Studio Image Gallery
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

    return [
      {
        url: primaryUrl,
        label: "1. Front 45° Hero Studio",
        source: "AI_STUDIO"
      },
      {
        url: rawGallery[1]?.url || primaryUrl,
        label: "2. Top-Down Flatlay View",
        source: "AI_STUDIO"
      },
      {
        url: rawGallery[2]?.url || rawGallery[0]?.url || primaryUrl,
        label: "3. Macro Texture Close-Up",
        source: "AI_STUDIO"
      }
    ];
  }, [item]);

  // Mobile Device Orientation Gyroscope (Smooth Low-Pass Filter)
  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      setGyroActive(true);
      // Damped tilt range: -22 to +22 deg
      const targetTiltY = Math.max(-22, Math.min(22, e.gamma * 0.7));
      const targetTiltX = Math.max(-20, Math.min(20, (e.beta - 45) * 0.5));
      
      setRotateX(targetTiltX);
      setRotateY(targetTiltY);
      setGlarePos({
        x: Math.round(50 + targetTiltY * 1.8),
        y: Math.round(50 + targetTiltX * 1.8),
        opacity: 0.38
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

  // Reset and initialization
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity || 1);
      setInstructions(initialInstructions || "");
      setActiveTab("3d_view");
      setSelectedAngleIndex(0);
      setRotateX(8);
      setRotateY(-12);
      setGlarePos({ x: 40, y: 35, opacity: 0.3 });

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

  // Gesture Drag 3D Rotator
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
      
      const newRotY = dragStartPos.current.startRotY + deltaX * 0.45;
      const newRotX = Math.max(-28, Math.min(28, dragStartPos.current.startRotX - deltaY * 0.45));
      
      setRotateX(newRotX);
      setRotateY(newRotY);
      setGlarePos({
        x: Math.round((x / rect.width) * 100),
        y: Math.round((y / rect.height) * 100),
        opacity: 0.45
      });
    } else {
      // Subtle interactive hover parallax
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotX = ((y - centerY) / centerY) * -12;
      const rotY = ((x - centerX) / centerX) * 12;
      setRotateX(rotX);
      setRotateY(rotY);
      setGlarePos({
        x: Math.round((x / rect.width) * 100),
        y: Math.round((y / rect.height) * 100),
        opacity: 0.32
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const reset3DView = () => {
    setRotateX(8);
    setRotateY(-12);
    setGlarePos({ x: 40, y: 35, opacity: 0.3 });
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
            className="fixed inset-0 bg-[#070D0B]/90 backdrop-blur-xl transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="relative w-full max-w-xl z-10 my-auto bg-[#070D0B] border border-emerald-500/20 rounded-3xl overflow-hidden shadow-2xl text-white backdrop-blur-2xl"
          >
            {/* Studio Header Bar */}
            <div className="relative z-30 flex items-center justify-between px-5 pt-4 pb-2 border-b border-emerald-950/80 bg-gradient-to-r from-emerald-950/40 via-transparent to-emerald-950/40">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Compass className="w-3.5 h-3.5" /> 3D Studio Food Inspector
                </span>
                {gyroActive && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] text-emerald-300 font-bold">
                    Gyro Enabled
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={reset3DView}
                  title="Reset 3D Perspective"
                  className="px-2.5 py-1 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 transition-all text-xs flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Center</span>
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="p-1.5 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
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
              style={{ perspective: 1200 }}
              className="relative h-72 sm:h-84 w-full overflow-hidden bg-gradient-to-b from-[#070D0B] via-[#0A1612] to-[#070D0B] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            >
              {/* Studio Key Light Spotlight (Soft Gold & Emerald Rim) */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(0, 184, 124, 0.18) 0%, rgba(255, 230, 180, 0.08) 35%, transparent 70%)`
                }}
              />

              {/* Reactive Specular Floor Occlusion Shadow */}
              <div 
                style={{
                  transform: `translateX(${rotateY * 2.2}px) translateY(${Math.abs(rotateX) * 0.6}px) scale(${1 - Math.abs(rotateX) * 0.01})`,
                  opacity: 0.75
                }}
                className="absolute bottom-6 w-60 h-14 rounded-full bg-black/90 blur-2xl pointer-events-none transition-transform duration-75"
              />

              {/* Multi-Layer 3D Floating Platter */}
              <motion.div
                animate={{
                  y: [0, -6, 0]
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(25px)`,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  transition: isDragging ? "none" : "transform 0.14s cubic-bezier(0.2, 0, 0, 1)"
                }}
                className="relative w-64 h-64 sm:w-76 sm:h-76 rounded-full p-3 bg-gradient-to-tr from-emerald-950/60 via-slate-800/80 to-slate-900 shadow-[0_30px_70px_rgba(0,0,0,0.95)] border border-emerald-500/30 backdrop-blur-md"
              >
                {/* Dynamic Surface PBR Glare Shading */}
                <div
                  className="pointer-events-none absolute inset-0 z-30 rounded-full transition-opacity duration-100"
                  style={{
                    background: `radial-gradient(ellipse at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}) 0%, rgba(0, 184, 124, 0.15) 30%, transparent 65%)`
                  }}
                />

                {/* Main Food Photo Frame with Inner Shadow Bevel */}
                <div 
                  style={{ transform: "translateZ(35px)", transformStyle: "preserve-3d" }}
                  className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border border-white/10"
                >
                  <Image
                    src={currentDisplayImage}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 300px, 340px"
                    className="object-cover object-center transform scale-110 pointer-events-none transition-transform duration-700"
                    priority
                  />

                  {/* Sizzle Steam Vapor Animation */}
                  {item.isHotSizzler && (
                    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                      <div className="w-28 h-40 bg-gradient-to-t from-white/25 via-white/10 to-transparent blur-md rounded-full animate-pulse opacity-80" />
                    </div>
                  )}

                  {/* 3D Elevated Hotspots & Macro Indicators */}
                  {isInspecting && (
                    <div 
                      style={{ transform: "translateZ(40px)" }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      <div className="absolute top-1/4 left-1/4 z-30 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-amber-400/80 text-[10px] font-bold text-amber-300 shadow-xl flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Artisanal Glaze</span>
                      </div>
                      <div className="absolute bottom-1/4 right-1/4 z-30 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-emerald-400/80 text-[10px] font-bold text-emerald-300 shadow-xl flex items-center gap-1">
                        <Award className="w-3 h-3 text-emerald-400" />
                        <span>{protein}g Protein</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sizzler Hot Badge */}
                {item.isHotSizzler && (
                  <div 
                    style={{ transform: "translateZ(50px)" }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-xl"
                  >
                    <Flame className="w-3.5 h-3.5 fill-slate-950" />
                    <span>🔥 Sizzling Fresh</span>
                  </div>
                )}
              </motion.div>

              {/* Drag & Inspection Hint Footer */}
              <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <span className="text-[11px] font-medium text-slate-300 bg-black/75 px-3 py-1 rounded-xl backdrop-blur-md border border-white/10 font-mono">
                  👆 Drag to rotate 3D platter
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsInspecting(!isInspecting);
                  }}
                  className="pointer-events-auto px-3 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isInspecting ? "Hide Hotspots" : "Show Hotspots"}</span>
                </button>
              </div>
            </div>

            {/* 3-Angle Multi-Camera Studio Switcher */}
            <div className="px-5 py-2.5 bg-[#070D0B] border-y border-emerald-950/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono">
                <Camera className="w-3.5 h-3.5" />
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
                        : "bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:text-white"
                    }`}
                  >
                    <span>{idx === 0 ? "1. Front 45°" : idx === 1 ? "2. Top-Down" : "3. Macro Close-Up"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dish Details, Macros & Chef Notes */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[46vh] overflow-y-auto">
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
                  <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase font-mono">
                    + 5% GST
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
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
                  <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-[#0A1612] border border-emerald-500/20 font-mono">
                    <div className="p-1">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Calories</span>
                      <span className="text-sm font-bold text-amber-400">{calories} kcal</span>
                    </div>
                    <div className="p-1 border-l border-emerald-950">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Protein</span>
                      <span className="text-sm font-bold text-blue-400">{protein}g</span>
                    </div>
                    <div className="p-1 border-l border-emerald-950">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Fats</span>
                      <span className="text-sm font-bold text-emerald-400">{fat}g</span>
                    </div>
                    <div className="p-1 border-l border-emerald-950">
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Carbs</span>
                      <span className="text-sm font-bold text-purple-400">{carbs}g</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Special Cooking Notes (e.g. less spicy, extra crisp, no onions)
                    </label>
                    <input
                      type="text"
                      placeholder="Type cooking notes for kitchen..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Nutrition & Diet Breakdown */}
              {activeTab === "macros" && (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-[#0A1612] border border-emerald-500/20 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Macro Calorie Split</span>
                      <span className="text-emerald-400 font-mono">{calories} Total kcal</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
                      <div style={{ width: `${proteinPct}%` }} className="bg-blue-500" title={`Protein: ${proteinPct}%`} />
                      <div style={{ width: `${fatPct}%` }} className="bg-emerald-500" title={`Fat: ${fatPct}%`} />
                      <div style={{ width: `${carbsPct}%` }} className="bg-purple-500" title={`Carbs: ${carbsPct}%`} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
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

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
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
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                    <Sparkles className="w-4 h-4" />
                    <span>CHEF&apos;S PROVENANCE NOTE</span>
                  </div>
                  <p className="text-sm text-amber-100/90 italic leading-relaxed">
                    &ldquo;{item.chefNote}&rdquo;
                  </p>
                </div>
              )}

              {/* Bottom Quick-Add Bar */}
              <div className="pt-2 flex items-center gap-3 border-t border-emerald-950/80">
                {/* Quantity */}
                <div className="flex items-center bg-slate-900 rounded-xl border border-slate-700 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-between"
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
