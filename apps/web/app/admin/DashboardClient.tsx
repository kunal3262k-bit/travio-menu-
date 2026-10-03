"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { BayBoard } from "@/components/detailing/BayBoard";
import { demoStudio } from "@/src/shared/utils/demo-data";
import {
  Shield,
  Car,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  DollarSign,
  Layers,
  ExternalLink,
  X,
  Camera,
  Gauge,
  TrendingUp,
  AlertCircle,
  Smartphone,
  ChevronRight,
  MessageCircle,
  Copy,
  Check,
  PenTool,
  Upload,
  RotateCcw,
} from "lucide-react";

export default function DashboardClient({
  initialMetrics,
  initialStatus,
  restaurant,
}: {
  initialMetrics: any;
  initialStatus: string;
  restaurant?: any;
}) {
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeStep, setIntakeStep] = useState(1);
  const [intakeSuccess, setIntakeSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);
  const [intakeError, setIntakeError] = useState("");

  // 4-Angle Real Camera / Upload Inspection Photos
  const [intakePhotos, setIntakePhotos] = useState<Record<string, string>>({
    front: "",
    driver: "",
    rear: "",
    passenger: "",
  });

  // Client Pre-Inspection Waiver Canvas Signature
  const [signatureData, setSignatureData] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const fileInputRefs: Record<string, any> = {
    front: useRef<HTMLInputElement | null>(null),
    driver: useRef<HTMLInputElement | null>(null),
    rear: useRef<HTMLInputElement | null>(null),
    passenger: useRef<HTMLInputElement | null>(null),
  };

  const handlePhotoUpload = (angle: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setIntakePhotos((prev) => ({ ...prev, [angle]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
  };

  // New Car Intake State
  const [intakeData, setIntakeData] = useState({
    customerName: "Alexander Wright",
    phone: "(555) 019-2834",
    carYear: "2024",
    carBrand: "Porsche",
    carModel: "911 GT3 RS",
    carColor: "Guards Red",
    carLicensePlate: "GT3-APEX",
    servicePackage: "Concourse 2-Stage Polish + Ceramic",
    notes: "Customer requested extra focus on front bumper stone chips.",
  });

  const getWhatsAppIntakeUrl = () => {
    const cleanPhone = intakeData.phone.replace(/[^0-9+]/g, "");
    const trackingUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/demo/car`
        : "https://pushing-niagara-fed-phantom.trycloudflare.com/demo/car";
    const msg = `Hi ${intakeData.customerName || "there"}!\n\nYour ${intakeData.carYear} ${intakeData.carBrand} ${intakeData.carModel} (Plate: ${intakeData.carLicensePlate || "N/A"}) has been checked into ${restaurant?.name || "Apex Auto Spa"} for ${intakeData.servicePackage}.\n\n✓ 4-Angle Pre-Inspection Photos Captured\n✓ Digital Clean Paint Waiver Ready for Sign-Off\n\nTrack live cleanroom bay progress and photos on your phone:\n${trackingUrl}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingIntake(true);
    setIntakeError("");

    try {
      const res = await fetch("/api/orders/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...intakeData,
          photos: Object.entries(intakePhotos)
            .filter(([_, v]) => Boolean(v))
            .map(([k, v]) => `${k.toUpperCase()}: ${v}`),
          signature: signatureData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record intake");
      }

      // Dispatch real-time event to prepend to live BayBoard in Bay 1
      if (typeof window !== "undefined" && data.order) {
        const newVehicleCard = {
          id: data.order.id,
          orderNumber: data.order.dailyOrderNumber || data.order.orderNumber,
          carYear: data.order.carYear || 2024,
          carBrand: data.order.carBrand,
          carModel: data.order.carModel,
          carColor: data.order.carColor,
          carLicensePlate: data.order.carLicensePlate,
          customerName: data.order.customerName,
          customerPhone: data.order.customerPhone,
          stage: "DECON_WASH",
          stageLabel: "Intake & Decon Wash",
          elapsedMin: 1,
          estimatedReadyAt: "Tomorrow, 4:00 PM",
          totalUsd: Math.round((data.order.totalPaise || 245000) / 100),
          imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=85",
          defectPhotos: [
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
          ],
          services: [
            { name: intakeData.servicePackage, price: Math.round((data.order.totalPaise || 245000) / 100) },
          ],
        };

        window.dispatchEvent(
          new CustomEvent("swifttab:vehicle_intake", { detail: newVehicleCard })
        );
      }

      setIntakeSuccess(true);
    } catch (err: any) {
      console.error("Intake submission failed:", err);
      setIntakeError(err.message || "Failed to record vehicle intake");
    } finally {
      setIsSubmittingIntake(false);
    }
  };

  // ── Demo Fallback: use demoStudio metrics when DB is empty ──
  const isEmptyDB = !initialMetrics.orders || initialMetrics.orders === 0;
  const demoTotalUsd = demoStudio.activeWorkOrders.reduce((s, o) => s + o.totalUsd, 0);
  const metrics = isEmptyDB ? {
    tablesActive: demoStudio.activeWorkOrders.length,
    sales: demoTotalUsd * 100, // in paise/cents for "$" calc
    avgBill: Math.round((demoTotalUsd / demoStudio.activeWorkOrders.length) * 100),
    orders: demoStudio.activeWorkOrders.length,
    completed: 1,
    pending: demoStudio.activeWorkOrders.length - 1,
    cancelledOrders: 0,
    lifetimePaidOrders: 48,
    joinedDate: "Mar 2025",
    scans: 0,
    conversion: 0,
  } : initialMetrics;

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* ── STUDIO VITALS STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 — Live Active Vehicles */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-emerald-950/70 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="uppercase font-bold tracking-wider">Active Bay Fleet</span>
            <Car className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{metrics.tablesActive || 0}</span>
            <span className="text-xs text-emerald-400 font-mono font-bold">Vehicles In Shop</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{metrics.pending || 0} Pending · {metrics.completed || 0} Complete</span>
          </div>
        </div>

        {/* Metric 2 — Total Sales */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-emerald-950/70 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="uppercase font-bold tracking-wider">Bay Revenue Today</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">${(metrics.sales / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Avg Bill: ${(metrics.avgBill / 100).toFixed(0)}</span>
          </div>
        </div>

        {/* Metric 3 — Today's Orders */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-emerald-950/70 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="uppercase font-bold tracking-wider">Today's Work Orders</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{metrics.orders || 0}</span>
            <span className="text-xs text-zinc-400 font-mono">Orders</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{metrics.completed || 0} Completed · {metrics.cancelledOrders || 0} Cancelled</span>
          </div>
        </div>

        {/* Metric 4 — Lifetime Orders */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-emerald-950/70 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="uppercase font-bold tracking-wider">Lifetime Paid Jobs</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{metrics.lifetimePaidOrders || 0}</span>
            <span className="text-xs text-zinc-400 font-mono">Vehicles Served</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <span>Since {metrics.joinedDate || "launch"}</span>
          </div>
        </div>
      </div>

      {/* ── ACTION BANNER: 60s INTAKE & LIVE WALL DISPLAY ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#091510] via-[#0B1A13] to-[#091510] border border-emerald-500/40 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
              Shop Floor Dispatch Active
            </span>
            <span className="text-xs text-zinc-400">• Ready for walkaround check-in</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {restaurant?.name || "Apex Auto Spa"} — Studio Dispatch
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Advance vehicles across bays below to automatically update the wall monitor and send instant stage notifications to clients&apos; phones.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowIntakeModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all active:scale-[0.98]"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>+ 60s Vehicle Intake</span>
          </button>

          <Link
            href="/demo"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Client Phone View</span>
          </Link>
        </div>
      </div>

      {/* ── EMBEDDED LIVE BAY BOARD (Shop Floor Kanban) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            Live Cleanroom Bay Dispatch
          </h3>
          <span className="text-xs text-zinc-500 font-mono">Auto-refreshes via WebSockets</span>
        </div>

        <BayBoard />
      </div>

      {/* ── 60-SECOND DIGITAL INTAKE MODAL ── */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-emerald-500/60 p-6 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.3)] space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">60-Second Digital Defect Intake</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">Pre-Inspection Liability Shield</p>
                </div>
              </div>
              <button
                onClick={() => setShowIntakeModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {intakeSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Intake Logged & Liability Shield Active!</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                    4-angle defect inspection photos recorded. Assigned to Bay 1 Decon Wash.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-left space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Customer & Vehicle:</div>
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>{intakeData.customerName} • {intakeData.carYear} {intakeData.carBrand} {intakeData.carModel}</span>
                    <span className="font-mono text-emerald-400">{intakeData.phone}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    Service: <span className="text-zinc-200">{intakeData.servicePackage}</span>
                  </div>
                </div>

                {/* 1-Tap WhatsApp Dispatch Action */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <a
                    href={getWhatsAppIntakeUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-900/30 transition-all active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 fill-slate-950" />
                    <span>Send via WhatsApp (Free)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const url = typeof window !== "undefined" ? `${window.location.origin}/demo/car` : "https://justswifttab.com/demo/car";
                      navigator.clipboard.writeText(url);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowIntakeModal(false);
                      setIntakeSuccess(false);
                    }}
                    className="text-xs font-mono text-zinc-400 hover:text-white underline underline-offset-4"
                  >
                    Return to Shop Floor Bay Board
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIntakeSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase mb-1">
                      Customer Name
                    </label>
                    <input
                      required
                      placeholder="Alexander Wright"
                      value={intakeData.customerName}
                      onChange={(e) => setIntakeData({ ...intakeData, customerName: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase mb-1">
                      Mobile Number (For SMS)
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="(555) 019-2834"
                      value={intakeData.phone}
                      onChange={(e) => setIntakeData({ ...intakeData, phone: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase mb-1">Year</label>
                    <input
                      required
                      placeholder="2024"
                      value={intakeData.carYear}
                      onChange={(e) => setIntakeData({ ...intakeData, carYear: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase mb-1">Make</label>
                    <input
                      required
                      placeholder="Porsche"
                      value={intakeData.carBrand}
                      onChange={(e) => setIntakeData({ ...intakeData, carBrand: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase mb-1">Model</label>
                    <input
                      required
                      placeholder="911 GT3 RS"
                      value={intakeData.carModel}
                      onChange={(e) => setIntakeData({ ...intakeData, carModel: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase mb-1">Color</label>
                    <input
                      placeholder="Guards Red"
                      value={intakeData.carColor}
                      onChange={(e) => setIntakeData({ ...intakeData, carColor: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase mb-1">
                      License Plate / VIN
                    </label>
                    <input
                      required
                      placeholder="GT3-APEX"
                      value={intakeData.carLicensePlate}
                      onChange={(e) => setIntakeData({ ...intakeData, carLicensePlate: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase mb-1">
                      Target Service
                    </label>
                    <select
                      value={intakeData.servicePackage}
                      onChange={(e) => setIntakeData({ ...intakeData, servicePackage: e.target.value })}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option>Concourse 2-Stage Polish + Ceramic</option>
                      <option>Full Body XPEL Stealth PPF Wrap</option>
                      <option>Track Package PPF + Wheel Ceramic</option>
                      <option>Maintenance Wash & Graphene Topcoat</option>
                    </select>
                  </div>
                </div>

                {/* Real 4-Angle Inspection Camera & Upload */}
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-300 font-bold uppercase flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      4-Angle Pre-Inspection Photos
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">Tap angle to snap / upload</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: "front", label: "Front Bumper" },
                      { key: "driver", label: "Driver Side" },
                      { key: "rear", label: "Rear Diffuser" },
                      { key: "passenger", label: "Pass. Side" },
                    ].map((slot) => {
                      const hasPhoto = Boolean(intakePhotos[slot.key]);
                      return (
                        <div
                          key={slot.key}
                          onClick={() => fileInputRefs[slot.key]?.current?.click()}
                          className={`relative cursor-pointer group rounded-lg p-2 border text-center transition-all flex flex-col items-center justify-center min-h-[58px] ${
                            hasPhoto
                              ? "bg-emerald-950/40 border-emerald-500/70 text-emerald-300 shadow-sm"
                              : "bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700 hover:border-emerald-500/50 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            ref={fileInputRefs[slot.key]}
                            onChange={(e) => handlePhotoUpload(slot.key, e)}
                            className="hidden"
                          />
                          {hasPhoto ? (
                            <div className="flex flex-col items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-[10px] font-mono font-bold leading-tight">{slot.label} ✓</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <Upload className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 transition" />
                              <span className="text-[10px] font-mono leading-tight">{slot.label}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Digital Liability Waiver & Signature Canvas */}
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-300 font-bold uppercase flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-emerald-400" />
                      Client Pre-Inspection Waiver
                    </span>
                    {signatureData && (
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-[10px] text-zinc-400 hover:text-red-400 flex items-center gap-1 font-mono transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="relative rounded-lg border border-zinc-800 bg-zinc-950/80 overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={440}
                      height={70}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-[70px] cursor-crosshair touch-none"
                    />
                    {!signatureData && !isDrawing && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[11px] font-mono text-zinc-500">
                        ✍️ Sign waiver here with finger or mouse
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono leading-tight">
                    Clean Paint Clause: Client acknowledges pre-existing swirl marks, stone chips, and gives authorization for decon & paint correction.
                  </p>
                </div>

                {intakeError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-300 font-mono">
                    ⚠️ {intakeError}
                  </div>
                )}

                <div className="text-[11px] text-zinc-500 leading-tight">
                  By clicking Send, SwiftTab generates a legally binding pre-inspection waiver with the &quot;Clean Paint Clause&quot; and texts the client immediately.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowIntakeModal(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingIntake}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 active:scale-95 transition disabled:opacity-50"
                  >
                    <span>{isSubmittingIntake ? "Recording & Dispatching..." : "Record Intake & Dispatch"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
