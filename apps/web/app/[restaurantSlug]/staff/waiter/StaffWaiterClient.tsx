"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Bell, LogOut, CheckCircle, Car, AlertCircle, Clock, CreditCard, Check, X, Sun } from "lucide-react";
import { useNotificationSound } from "@/lib/sound";
import { useScreenWakeLock } from "@/lib/useScreenWakeLock";

export default function StaffWaiterClient({
  restaurant,
  initialTables,
  initialOrders,
  initialRequests,
}: {
  restaurant: any;
  initialTables: any[];
  initialOrders: any[];
  initialRequests: any[];
}) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [requests, setRequests] = useState<any[]>(initialRequests);
  const [activeTables, setActiveTables] = useState<any[]>(initialTables);
  const [unacknowledged, setUnacknowledged] = useState<string[]>([]);

  const { isSoundEnabled, playSound, unlockSound } = useNotificationSound();
  const { isSupported: isWakeLockSupported, isWakeLockActive, requestWakeLock } = useScreenWakeLock();
  const socketRef = useRef<Socket | null>(null);
  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Session verification & 2-hour inactivity check
  useEffect(() => {
    const rawSession = localStorage.getItem(`staff_session_${restaurant.slug}`);
    if (!rawSession) {
      router.push(`/${restaurant.slug}/staff/login`);
      return;
    }
    try {
      const parsed = JSON.parse(rawSession);
      if (parsed.role !== "WAITER" || Date.now() > parsed.expiresAt) {
        localStorage.removeItem(`staff_session_${restaurant.slug}`);
        router.push(`/${restaurant.slug}/staff/login`);
        return;
      }
      setSession(parsed);
    } catch (e) {
      router.push(`/${restaurant.slug}/staff/login`);
    }
  }, [restaurant.slug, router]);

  // 2. Persistent Sound/Vibration Repeating Alert Loop (Part 3)
  useEffect(() => {
    if (unacknowledged.length > 0 || requests.some((r) => r.status === "OPEN")) {
      if (!alertIntervalRef.current) {
        alertIntervalRef.current = setInterval(() => {
          if (isSoundEnabled) {
            void playSound("waiter");
          }
          if ("vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
        }, 3000);
      }
    } else {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
        alertIntervalRef.current = null;
      }
    }

    return () => {
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
        alertIntervalRef.current = null;
      }
    };
  }, [unacknowledged, requests, isSoundEnabled, playSound]);

  // 3. Socket.io Listeners for Waiter Surface
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    const socket = io();
    socketRef.current = socket;
    socket.emit("join_room", `waiter_${restaurant.id}`);

    socket.on("waiter_request", (data) => {
      setRequests((prev) => [data, ...prev.filter((r) => r.id !== data.id)]);

      if ("serviceWorker" in navigator && "Notification" in window && Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification("🔔 Customer Request!", {
            body: `${data.table ? `Table ${data.table.number}` : "Car Order"}: ${data.requestType}`,
            icon: "/icon.png",
            vibrate: [200, 100, 200],
            requireInteraction: true,
          } as any).catch(console.error);
        });
      }
    });

    socket.on("payment_claimed", (data) => {
      setUnacknowledged((prev) => [...new Set([...prev, data.orderId || data.tableId])]);
      refreshData();
    });

    socket.on("new_order", () => {
      refreshData();
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurant.id]);

  const refreshData = async () => {
    try {
      const res = await fetch("/api/waiter/active-state");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setActiveTables(data.tables || []);
        setRequests(data.requests || []);
      }
    } catch (e) {}
  };

  const handleSwitchUser = () => {
    localStorage.removeItem(`staff_session_${restaurant.slug}`);
    router.push(`/${restaurant.slug}/staff/login`);
  };

  const confirmPayment = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "PAID",
          processedByStaffId: session?.staffId,
          processedByStaffName: session?.staffName,
        }),
      });

      if (res.ok) {
        setUnacknowledged((prev) => prev.filter((id) => id !== orderId));
        refreshData();
      }
    } catch (e) {
      alert("Failed to confirm payment");
    }
  };

  const markSessionVacated = async (tableId: string | null, tableSessionId: string, label: string) => {
    if (!confirm(`Mark ${label} as vacated? Unpaid open tabs will be CANCELLED.`)) return;

    try {
      await fetch("/api/tables/mark-vacated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          tableSessionId,
          processedByStaffId: session?.staffId,
          processedByStaffName: session?.staffName,
        }),
      });
      refreshData();
    } catch (e) {
      alert("Failed to clear session");
    }
  };

  const resolveRequest = async (requestId: string) => {
    try {
      await fetch(`/api/waiter/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "RESOLVED",
          processedByStaffId: session?.staffId,
          processedByStaffName: session?.staffName,
        }),
      });
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (e) {
      alert("Failed to resolve request");
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* WAITER HEADER & STAFF IDENTITY BAR */}
      <header className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{restaurant.name} — Waiter Staff Panel</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-md text-xs font-bold border border-emerald-500/30">
                🔔 Active Waiter: {session.staffName}
              </span>
              <span
                onClick={() => void requestWakeLock()}
                title="Click to request wake lock"
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border cursor-pointer ${
                  isWakeLockActive
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                <Sun className={`w-3 h-3 ${isWakeLockActive ? "text-amber-400 animate-spin" : ""}`} />
                {isWakeLockActive ? "Screen Awake Lock: ACTIVE" : "Wake Lock: Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleSwitchUser}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Switch Staff
          </button>
        </div>
      </header>

      {!isSoundEnabled && (
        <div
          className="bg-blue-900/60 text-blue-200 p-3.5 rounded-xl text-center font-bold text-xs animate-pulse cursor-pointer border border-blue-500/50"
          onClick={unlockSound}
        >
          Click anywhere to enable waiter chime alerts 🔔
        </div>
      )}

      {/* CUSTOMER REQUEST ALERTS */}
      {requests.length > 0 && (
        <div className="bg-amber-950/50 border-2 border-amber-500/60 rounded-2xl p-5 space-y-3 animate-pulse">
          <h2 className="text-base font-black text-amber-300 flex items-center gap-2 uppercase tracking-wider">
            <AlertCircle className="w-5 h-5 text-amber-400" /> Pending Customer Alerts ({requests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-slate-900 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-white text-base">
                    {req.table ? `Table ${req.table.number}` : "Car Order"}
                  </div>
                  <div className="text-xs text-amber-300 font-bold">{req.requestType === "CALL_WAITER" ? "🙋 Staff Requested" : "🧾 Bill Requested"}</div>
                </div>
                <button
                  onClick={() => resolveRequest(req.id)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-black text-xs shadow transition"
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE ORDERS & PAYMENT APPROVALS */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-400" /> Active Orders & Payments ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            No active table or car orders right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {orders.map((order) => {
              const isClaimed = order.paymentStatus === "CLAIMED";
              return (
                <div
                  key={order.id}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-md ${
                    isClaimed ? "border-amber-500 bg-amber-950/20 animate-pulse" : "border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <div className="font-black text-lg text-white">
                        {order.sessionType === "CAR"
                          ? `${order.carOrderType === "TAKEAWAY" ? "🛍️ Takeaway" : "🚗 Car"} • ${order.carColor || ""} ${order.carBrand || ""}`
                          : `Table ${order.table?.number || ""}`}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Order #{order.dailyOrderNumber || order.orderNumber} • {order.customerName || "Customer"}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : isClaimed
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-red-500/20 text-red-300 border border-red-500/40"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  {/* ITEMS SUMMARY */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.nameSnapshot}
                        </span>
                        <span className="font-mono text-slate-400">₹{((item.pricePaise * item.quantity) / 100).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-black text-sm text-emerald-400 pt-2 border-t border-slate-800">
                      <span>Total</span>
                      <span>₹{(order.totalPaise / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* PAYMENT CONFIRMATION ACTIONS */}
                  <div className="pt-2">
                    {order.paymentStatus !== "PAID" && (
                      <button
                        onClick={() => confirmPayment(order.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Confirm Payment (Approve)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
