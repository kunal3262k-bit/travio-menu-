"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useNotificationSound } from "@/lib/sound";
import ThermalReceiptPrint from "../components/ThermalReceiptPrint";

export default function WaiterClient({ 
  initialRequests, 
  initialReadyOrders, 
  initialPendingPayments,
  initialActiveTables = [],
  staleTableMinutes = 45,
  restaurantId,
  restaurant
}: { 
  initialRequests: any[], 
  initialReadyOrders: any[],
  initialPendingPayments?: any[],
  initialActiveTables?: any[],
  staleTableMinutes?: number,
  restaurantId: string,
  restaurant?: any
}) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [readyOrders, setReadyOrders] = useState(initialReadyOrders);
  const [pendingPayments, setPendingPayments] = useState(initialPendingPayments || []);
  const [activeTables, setActiveTables] = useState(initialActiveTables);
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isSoundEnabled, playSound, unlockSound } = useNotificationSound();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const socket = io();
    socket.emit("join_room", `waiter_${restaurantId}`);

    const triggerNotification = (title: string, body: string) => {
      if ("serviceWorker" in navigator && "Notification" in window && Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon: "/icon.png",
            vibrate: [200, 100, 200, 100, 400],
            silent: false,
            requireInteraction: true
          } as any).catch(console.error);
        });
      }
    };

    socket.on("waiter_order_status", () => {
      router.refresh();
      void playSound("order");
      triggerNotification("Order Ready!", "An order is ready to serve.");
    });
    
    socket.on("waiter_bill_requested", () => {
      router.refresh();
      void playSound("payment");
      triggerNotification("Bill Requested", "A table has requested their bill.");
    });

    socket.on("waiter_called", () => {
      router.refresh();
      void playSound("waiter");
      triggerNotification("Waiter Called", "A customer is requesting assistance.");
    });

    socket.on("payment_claimed", () => {
      router.refresh();
      void playSound("payment");
      triggerNotification("Payment Claimed", "A customer has submitted a payment claim.");
    });

    socket.on("cash_requested", () => {
      router.refresh();
      void playSound("payment");
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId, router, playSound]);

  const resolveRequest = async (id: string, type: string, tableId: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    
    if (type === "REQUEST_BILL") {
      const socket = io();
      socket.emit("bill_confirmed", { tableId, restaurantId });
      
      // Auto-close all open orders for this table when bill is generated
      await fetch(`/api/tables/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId })
      });
    }

    await fetch(`/api/waiter-requests`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, status: "RESOLVED" })
    });
  };

  const markOrderServed = async (orderId: string) => {
    setReadyOrders(prev => prev.filter(o => o.id !== orderId));
    const socket = io();
    socket.emit("order_status_updated", { orderId, status: "SERVED", restaurantId });
    
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SERVED" })
    });
  };

  const confirmPayment = async (tableId: string, orderIds: string[], method: string) => {
    setPendingPayments(prev => prev.filter(p => p.tableId !== tableId));
    
    try {
      await fetch("/api/orders/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds })
      });
      
      const socket = io();
      socket.emit("payment_confirmed", { tableId, restaurantId });
    } catch (e) {
      alert("Failed to confirm payment");
    }
  };

  const markSessionVacated = async (tableId: string | null, tableSessionId: string, label: string) => {
    if (!confirm(`Are you sure you want to mark ${label} as vacated/departed? Any unpaid orders will be CANCELLED.`)) return;
    
    if (tableId) {
      setActiveTables(prev => prev.filter(t => t.id !== tableId));
    }
    
    try {
      await fetch("/api/tables/mark-vacated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, tableSessionId })
      });
      router.refresh();
    } catch (e) {
      alert("Failed to clear session");
    }
  };

  return (
    <div className="space-y-8">
      {!isSoundEnabled && (
        <div 
          className="bg-orange-600 text-white p-4 rounded-xl text-center font-bold animate-pulse cursor-pointer shadow-md flex items-center justify-center gap-2"
          onClick={unlockSound}
        >
          <span>🔔 Tap here to enable live sound alerts for orders & waiter calls!</span>
        </div>
      )}
      {/* Pending Payments Section */}
      {pendingPayments.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
            Pending Payments
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{pendingPayments.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingPayments.map((payment: any) => (
              <div key={payment.tableId} className="bg-white border-2 border-blue-500 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-black">{String(payment.tableNumber).startsWith("Table") || String(payment.tableNumber).startsWith("🚗") ? payment.tableNumber : `Table ${payment.tableNumber}`}</h3>
                    <span className="text-xl font-black text-blue-600">₹{(payment.totalPaise / 100).toFixed(2)}</span>
                  </div>
                  <div className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Claims {payment.method} Payment
                  </div>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => confirmPayment(payment.tableId, payment.orderIds, payment.method)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-bold text-sm shadow"
                  >
                    Approve Payment
                  </button>
                  <button 
                    onClick={() => setPrintingOrder(payment)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border"
                  >
                    🖨️ Print Thermal Bill
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ready Orders */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
          Ready to Serve 
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{readyOrders.length}</span>
        </h2>
        {readyOrders.length === 0 ? (
          <p className="text-gray-500 italic">No orders waiting to be served.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyOrders.map(order => (
              <div key={order.id} className="bg-white border-2 border-green-500 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {order.sessionType === "CAR"
                        ? `🚗 ${order.carColor || ""} ${order.carBrand || ""} — ${order.customerName || "Car Customer"}`
                        : `Table ${order.table?.number || ""}`}
                    </h3>
                    {order.carLicensePlate && (
                      <p className="text-xs font-bold text-gray-400 uppercase">Plate: {order.carLicensePlate}</p>
                    )}
                  </div>
                  <span className="text-sm font-black bg-slate-100 text-slate-700 px-2 py-1 rounded">
                    Order #{order.dailyOrderNumber || order.orderNumber}
                  </span>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => markOrderServed(order.id)}
                    className="w-full bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-lg font-bold text-sm shadow"
                  >
                    Mark Served
                  </button>
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
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border"
                  >
                    🖨️ Print Thermal Bill
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE TABLES (STALE DETECTION) */}
      {activeTables.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-700 flex items-center gap-2">
            Active Tables
            <span className="bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded-full">{activeTables.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeTables.map(table => {
              const lastActivity = table.lastActivityAt ? new Date(table.lastActivityAt) : null;
              let minsActive = 0;
              if (lastActivity) {
                minsActive = Math.floor((currentTime.getTime() - lastActivity.getTime()) / 60000);
              }
              const isStale = minsActive >= staleTableMinutes;

              return (
                <div key={table.id} className={`bg-white border-2 rounded-xl p-4 shadow-sm flex flex-col justify-between ${isStale ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-black text-slate-900">Table {table.number}</h3>
                      {isStale && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-1 rounded">Stale</span>
                      )}
                    </div>
                    {lastActivity && (
                      <p className={`text-sm font-medium ${isStale ? "text-amber-700" : "text-slate-500"}`}>
                        Active for: {Math.floor(minsActive / 60)}h {minsActive % 60}m
                      </p>
                    )}
                    {table.hasUnpaid && (
                      <p className="text-xs font-bold text-red-500 mt-1 uppercase">Has Unpaid Items</p>
                    )}
                  </div>
                  
                  {isStale && (
                    <div className="mt-4">
                      <button 
                        onClick={() => markSessionVacated(table.id, table.currentSessionId, `Table ${table.number}`)}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-lg font-bold text-xs shadow transition-colors"
                      >
                        Clear Table (Abandoned)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* THERMAL BILL PRINT MODAL */}
      {printingOrder && (
        <ThermalReceiptPrint 
          restaurant={restaurant || { name: "SwiftTab Restaurant" }} 
          order={printingOrder} 
          onClose={() => setPrintingOrder(null)} 
        />
      )}

      {/* Action Requests */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-orange-700 flex items-center gap-2">
          Customer Requests
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{requests.length}</span>
        </h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 italic">No active requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map(req => (
              <div key={req.id} className={`bg-white border-2 rounded-xl p-4 shadow-sm ${req.type === "REQUEST_BILL" ? "border-blue-500" : "border-orange-500"}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black">Table {req.table.number}</h3>
                </div>
                <div className="mb-4 text-lg font-medium">
                  {req.type === "REQUEST_BILL" ? "💰 Bill Requested" : "🛎️ Call Waiter"}
                </div>
                <button 
                  onClick={() => resolveRequest(req.id, req.type, req.table.id)}
                  className={`w-full py-3 rounded-lg font-bold text-white ${req.type === "REQUEST_BILL" ? "bg-blue-600 hover:bg-blue-500" : "bg-orange-600 hover:bg-orange-500"}`}
                >
                  {req.type === "REQUEST_BILL" ? "Confirm & Settle" : "Mark Resolved"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
