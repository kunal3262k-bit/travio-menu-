"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChefHat,
  Clock3,
  LayoutDashboard,
  Play,
  QrCode,
  RotateCcw,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { demoRestaurant } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";

const demoSteps = [
  {
    id: "scan",
    label: "QR scan",
    title: "Customer lands on the right table",
    detail: "Table 12 opens ABC Cafe with no login and no waiter dependency."
  },
  {
    id: "cart",
    label: "Smart cart",
    title: "Upsell suggestions increase order value",
    detail: "Paneer Burger triggers Masala Fries and Cold Coffee recommendations."
  },
  {
    id: "kitchen",
    label: "Kitchen alert",
    title: "Order appears instantly for preparation",
    detail: "The kitchen sees table, items, instructions, and timestamp in a tablet layout."
  },
  {
    id: "admin",
    label: "Admin proof",
    title: "Restaurant owner sees revenue movement",
    detail: "Dashboard updates orders, revenue, average order value, and popular items."
  }
] as const;

const statusFlow = ["Received", "Accepted", "Preparing", "Ready", "Served"] as const;

export function DemoMode() {
  const [activeStep, setActiveStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const selectedItems = [
    demoRestaurant.categories[0].items[0],
    demoRestaurant.categories[1].items[0],
    demoRestaurant.categories[2].items[0]
  ];
  const subtotal = selectedItems.reduce((total, item) => total + item.pricePaise, 0);
  const currentStep = demoSteps[activeStep];

  const metrics = useMemo(
    () => [
      { label: "Demo order", value: orderPlaced ? "#1043" : "Ready" },
      { label: "Table", value: "12" },
      { label: "Upsell lift", value: "+58%" },
      { label: "Wait estimate", value: "18 min" }
    ],
    [orderPlaced]
  );

  useEffect(() => {
    if (runId === 0) return;

    const timers = [
      window.setTimeout(() => {
        setOrderPlaced(true);
        setActiveStep(1);
        setStatusIndex(1);
      }, 300),
      window.setTimeout(() => {
        setActiveStep(2);
        setStatusIndex(2);
      }, 1300),
      window.setTimeout(() => {
        setActiveStep(2);
        setStatusIndex(3);
      }, 2300),
      window.setTimeout(() => {
        setActiveStep(3);
        setStatusIndex(4);
      }, 3300)
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [runId]);

  function playDemo() {
    setActiveStep(0);
    setOrderPlaced(false);
    setStatusIndex(0);
    setRunId((current) => current + 1);
  }

  function resetDemo() {
    setActiveStep(0);
    setOrderPlaced(false);
    setStatusIndex(0);
  }

  return (
    <main className="min-h-svh bg-[#f8f4ed] text-stone-950">
      <header className="sticky top-0 z-30 border-b border-stone-300/80 bg-[#f8f4ed]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="focus-ring rounded-md text-sm font-semibold tracking-wide text-emerald-900">
            SwiftTab
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={resetDemo}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={playDemo}>
              <Play className="h-4 w-4" />
              Run demo
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(12,10,8,0.76), rgba(12,10,8,0.34), rgba(248,244,237,0.92)), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=80')"
          }}
        />
        <div className="relative mx-auto grid min-h-[calc(100svh-65px)] max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-xl text-white">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">Client demo mode</p>
            <h1 className="text-5xl font-semibold leading-[1.02] sm:text-7xl">Show the full order journey in one screen.</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-stone-100">
              Walk a restaurant owner from QR scan to kitchen preparation and admin revenue proof without seeding a database.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={playDemo}>
                <Play className="h-4 w-4" />
                Start full walkthrough
              </Button>
              <Link
                href="/menu/abc-cafe/12"
                className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-stone-100"
              >
                Open live menu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <section className="rounded-lg border border-white/40 bg-white/95 p-4 shadow-xl">
              <div className="grid gap-3 sm:grid-cols-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="border-b border-stone-200 pb-3 sm:border-b-0 sm:border-r sm:pr-3 last:border-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{metric.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{metric.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <DemoPhone selectedItems={selectedItems} subtotal={subtotal} orderPlaced={orderPlaced} />
              <DemoOperations activeStep={activeStep} statusIndex={statusIndex} />
            </section>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-2">
          {demoSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(index)}
              className={`focus-ring w-full rounded-lg border px-4 py-3 text-left transition ${
                activeStep === index ? "border-emerald-800 bg-white" : "border-stone-300 bg-transparent hover:bg-white/70"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">{step.label}</p>
              <p className="mt-1 font-semibold">{step.title}</p>
            </button>
          ))}
        </aside>
        <div className="rounded-lg border border-stone-300 bg-white p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">{currentStep.label}</p>
          <h2 className="mt-2 text-3xl font-semibold">{currentStep.title}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-stone-700">{currentStep.detail}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <ProofPoint icon={QrCode} label="No app install" detail="QR opens a table-specific URL." />
            <ProofPoint icon={ChefHat} label="Kitchen-ready" detail="Orders include item notes and status." />
            <ProofPoint icon={LayoutDashboard} label="Owner view" detail="Revenue and popular items are visible." />
          </div>
        </div>
      </section>
    </main>
  );
}

function DemoPhone({
  selectedItems,
  subtotal,
  orderPlaced
}: {
  selectedItems: typeof demoRestaurant.categories[number]["items"];
  subtotal: number;
  orderPlaced: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[360px] rounded-[2rem] border-[10px] border-stone-950 bg-[#f8f4ed] p-3 shadow-2xl">
      <div className="rounded-[1.35rem] bg-[#f8f4ed]">
        <div className="flex items-center justify-between border-b border-stone-300 px-2 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Table 12</p>
            <h2 className="text-xl font-semibold">ABC Cafe</h2>
          </div>
          <QrCode className="h-6 w-6 text-stone-700" />
        </div>
        <div className="space-y-3 py-3">
          {selectedItems.map((item) => (
            <div key={item.id} className="grid grid-cols-[64px_1fr] gap-3 rounded-lg bg-white p-2">
              <div className="relative h-16 overflow-hidden rounded-md bg-stone-200">
                <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="mt-1 text-xs text-stone-600">{formatMoney(item.pricePaise)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-stone-950 p-3 text-white">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingBag className="h-4 w-4" />
              Demo cart
            </span>
            <span className="font-semibold">{formatMoney(subtotal)}</span>
          </div>
          <div className="mt-3 rounded-md bg-emerald-500/20 px-3 py-2 text-sm text-emerald-100">
            <Sparkles className="mr-1 inline h-4 w-4" />
            Cold Coffee added from upsell
          </div>
          <div className="mt-3 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-stone-950">
            {orderPlaced ? "Order #1043 sent" : "Place order"}
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoOperations({ activeStep, statusIndex }: { activeStep: number; statusIndex: number }) {
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-stone-300 bg-stone-950 p-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <ChefHat className="h-5 w-5 text-emerald-300" />
            Kitchen
          </h2>
          <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs font-semibold">
            <Bell className="h-3.5 w-3.5 text-emerald-300" />
            Sound alert
          </span>
        </div>
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-stone-300">Order #1043</p>
              <p className="text-2xl font-semibold">Table 12</p>
            </div>
            <span className="rounded-md bg-amber-300 px-2 py-1 text-xs font-semibold text-stone-950">{statusFlow[statusIndex]}</span>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p>1 x Paneer Burger <span className="text-amber-200">Less spicy</span></p>
            <p>1 x Masala Fries <span className="text-amber-200">Extra crisp</span></p>
            <p>1 x Cold Coffee</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-stone-300 bg-white p-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <LayoutDashboard className="h-5 w-5 text-emerald-800" />
          Admin snapshot
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <MiniMetric label="Revenue" value={activeStep >= 3 ? "₹1,985" : "₹1,558"} />
          <MiniMetric label="Orders" value={activeStep >= 3 ? "87" : "86"} />
          <MiniMetric label="AOV" value={activeStep >= 3 ? "₹228" : "₹214"} />
        </div>
        <div className="mt-4 space-y-2">
          {statusFlow.map((status, index) => (
            <div key={status} className="flex items-center gap-3 text-sm">
              {index <= statusIndex ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <Clock3 className="h-4 w-4 text-stone-400" />}
              <span className={index <= statusIndex ? "font-semibold text-stone-950" : "text-stone-500"}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-100 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ProofPoint({
  icon: Icon,
  label,
  detail
}: {
  icon: typeof QrCode;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg bg-stone-100 p-4">
      <Icon className="h-5 w-5 text-emerald-800" />
      <p className="mt-3 font-semibold">{label}</p>
      <p className="mt-1 text-sm leading-6 text-stone-600">{detail}</p>
    </div>
  );
}
