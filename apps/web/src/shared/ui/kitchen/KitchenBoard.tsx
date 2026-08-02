"use client";

import { useState } from "react";
import { BellRing, CheckCircle2, ChefHat, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoOrders } from "@/lib/demo-data";

const statuses = ["RECEIVED", "ACCEPTED", "PREPARING", "READY", "COMPLETED"] as const;

export function KitchenBoard() {
  const [orders, setOrders] = useState(demoOrders);

  function advance(orderId: string) {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const index = statuses.indexOf(order.status as (typeof statuses)[number]);
        return { ...order, status: statuses[Math.min(index + 1, statuses.length - 1)] };
      })
    );
  }

  return (
    <main className="min-h-svh bg-stone-950 text-white">
      <header className="border-b border-white/10 px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Kitchen Display</p>
            <h1 className="text-3xl font-semibold">Incoming Orders</h1>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm">
            <BellRing className="h-4 w-4 text-emerald-300" />
            Sound on
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-300">Order #{order.orderNumber}</p>
                <h2 className="mt-1 text-3xl font-semibold">Table {order.table}</h2>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-stone-300">
              <Clock3 className="h-4 w-4" />
              {order.createdAt}
            </div>
            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.name}`} className="border-t border-white/10 pt-4">
                  <div className="flex justify-between gap-3 text-lg font-semibold">
                    <span>{item.quantity} x {item.name}</span>
                  </div>
                  {item.instructions && <p className="mt-1 text-sm text-amber-200">{item.instructions}</p>}
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => advance(order.id)}>
                <ChefHat className="h-4 w-4" />
                Next
              </Button>
              <Button variant="primary" onClick={() => setOrders((current) => current.filter((item) => item.id !== order.id))}>
                <CheckCircle2 className="h-4 w-4" />
                Done
              </Button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "READY" ? "bg-emerald-300 text-stone-950" : status === "RECEIVED" ? "bg-amber-300 text-stone-950" : "bg-white/10 text-white";
  return <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}
