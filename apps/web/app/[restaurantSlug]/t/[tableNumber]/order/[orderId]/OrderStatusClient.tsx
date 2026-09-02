"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotificationSound } from "@/lib/sound";
import { createRealtimeSocket } from "@/lib/realtime";

export default function OrderStatusClient({ order }: { order: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [isRequestingBill, setIsRequestingBill] = useState(false);
  const [billRequested, setBillRequested] = useState(false);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const { isSoundEnabled, playSound, unlockSound } = useNotificationSound();

  const handleCallWaiter = async () => {
    setIsCallingWaiter(true);
    try {
      await fetch("/api/waiter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: order.restaurant.slug,
          tableNumber: order.table.number,
          type: "CALL_WAITER"
        })
      });
      
      void playSound("waiter");
      
      setWaiterCalled(true);
      setTimeout(() => setWaiterCalled(false), 30000);
    } catch (err) {
      alert("Failed to call waiter. Please try again.");
    } finally {
      setIsCallingWaiter(false);
    }
  };

  useEffect(() => {
    // Room is re-joined on every (re)connect so a temporary socket drop can
    // never permanently freeze the customer's live status tracker.
    const rt = createRealtimeSocket({
      rooms: () => [`order_${order.id}`],
      onReconcile: () => {},
    });

    rt.on("order_status_changed", (data) => {
      if (data.orderId === order.id) {
        setStatus(data.status);
        void playSound("status");
      }
    });

    return () => {
      rt.disconnect();
    };
  }, [order.id, playSound]);

  const requestBill = async () => {
    setIsRequestingBill(true);
    try {
      await fetch("/api/waiter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: order.restaurant.slug,
          tableNumber: order.table.number,
          type: "REQUEST_BILL"
        })
      });
      void playSound("payment");
      setBillRequested(true);
    } catch (e) {
      alert("Failed to request bill. Please try again.");
    } finally {
      setIsRequestingBill(false);
    }

    // Navigate to the payment screen when the customer wants to pay.
    router.push(`/${order.restaurant.slug}/t/${order.table.number}/payment`);
  };

  const getStatusBadge = () => {
    switch(status) {
      case "RECEIVED": return { text: "Order Received", sub: "Kitchen is reviewing your order", step: 1, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
      case "ACCEPTED": return { text: "Chef Accepted", sub: "Kitchen has queued your dishes", step: 1, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" };
      case "PREPARING": return { text: "Cooking in Kitchen", sub: "Your dishes are sizzling fresh 🔥", step: 2, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
      case "READY": return { text: "Ready for Service", sub: "Food is plated & waiter is bringing it 🔔", step: 3, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
      case "SERVED": return { text: "Served at Table", sub: "Enjoy your artisanal meal! 🍽️", step: 4, color: "text-emerald-300 bg-emerald-500/20 border-emerald-400/40" };
      case "COMPLETED": return { text: "Order Complete", sub: "Thank you for dining with us!", step: 4, color: "text-slate-300 bg-slate-800 border-slate-700" };
      default: return { text: "Processing...", sub: "Updating live kitchen status", step: 1, color: "text-slate-400 bg-slate-800 border-slate-700" };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-[#070D0B] text-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-emerald-500/20 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          TABLE {order.table.number} · ORDER #{order.dailyOrderNumber || order.orderNumber}
        </div>
        <h2 className="text-2xl font-black text-white">{badge.text}</h2>
        <p className="text-xs text-slate-400">{badge.sub}</p>

        {!isSoundEnabled && (
          <button
            onClick={unlockSound}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 transition-colors"
          >
            🔔 Enable kitchen status sounds
          </button>
        )}
      </div>

      {/* 4-Step Live Visual Stepper */}
      <div className="grid grid-cols-4 gap-2 pt-2 pb-2">
        {[
          { label: "Received", step: 1 },
          { label: "Cooking", step: 2 },
          { label: "Ready", step: 3 },
          { label: "Served", step: 4 },
        ].map(({ label, step }) => {
          const isDone = badge.step >= step;
          return (
            <div key={label} className="text-center space-y-1.5">
              <div className={`h-2 rounded-full transition-all duration-500 ${isDone ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/50" : "bg-slate-800"}`} />
              <span className={`text-[10px] font-bold block ${isDone ? "text-emerald-300 font-mono" : "text-slate-600"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Item Summary */}
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dishes Ordered</h4>
        <div className="space-y-2">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="text-slate-200">
                <span className="font-bold text-emerald-400 font-mono">{item.quantity}x</span> {item.nameSnapshot}
              </div>
              <div className="text-slate-400 font-mono font-medium">₹{((item.pricePaise * item.quantity) / 100).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-black text-base pt-3 border-t border-slate-800 text-white">
          <span>Subtotal</span>
          <span className="text-emerald-400 font-mono">₹{(order.subtotalPaise / 100).toFixed(2)}</span>
        </div>
      </div>

      <div className="pt-2 space-y-3">
        <button 
          onClick={() => router.push(`/${order.restaurant.slug}/t/${order.table.number}`)}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
        >
          <span>➕ Add More Items (Round 2)</span>
        </button>

        <div className="flex gap-3">
          <button 
            onClick={handleCallWaiter}
            disabled={isCallingWaiter || waiterCalled}
            className="w-1/2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 py-3 rounded-2xl font-bold text-xs disabled:opacity-50 transition-all"
          >
            {waiterCalled ? "Waiter Notified" : "Call Waiter 🛎️"}
          </button>
          
          <button 
            onClick={requestBill}
            disabled={isRequestingBill || billRequested}
            className="w-1/2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 py-3 rounded-2xl font-bold text-xs disabled:opacity-50 transition-all"
          >
            {billRequested ? "Bill Requested" : "Pay & Settle 🧾"}
          </button>
        </div>
      </div>
    </div>
  );
}
