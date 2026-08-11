"use client";

import { useState, useEffect, useCallback } from "react";
import { useNotificationSound } from "@/lib/sound";
import ThermalReceiptPrint from "../components/ThermalReceiptPrint";
import { createRealtimeSocket, createReconcileGuard, bindReconcileTriggers } from "@/lib/realtime";

export default function KitchenClient({ initialOrders, restaurantId, restaurant }: { initialOrders: any[], restaurantId: string, restaurant?: any }) {
  const [orders, setOrders] = useState(initialOrders);
  const [unacknowledged, setUnacknowledged] = useState<string[]>([]);
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const { isSoundEnabled, playKitchenRinger, unlockSound } = useNotificationSound();

  const playPingSound = () => {
    void playKitchenRinger();
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/kitchen/active-orders");
      if (res.ok) {
        const data = await res.json();
        return data.orders || null;
      }
    } catch (err) {
      console.error("Failed to refresh orders");
    }
    return null;
  }, []);

  const applyOrders = useCallback((data: any) => {
    if (data) setOrders(data);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Rooms are re-joined on every connect; authoritative feed reconciles on
    // connect / visibility / online / focus / mount.
    const guard = createReconcileGuard(fetchOrders, applyOrders);
    const rt = createRealtimeSocket({
      rooms: () => [`kitchen_${restaurantId}`, `admin_${restaurantId}`],
      onReconcile: () => guard.run(),
    });

    rt.on("kitchen_new_order", ({ orderId }) => {
      playPingSound();

      // Dedupe: double delivery through overlapping rooms must not stack ids.
      setUnacknowledged(prev => Array.from(new Set([...prev, orderId])));

      // Fetch latest orders without reloading the page
      guard.run();
    });

    // Keep the kitchen board in sync with any status change or payment
    // confirmation coming from any staff/admin session.
    const handleStatus = ({ orderId, status }: { orderId: string; status: string }) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      guard.run();
    };
    rt.on("kitchen_order_status_changed", handleStatus);
    rt.on("admin_order_status_changed", handleStatus);

    rt.on("admin_payment_confirmed", () => {
      guard.run();
    });

    const unbindTriggers = bindReconcileTriggers(() => guard.run());

    return () => {
      unbindTriggers();
      rt.disconnect();
    };
  }, [restaurantId, playKitchenRinger, fetchOrders, applyOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      alert("Failed to update status");
      window.location.reload();
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "RECEIVED": return "border-blue-500 bg-blue-900/20";
      case "ACCEPTED": return "border-orange-500 bg-orange-900/20";
      case "PREPARING": return "border-yellow-500 bg-yellow-900/20";
      case "READY": return "border-green-500 bg-green-900/20";
      default: return "border-gray-500 bg-gray-900/20";
    }
  };

  const visibleOrders = orders.filter((order) => {
    if (order.sessionType === "TABLE") return true;

    // CAR orders: Round 1 must be PAID. 
    // Subsequent rounds in an active session where Round 1 was PAID are allowed on Open Tab.
    if (order.paymentStatus === "PAID") return true;

    if (order.tableSessionId) {
      const sessionOrders = orders.filter((o) => o.tableSessionId === order.tableSessionId);
      const hasPaidRound = sessionOrders.some((o) => o.paymentStatus === "PAID");
      if (hasPaidRound) return true;
    }

    return false;
  });

  if (visibleOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <h2 className="text-2xl font-bold mb-2">No Active Kitchen Orders</h2>
        <p>Waiting for customers to place orders...</p>
      </div>
    );
  }

  return (
    <>
      {!isSoundEnabled && (
        <div className="bg-blue-900 text-blue-100 p-4 rounded-xl mb-6 text-center font-bold animate-pulse cursor-pointer border border-blue-500" onClick={unlockSound}>
          Click anywhere to enable order sound alerts 🔔
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleOrders.map(order => {
          const isUnack = unacknowledged.includes(order.id);
          const cardClasses = isUnack 
            ? "border-4 border-red-500 bg-red-900/40 animate-pulse scale-105 transition-transform" 
            : `${getStatusColor(order.status)} border-2 transition-all`;

          return (
          <div key={order.id} className={`rounded-xl p-6 ${cardClasses} flex flex-col`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-black">
                {order.sessionType === "CAR"
                  ? `${order.carOrderType === "TAKEAWAY" ? "🛍️ Takeaway" : "🚗 Eat in Car"} • ${order.carColor || ""} ${order.carBrand || ""} — ${order.customerName || "Car Customer"}`
                  : `Table ${order.table?.number || ""}`}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-400">Order #{order.dailyOrderNumber || order.orderNumber}</p>
                {order.customerPhone && (
                  <span className="text-xs font-semibold text-gray-300 bg-white/10 px-2 py-0.5 rounded">
                    📞 {order.customerPhone}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
              {isUnack ? "NEW!" : order.status}
            </div>
          </div>

          <div className="flex-1 space-y-3 mb-6">
            {order.items.map((item: any) => (
              <div key={item.id} className="text-lg font-medium flex gap-3">
                <span className="text-gray-400">{item.quantity}x</span>
                <span>{item.nameSnapshot}</span>
                {item.instructions && (
                  <span className="text-yellow-400 text-sm ml-2 block italic">Note: {item.instructions}</span>
                )}
              </div>
            ))}
            {order.instructions && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-900/50 rounded-lg text-red-200 text-sm">
                <strong>Table Note:</strong> {order.instructions}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/10">
            {isUnack ? (
              <button 
                onClick={() => setUnacknowledged(prev => prev.filter(id => id !== order.id))}
                className="col-span-2 bg-red-600 hover:bg-red-500 text-white py-5 rounded-lg font-black text-2xl animate-bounce shadow-[0_0_20px_rgba(220,38,38,0.6)]"
              >
                ACKNOWLEDGE
              </button>
            ) : (
              <>
                {order.status === "RECEIVED" && (
                  <button 
                    onClick={() => updateStatus(order.id, "ACCEPTED")}
                    className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-lg font-bold text-xl transition-colors"
                  >
                    Accept Order
                  </button>
                )}
                {order.status === "ACCEPTED" && (
                  <button 
                    onClick={() => updateStatus(order.id, "PREPARING")}
                    className="col-span-2 bg-yellow-600 hover:bg-yellow-500 text-white py-4 rounded-lg font-bold text-xl transition-colors"
                  >
                    Start Preparing
                  </button>
                )}
              </>
            )}
            {order.status === "PREPARING" && (
              <button 
                onClick={() => updateStatus(order.id, "READY")}
                className="col-span-2 bg-green-600 hover:bg-green-500 text-white py-4 rounded-lg font-bold text-xl transition-colors"
              >
                Mark as Ready
              </button>
            )}
            {order.status === "READY" && (
              <button 
                onClick={() => updateStatus(order.id, "SERVED")}
                className="col-span-2 bg-green-700 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-xl transition-colors"
              >
                Mark as Served
              </button>
            )}

            <button
              onClick={() => setPrintingOrder({
                orderNumber: order.dailyOrderNumber || order.orderNumber,
                sessionType: order.sessionType,
                tableNumber: order.table?.number,
                carBrand: order.carBrand,
                carColor: order.carColor,
                carLicensePlate: order.carLicensePlate,
                customerName: order.customerName,
                createdAt: order.createdAt,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                subtotalPaise: order.subtotalPaise,
                taxPaise: order.taxPaise,
                totalPaise: order.totalPaise,
                items: order.items || []
              })}
              className="col-span-2 bg-gray-800 hover:bg-gray-700 text-gray-200 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border border-gray-700 mt-2"
            >
              🖨️ Print Kitchen / Thermal Bill
            </button>
          </div>
        </div>
        );
      })}
    </div>

    {/* THERMAL BILL PRINT MODAL */}
    {printingOrder && (
      <ThermalReceiptPrint 
        restaurant={restaurant || { name: "SwiftTab Restaurant" }} 
        order={printingOrder} 
        onClose={() => setPrintingOrder(null)} 
      />
    )}
    </>
  );
}
