"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNotificationSound } from "@/lib/sound";
import { createRealtimeSocket } from "@/lib/realtime";

export default function PaymentClient({ 
  restaurant, 
  table, 
  orders, 
  subtotal, 
  gstAmount, 
  grandTotal,
  orderIds
}: any) {
  const router = useRouter();
  const [paymentState, setPaymentState] = useState<"SELECTING" | "CASH_REQUESTED" | "UPI_CLAIMED" | "PAID">("SELECTING");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeOrders, setActiveOrders] = useState(orders);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [invoiceInfo, setInvoiceInfo] = useState<{ orderId: string; invoiceNumber: number } | null>(null);
  const { isSoundEnabled, playCustomerHotelChime, playStatusChime, unlockSound } = useNotificationSound();
  
  const settings = restaurant.settings || {};
  // As per user request, we use text for UPI instead of a static QR for the demo, 
  // but if upiQrUrl exists, we can still show it.
  const hasUpiQr = !!settings.upiQrUrl;

  // The first order of this session carries the tableSessionId — the same
  // session proof the invoice endpoint requires (unguessable UUID, possession
  // of it is possession of the table's own bill).
  const sessionToken =
    (Array.isArray(orders) && orders[0]?.tableSessionId) || "";

  // Latest rooms (table + per-order) via a ref so the socket effect stays
  // mounted once — previously the socket was torn down on EVERY status change.
  const activeOrdersRef = useRef(orders);
  activeOrdersRef.current = activeOrders;

  useEffect(() => {
    // Rooms are re-joined on every connect — the customer screen survives
    // temporary socket drops without losing payment confirmation.
    const rt = createRealtimeSocket({
      rooms: () => [`table_${table.id}`, ...activeOrdersRef.current.map((order: any) => `order_${order.id}`)],
      onReconcile: () => {},
    });

    // Waiter confirms payment is received
    rt.on("payment_confirmed", (data) => {
      void playCustomerHotelChime();
      if (data?.invoiceNumber && data?.orderId) {
        setInvoiceInfo({ orderId: data.orderId, invoiceNumber: data.invoiceNumber });
      }
      setPaymentState("PAID");
      setTimeout(() => {
        router.push(`/${restaurant.slug}/t/${table.number}/review`);
      }, 4000);
    });

    rt.on("order_status_changed", (data) => {
      setActiveOrders((current: any[]) =>
        current.map((order: any) => (order.id === data.orderId ? { ...order, status: data.status } : order))
      );
      void playStatusChime();
    });

    return () => {
      rt.disconnect();
    };
  }, [table.id, restaurant.slug, table.number, router, playCustomerHotelChime, playStatusChime]);

  const handleCallWaiter = async () => {
    setIsCallingWaiter(true);
    try {
      await fetch("/api/waiter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant.slug,
          tableNumber: table.number,
          type: "CALL_WAITER"
        })
      });

      // Customer-side: ONE premium hotel chime, never looped.
      void playCustomerHotelChime();
      setWaiterCalled(true);
      setTimeout(() => setWaiterCalled(false), 30000);
    } catch (e) {
      alert("Failed to call waiter. Please try again.");
    } finally {
      setIsCallingWaiter(false);
    }
  };

  const handleAction = async () => {
    if (!paymentMethod) return;
    setIsProcessing(true);
    
    try {
      if (paymentMethod === "UPI") {
        // Mark orders as CLAIMED — the server broadcasts payment_claimed to the waiter panel.
        await fetch("/api/orders/claim-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIds, method: "UPI" })
        });
        
        void playCustomerHotelChime();
        
        setPaymentState("UPI_CLAIMED");
      } else if (paymentMethod === "CASH") {
        // Mark orders as CLAIMED with CASH method — same as UPI.
        // Without this, orders stay UNPAID and never appear on the waiter's panel.
        await fetch("/api/orders/claim-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIds, method: "CASH" })
        });

        void playCustomerHotelChime();

        setPaymentState("CASH_REQUESTED");
      }
    } catch (e) {
      alert("Action failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return { text: "Received 📥", color: "bg-blue-100 text-blue-800 border-blue-300", step: 1 };
      case "ACCEPTED":
        return { text: "Accepted 👨‍🍳", color: "bg-blue-100 text-blue-800 border-blue-300", step: 1 };
      case "PREPARING":
        return { text: "Preparing 🔥", color: "bg-amber-100 text-amber-800 border-amber-300", step: 2 };
      case "READY":
        return { text: "Ready to Serve ✅", color: "bg-green-100 text-green-800 border-green-300", step: 3 };
      case "SERVED":
        return { text: "Served 🍽️", color: "bg-emerald-100 text-emerald-800 border-emerald-300", step: 4 };
      default:
        return { text: status, color: "bg-gray-100 text-gray-800 border-gray-300", step: 1 };
    }
  };

  const formatPrice = (p: number) => `₹${(p / 100).toFixed(2)}`;

  if (paymentState === "PAID") {
    const invoiceHref = invoiceInfo
      ? `/api/orders/${invoiceInfo.orderId}/invoice?session=${encodeURIComponent(sessionToken)}`
      : null;
    return (
      <div className="max-w-md mx-auto text-center space-y-6 pt-20">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
        <h2 className="text-2xl font-bold">Payment Successful!</h2>
        {invoiceInfo ? (
          <div className="space-y-3">
            <p className="text-gray-500">
              Invoice <span className="font-black text-gray-800">#{invoiceInfo.invoiceNumber}</span>
            </p>
            {invoiceHref && (
              <a
                href={invoiceHref}
                download
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow"
              >
                Download Invoice PDF
              </a>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Redirecting you to feedback...</p>
        )}
      </div>
    );
  }

  if (paymentState === "UPI_CLAIMED") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        <h2 className="text-2xl font-bold">Verifying Payment...</h2>
        <p className="text-gray-500">Your waiter has been notified and is confirming the UPI transfer. This will only take a moment.</p>
      </div>
    );
  }

  if (paymentState === "CASH_REQUESTED") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 pt-20">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-3xl">💵</div>
        <h2 className="text-2xl font-bold">Waiter Called</h2>
        <p className="text-gray-500">Your waiter is on their way to your table to collect {formatPrice(grandTotal)} in cash.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Sound enablement banner */}
      {!isSoundEnabled && (
        <div 
          onClick={unlockSound}
          className="bg-emerald-600 text-white p-3 rounded-xl text-center text-xs font-bold animate-pulse cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          <span>🔔 Tap here to enable sound notifications for your order status!</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">{restaurant.name}</h1>
          <p className="text-xs text-gray-500 font-semibold">Table {table.number}</p>
          {restaurant.gstNumber && (
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">GSTIN: {restaurant.gstNumber}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/${restaurant.slug}/t/${table.number}`)}
            className="bg-stone-100 hover:bg-stone-200 text-stone-900 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            ➕ Add Items
          </button>
          <button
            onClick={handleCallWaiter}
            disabled={isCallingWaiter || waiterCalled}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-colors"
          >
            {waiterCalled ? "Notified 🛎️" : "Call Waiter 🛎️"}
          </button>
        </div>
      </div>

      {/* Live Order Status Tracking Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border space-y-5">
        <h2 className="font-black text-xl border-b pb-3 flex items-center gap-2">
          <span>Live Order Tracker</span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
        </h2>

        {activeOrders.map((order: any) => {
          const badge = getStatusBadge(order.status);
          return (
            <div key={order.id} className="bg-stone-50 rounded-xl p-4 border space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Order #{order.dailyOrderNumber || order.orderNumber}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                  {badge.text}
                </span>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {["Received", "Preparing", "Ready", "Served"].map((stepName, idx) => {
                  const stepNum = idx + 1;
                  const isDone = badge.step >= stepNum;
                  return (
                    <div key={stepName} className="text-center">
                      <div className={`h-1.5 rounded-full mb-1 ${isDone ? "bg-emerald-600" : "bg-stone-200"}`}></div>
                      <span className={`text-[10px] font-bold ${isDone ? "text-emerald-800" : "text-stone-400"}`}>
                        {stepName}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Items in this order */}
              <div className="pt-2 space-y-1.5 border-t border-stone-200">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs text-stone-700">
                    <span><strong className="text-stone-900">{item.quantity}x</strong> {item.nameSnapshot}</span>
                    <span className="font-medium">{formatPrice(item.pricePaise * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill & Payment Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border space-y-6">
        <h2 className="text-xl font-black border-b pb-3">Bill & Settlement</h2>
        
        <div className="space-y-2 text-sm font-medium text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {gstAmount > 0 && (
            <div className="flex justify-between">
              <span>GST</span>
              <span>{formatPrice(gstAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-black text-stone-950 border-t pt-3 mt-2">
            <span>Grand Total</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-bold mb-3 text-center text-sm">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setPaymentMethod("UPI")}
              className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentMethod === "UPI" ? "border-emerald-600 bg-emerald-50 text-emerald-950" : "border-stone-200 text-stone-600"}`}
            >
              📱 UPI
            </button>
            <button 
              onClick={() => setPaymentMethod("CASH")}
              className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentMethod === "CASH" ? "border-emerald-600 bg-emerald-50 text-emerald-950" : "border-stone-200 text-stone-600"}`}
            >
              💵 Cash
            </button>
          </div>
        </div>
        
        {paymentMethod === "UPI" && (
          <div className="p-4 bg-stone-50 rounded-xl text-center space-y-4 border">
            {hasUpiQr ? (
              <img src={settings.upiQrUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto mix-blend-multiply" />
            ) : (
              <div className="w-48 h-48 mx-auto border-2 border-dashed border-stone-300 flex items-center justify-center rounded-xl bg-white">
                <span className="text-stone-400 font-medium text-xs">Pay waiter via UPI QR</span>
              </div>
            )}
            <p className="text-xs font-medium text-stone-600">Please complete the UPI transfer to the restaurant, then tap below.</p>
          </div>
        )}

        {paymentMethod && (
          <button 
            onClick={handleAction}
            disabled={isProcessing}
            className="w-full bg-stone-950 hover:bg-stone-800 text-white py-4 rounded-xl font-bold text-base shadow-md disabled:opacity-50 transition-all"
          >
            {isProcessing ? "Processing..." : paymentMethod === "UPI" ? "I've Paid via UPI →" : "Call Waiter for Cash →"}
          </button>
        )}
      </div>
    </div>
  );
}
