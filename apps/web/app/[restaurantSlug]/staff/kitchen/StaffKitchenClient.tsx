"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, LogOut, Check, UtensilsCrossed, AlertTriangle, Bell, RefreshCw, Sun } from "lucide-react";
import { useNotificationSound } from "@/lib/sound";
import { mergeAlertIds, dropAlertIds, reconcileAlertIds } from "@/lib/orderAlert";
import { useScreenWakeLock } from "@/lib/useScreenWakeLock";
import { PushAlertsButton } from "@/components/staff/PushAlertsButton";
import RealtimeBadge from "@/components/staff/RealtimeBadge";
import { createRealtimeSocket, createReconcileGuard, bindReconcileTriggers } from "@/lib/realtime";

export default function StaffKitchenClient({
  restaurant,
  initialOrders,
}: {
  restaurant: any;
  initialOrders: any[];
}) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [unacknowledged, setUnacknowledged] = useState<string[]>(() => {
    return (initialOrders || []).filter((o: any) => o.status === "RECEIVED").map((o: any) => o.id);
  });
  const [show86Modal, setShow86Modal] = useState(false);
  const [categories, setCategories] = useState<any[]>(restaurant.categories || []);
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

  const { isSoundEnabled, playKitchenRinger, vibrate } = useNotificationSound();
  const { isSupported: isWakeLockSupported, isWakeLockActive, requestWakeLock } = useScreenWakeLock();
  const socketRef = useRef<any>(null);

  // Persistent repeating alert interval & escalation timer references
  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const escalationTimerRef = useRef<{ [orderId: string]: NodeJS.Timeout }>({});
  const acknowledgedRef = useRef<Set<string>>(new Set());

  // Orders that have left RECEIVED (acked, or advanced elsewhere) must never
  // re-trigger the alert loop on later feed refreshes.
  const markDone = (orderId: string) => {
    acknowledgedRef.current.add(orderId);
    setUnacknowledged((prev) => dropAlertIds(prev, [orderId]));
  };

  // Reconcile alert claims against the CURRENT actionable feed on every
  // successful refetch. `unacknowledged` is authoritative: an id may only
  // remain while its order is still RECEIVED in the gated KDS feed and has
  // not been acknowledged. Orders that advanced, were paid, cancelled, or got
  // gated out (unpaid CAR round 1) drop their stale alert claim here.
  const reconcileAlerts = useCallback((freshOrders: any[]) => {
    const receivedIds = freshOrders
      .filter((o: any) => o.status === "RECEIVED")
      .map((o: any) => o.id);
    const next = reconcileAlertIds(receivedIds, acknowledgedRef.current);
    setUnacknowledged((prev) => {
      if (prev.length === next.length && prev.every((id, i) => id === next[i])) {
        return prev;
      }
      return next;
    });
  }, []);

  // Authoritative reconciliation: fetch (pure) + apply (guarded). Debounced +
  // stale-guarded by the realtime module — bursts of events coalesce into ONE
  // fetch, and a late older response can never overwrite newer state.
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/staff/kitchen/active-orders?restaurantSlug=${restaurant.slug}`);
      if (res.ok) {
        const data = await res.json();
        return data.orders || null;
      }
    } catch (err) {}
    return null;
  }, [restaurant.slug]);

  const applyOrders = useCallback(
    (freshOrders: any[] | null) => {
      if (!freshOrders) return;
      setOrders(freshOrders);
      reconcileAlerts(freshOrders);
    },
    [reconcileAlerts]
  );

  const guard = useMemo(() => createReconcileGuard(fetchOrders, applyOrders), [fetchOrders, applyOrders]);

  // 1. Session verification & 2-hour inactivity check
  useEffect(() => {
    const rawSession = localStorage.getItem(`staff_session_${restaurant.slug}`);
    if (!rawSession) {
      router.push(`/${restaurant.slug}/staff/login`);
      return;
    }
    try {
      const parsed = JSON.parse(rawSession);
      if (parsed.role !== "KITCHEN" || Date.now() > parsed.expiresAt) {
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
    if (unacknowledged.length > 0) {
      if (!alertIntervalRef.current) {
        alertIntervalRef.current = setInterval(() => {
          if (isSoundEnabled) {
            // KDS alert: old mechanical telephone bell while a ticket is
            // unacknowledged. Stops on acknowledge/completion via reconcile.
            void playKitchenRinger();
          } else {
            vibrate("order");
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
  }, [unacknowledged, isSoundEnabled, playKitchenRinger, vibrate]);

  // 3. Realtime socket + reconciliation lifecycle
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    // Rooms are re-joined on EVERY connect (initial + reconnect) and the
    // authoritative feed is reconciled on connect / visibility / online /
    // focus / mount — so events missed during a temporary disconnect are
    // always recovered without a manual refresh.
    const rt = createRealtimeSocket({
      rooms: () => [`kitchen_${restaurant.id}`, `admin_${restaurant.id}`],
      onReconcile: () => guard.run(),
    });
    socketRef.current = rt.socket;

    rt.on("kitchen_new_order", ({ orderId }) => {
      setUnacknowledged((prev) => mergeAlertIds(prev, [orderId], acknowledgedRef.current));

      // Start 20-second Admin Escalation Timer
      if (!escalationTimerRef.current[orderId]) {
        escalationTimerRef.current[orderId] = setTimeout(() => {
          rt.socket.emit("admin_escalation_alert", {
            restaurantId: restaurant.id,
            orderId,
            role: "KITCHEN",
            reason: "Unacknowledged kitchen order for > 20s",
          });
        }, 20_000);
      }

      // Fetch fresh active orders for staff panel (coalesced + stale-guarded)
      guard.run();
    });

    // Keep the KDS in sync with any status change or payment confirmation
    // coming from any staff/admin session.
    const handleStatus = ({ orderId, status }: { orderId: string; status: string }) => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      if (status !== "RECEIVED") markDone(orderId);
      guard.run();
    };
    rt.on("kitchen_order_status_changed", handleStatus);
    rt.on("admin_order_status_changed", handleStatus);

    rt.on("admin_payment_confirmed", () => {
      guard.run();
    });

    // visibilitychange / online / focus / mount reconciliation (Phase 4)
    const unbindTriggers = bindReconcileTriggers(() => guard.run());

    return () => {
      unbindTriggers();
      rt.disconnect();
      Object.values(escalationTimerRef.current).forEach(clearTimeout);
    };
  }, [restaurant.id, guard]);

  const handleAcknowledge = (orderId: string) => {
    markDone(orderId);
    if (escalationTimerRef.current[orderId]) {
      clearTimeout(escalationTimerRef.current[orderId]);
      delete escalationTimerRef.current[orderId];
    }
  };

  const handleSwitchUser = () => {
    localStorage.removeItem(`staff_session_${restaurant.slug}`);
    router.push(`/${restaurant.slug}/staff/login`);
  };

  const updateStatus = async (orderId: string, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (status !== "RECEIVED") markDone(orderId);

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          processedByStaffId: session?.staffId,
          processedByStaffName: session?.staffName,
        }),
      });
    } catch (err) {
      alert("Failed to update ticket status");
    }
  };

  const toggleItemAvailability = async (itemId: string, currentAvailable: boolean) => {
    setTogglingItemId(itemId);
    try {
      const res = await fetch(`/api/admin/menu/items/${itemId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !currentAvailable }),
      });
      if (res.ok) {
        setCategories((prevCat) =>
          prevCat.map((cat) => ({
            ...cat,
            items: cat.items.map((item: any) => (item.id === itemId ? { ...item, available: !currentAvailable } : item)),
          }))
        );
      }
    } catch (e) {
      alert("Failed to toggle item availability");
    } finally {
      setTogglingItemId(null);
    }
  };

  const visibleOrders = orders.filter((order) => {
    return ["RECEIVED", "ACCEPTED", "PREPARING", "READY"].includes(order.status);
  });

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* KITCHEN HEADER & STAFF IDENTITY BAR */}
      <header className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-600/20 text-orange-400 rounded-xl flex items-center justify-center border border-orange-500/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{restaurant.name} — Kitchen Display System (KDS)</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-300 px-2.5 py-0.5 rounded-md text-xs font-bold border border-orange-500/30">
                👨‍🍳 Active Chef: {session.staffName}
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
          <RealtimeBadge socket={socketRef.current} />
          <PushAlertsButton restaurantSlug={restaurant.slug} role="KITCHEN" />
          <button
            onClick={() => setShow86Modal(true)}
            className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" /> 86 Item Availability
          </button>
          <button
            onClick={handleSwitchUser}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Switch Staff
          </button>
        </div>
      </header>

      {visibleOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/80">
          <ChefHat className="w-12 h-12 mb-3 text-slate-600 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-300">No Active Kitchen Orders</h2>
          <p className="text-xs text-slate-500 mt-1">New customer orders will appear here automatically with audio alert</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleOrders.map((order) => {
            const isUnack = unacknowledged.includes(order.id);
            const cardClasses = isUnack
              ? "border-4 border-red-500 bg-red-950/60 animate-pulse scale-[1.02] shadow-[0_0_30px_rgba(239,68,68,0.4)]"
              : "border-2 border-slate-800 bg-slate-900";

            return (
              <div key={order.id} className={`rounded-2xl p-6 ${cardClasses} flex flex-col transition-all space-y-4`}>
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {order.sessionType === "CAR"
                        ? `${order.carOrderType === "TAKEAWAY" ? "🛍️ Takeaway" : "🚗 Eat in Car"} • ${order.carColor || ""} ${order.carBrand || ""} — ${order.customerName || "Car Customer"}`
                        : `Table ${order.table?.number || ""}`}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Order #{order.dailyOrderNumber || order.orderNumber}</p>
                  </div>
                  <div className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-black uppercase">
                    {isUnack ? "NEW!" : order.status}
                  </div>
                </div>

                {/* ITEMS LIST */}
                <div className="flex-1 space-y-2.5">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="text-base font-bold text-slate-200 flex justify-between items-start border-b border-slate-800/40 pb-2">
                      <span className="flex items-center gap-2">
                        <span className="text-orange-400 font-mono text-lg">{item.quantity}x</span>
                        <span>{item.nameSnapshot}</span>
                      </span>
                      {item.instructions && <span className="text-xs text-amber-400 italic block">Note: {item.instructions}</span>}
                    </div>
                  ))}
                  {order.instructions && (
                    <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-xs font-semibold">
                      <strong>Special Note:</strong> {order.instructions}
                    </div>
                  )}
                </div>

                {/* ACKNOWLEDGE BUTTON OR STATUS PROGRESSION */}
                <div className="pt-2 border-t border-slate-800">
                  {isUnack ? (
                    <button
                      onClick={() => handleAcknowledge(order.id)}
                      className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 animate-bounce"
                    >
                      <Bell className="w-5 h-5" /> ACKNOWLEDGE TICKET
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {order.status === "RECEIVED" && (
                        <button
                          onClick={() => updateStatus(order.id, "PREPARING")}
                          className="col-span-2 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold text-xs shadow transition"
                        >
                          Start Preparing 🍳
                        </button>
                      )}
                      {order.status === "PREPARING" && (
                        <button
                          onClick={() => updateStatus(order.id, "READY")}
                          className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow transition"
                        >
                          Mark Ready for Serving 🔔
                        </button>
                      )}
                      {order.status === "READY" && (
                        <button
                          onClick={() => updateStatus(order.id, "SERVED")}
                          className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-xs shadow transition"
                        >
                          Mark Served ✅
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAST 86 ITEM AVAILABILITY MODAL */}
      {show86Modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black">Kitchen 86 / Stock Availability Toggle</h3>
              </div>
              <button onClick={() => setShow86Modal(false)} className="text-slate-400 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">Toggle items off immediately when ingredients run out during service.</p>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {categories.map((cat: any) => (
                <div key={cat.id} className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider bg-slate-800/80 px-3 py-1.5 rounded-lg">
                    {cat.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          item.available ? "bg-slate-800/50 border-slate-700" : "bg-red-950/40 border-red-900/60"
                        }`}
                      >
                        <span className="text-xs font-bold">{item.name}</span>
                        <button
                          onClick={() => toggleItemAvailability(item.id, item.available)}
                          disabled={togglingItemId === item.id}
                          className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                            item.available ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"
                          }`}
                        >
                          {togglingItemId === item.id ? "..." : item.available ? "AVAILABLE" : "86'D (OFF)"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button onClick={() => setShow86Modal(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
