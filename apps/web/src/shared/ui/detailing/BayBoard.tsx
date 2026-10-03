"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Gauge,
  Layers,
  Phone,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
  Wrench,
  MessageCircle,
} from "lucide-react";
import { demoStudio } from "@/src/shared/utils/demo-data";

// ── Car color name → CSS hex lookup (fuzzy, case-insensitive) ──
const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a", obsidian: "#1a1a1a", "obsidian black": "#1a1a1a",
  white: "#f5f5f5", pearl: "#f0ede8", "pearl white": "#f0ede8",
  silver: "#b0b0b0", platinum: "#b8bcc4",
  gray: "#8b8b8b", grey: "#8b8b8b", nardo: "#737577", "nardo gray": "#737577",
  red: "#dc2626", guards: "#b91c1c", "guards red": "#b91c1c", crimson: "#991b1b",
  blue: "#2563eb", "le mans blue": "#1d4ed8", "san marino blue": "#3b82f6",
  green: "#16a34a", "isle of man green": "#166534", emerald: "#059669",
  yellow: "#ca8a04", "racing yellow": "#eab308",
  orange: "#ea580c", "papaya orange": "#f97316",
  purple: "#9333ea", violet: "#7c3aed",
  brown: "#92400e", bronze: "#b45309",
};

function resolveCarColor(colorName: string): string {
  if (!colorName) return "#64748b";
  const lower = colorName.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return hex;
  }
  return "#64748b";
}

function getCarHeroImage(brand?: string, model?: string): string {
  const b = (brand || "").toLowerCase();
  if (b.includes("porsche")) return "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=85";
  if (b.includes("bmw")) return "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=85";
  if (b.includes("audi")) return "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1000&q=85";
  if (b.includes("mercedes") || b.includes("amg")) return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=85";
  if (b.includes("ferrari")) return "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=85";
  if (b.includes("lamborghini")) return "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?auto=format&fit=crop&w=1000&q=85";
  if (b.includes("corvette") || b.includes("chevy")) return "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=85";
  return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85";
}

export const BAY_STAGES = [
  { key: "DECON_WASH", label: "Intake & Decon Wash", badge: "Bay 1", color: "emerald" },
  { key: "PAINT_CORRECTION", label: "Paint Correction", badge: "Bay 2", color: "cyan" },
  { key: "CERAMIC_PPF", label: "Ceramic & PPF Cleanroom", badge: "Bay 3", color: "purple" },
  { key: "IR_CURING", label: "IR Curing & Ready", badge: "Bay 4", color: "amber" },
] as const;

export type BayStageKey = (typeof BAY_STAGES)[number]["key"];

interface BayBoardProps {
  onSelectCar?: (car: any) => void;
  selectedCarId?: string;
}

export function BayBoard({ onSelectCar, selectedCarId }: BayBoardProps) {
  const [workOrders, setWorkOrders] = useState<any[]>(demoStudio.activeWorkOrders);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync with DB active work orders on mount
  useEffect(() => {
    async function loadActiveFleet() {
      try {
        setIsSyncing(true);
        const res = await fetch("/api/orders/active");
        const data = await res.json();
        if (data?.orders && data.orders.length > 0) {
          const formattedDbOrders = data.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.dailyOrderNumber || o.orderNumber,
            carYear: o.carYear || 2024,
            carBrand: o.carBrand || "Vehicle",
            carModel: o.carModel || "Model",
            carColor: o.carColor || "Silver",
            carLicensePlate: o.carLicensePlate || "N/A",
            customerName: o.customerName || "Customer",
            customerPhone: o.customerPhone || "",
            stage: o.stage || "DECON_WASH",
            stageLabel: BAY_STAGES.find((s) => s.key === o.stage)?.label || "Intake & Decon Wash",
            elapsedMin: Math.max(1, Math.round((Date.now() - new Date(o.createdAt).getTime()) / 60000)),
            estimatedReadyAt: "Today, 5:00 PM",
            totalUsd: Math.round((o.totalPaise || 245000) / 100),
            imageUrl: getCarHeroImage(o.carBrand, o.carModel),
            defectPhotos: [
              "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
            ],
            services: [
              {
                name: o.defectsSummary?.split(".")[0] || "Custom Detailing Package",
                price: Math.round((o.totalPaise || 245000) / 100),
              },
            ],
          }));

          // Merge: DB orders take precedence, keep demo cars to fill bays if DB has < 4
          const dbOrderIds = new Set(formattedDbOrders.map((d: any) => d.id));
          const demoSupplements = demoStudio.activeWorkOrders.filter(
            (d) => !dbOrderIds.has(d.id)
          );
          setWorkOrders([...formattedDbOrders, ...demoSupplements]);
        }
      } catch (err) {
        console.warn("Could not sync active orders with database:", err);
      } finally {
        setIsSyncing(false);
      }
    }

    loadActiveFleet();

    // Listen for real-time newly created vehicle intakes
    const handleIntakeEvent = (event: any) => {
      if (event?.detail) {
        setWorkOrders((current) => [event.detail, ...current]);
        playBayChime();
      }
    };

    window.addEventListener("swifttab:vehicle_intake", handleIntakeEvent);
    return () => window.removeEventListener("swifttab:vehicle_intake", handleIntakeEvent);
  }, []);

  // Synthesized Web Audio chime
  function playBayChime() {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext handled silently
    }
  }

  async function advanceStage(orderId: string) {
    playBayChime();

    const targetOrder = workOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const stageIndex = BAY_STAGES.findIndex((s) => s.key === targetOrder.stage);
    const nextStage = stageIndex >= BAY_STAGES.length - 1
      ? { key: "IR_CURING", label: "Ready for Pickup" }
      : BAY_STAGES[stageIndex + 1];

    // Optimistic UI update
    setWorkOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          stage: nextStage.key,
          stageLabel: nextStage.label,
        };
      })
    );

    // Persist to PostgreSQL database
    try {
      await fetch(`/api/orders/${orderId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage.key }),
      });
    } catch (err) {
      console.error("Failed to persist bay stage update to DB:", err);
    }
  }

  async function completeOrder(orderId: string) {
    playBayChime();

    // Optimistic UI update: remove from active bay board
    setWorkOrders((current) => current.filter((order) => order.id !== orderId));

    try {
      await fetch(`/api/orders/${orderId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "COMPLETED" }),
      });
    } catch (err) {
      console.error("Failed to persist order completion to DB:", err);
    }
  }

  const activeCount = workOrders.length;
  const totalRevenue = workOrders.reduce((acc, curr) => acc + (curr.totalUsd || 0), 0);

  return (
    <div className="w-full bg-[#080E0B] text-slate-100 rounded-2xl border border-emerald-950/60 shadow-2xl overflow-hidden font-sans">
      {/* Header Bar */}
      <header className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-emerald-950/70 bg-[#0A120E] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/30">
              <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">APEX AUTO SPA</span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Live Bay Dispatch Board</span>
                {isSyncing && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            Active Cars: <span className="text-white font-bold">{activeCount}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300">
            <span>Bay Pipeline:</span>
            <span className="text-white font-bold">${totalRevenue.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              soundEnabled
                ? "bg-emerald-900/30 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/50"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            {soundEnabled ? "Chime On" : "Muted"}
          </button>
        </div>
      </header>

      {/* 4-Bay Kanban Columns */}
      <div className="p-3 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto">
        {BAY_STAGES.map((stage) => {
          const ordersInStage = workOrders.filter((wo) => wo.stage === stage.key);

          return (
            <div
              key={stage.key}
              className="flex flex-col bg-[#070D0B] rounded-xl border border-emerald-950/50 p-3 min-w-0 w-full sm:min-w-[260px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-950/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                    {stage.badge}
                  </span>
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200">{stage.label}</h3>
                </div>
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-bold text-slate-300 flex items-center justify-center">
                  {ordersInStage.length}
                </span>
              </div>

              {/* Cards in this Stage */}
              <div className="space-y-3 flex-1">
                {ordersInStage.length === 0 ? (
                  <div className="h-32 rounded-lg border border-dashed border-emerald-950/60 flex items-center justify-center text-xs text-slate-500 font-medium">
                    Bay Empty
                  </div>
                ) : (
                  ordersInStage.map((order) => {
                    const isSelected = selectedCarId === order.id;

                    return (
                      <article
                        key={order.id}
                        onClick={() => onSelectCar?.(order)}
                        className={`group relative rounded-xl border p-3.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-950/50 border-emerald-500 shadow-lg shadow-emerald-950/40"
                            : "bg-[#0B1511] border-emerald-900/30 hover:border-emerald-700/60 hover:bg-[#0E1A15]"
                        }`}
                      >
                        {/* Vehicle Title & Year */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-semibold text-emerald-400">
                              #{order.orderNumber} • {order.carYear}
                            </span>
                            <h4 className="text-sm font-bold text-white leading-tight mt-0.5">
                              {order.carBrand} {order.carModel}
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 uppercase tracking-wider">
                            {order.carLicensePlate}
                          </span>
                        </div>

                        {/* Vehicle Color & Timer */}
                        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block ring-1 ring-white/10 shrink-0"
                              style={{ backgroundColor: resolveCarColor(order.carColor) }}
                              title={order.carColor}
                            />
                            {order.carColor}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-300">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            {order.elapsedMin}m in bay
                          </span>
                        </div>

                        {/* Image Preview */}
                        {order.imageUrl && (
                          <div className="mt-2.5 relative h-24 w-full rounded-lg overflow-hidden border border-emerald-950/60">
                            <Image
                              src={order.imageUrl}
                              alt={`${order.carBrand} ${order.carModel}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="300px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                              <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-400" /> 1-Tap Client Tracker Active
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Services List */}
                        <div className="mt-2.5 space-y-1">
                          {(order.services || []).slice(0, 2).map((srv: any, idx: number) => (
                            <div key={idx} className="text-[11px] text-slate-300 flex justify-between">
                              <span className="truncate pr-2">• {srv.name}</span>
                              <span className="text-slate-400 shrink-0 font-mono">${srv.price}</span>
                            </div>
                          ))}
                        </div>

                        {/* Total & Action Buttons */}
                        <div className="mt-3.5 pt-2.5 border-t border-emerald-950/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Total</span>
                            <span className="text-sm font-bold font-mono text-white">${order.totalUsd}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(
                                `Hi! Live bay status update for your ${order.carYear} ${order.carBrand} ${order.carModel} (${order.carLicensePlate}) at Apex Auto Spa:\n\nStage: ${stage.label} (${stage.badge})\nTotal Services: $${order.totalUsd}\n\nTrack live cleanroom bay progress and photos here: ${typeof window !== "undefined" ? window.location.origin : ""}/demo/car`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Send live bay progress to customer on WhatsApp"
                              className="px-2 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-400 border border-emerald-700/50 flex items-center gap-1 text-[11px] font-bold transition shadow-sm"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>

                            {order.stage === "IR_CURING" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  completeOrder(order.id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-900/30 active:scale-95 transition"
                                title="Mark service completed & paid"
                              >
                                <span>Complete & Paid</span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  advanceStage(order.id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-900/30 active:scale-95 transition"
                              >
                                <span>Next Bay</span>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
