"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, CheckCircle2, Car, ArrowRight } from "lucide-react";
import { io } from "socket.io-client";

export default function CarOrderingClient({ restaurant }: { restaurant: any }) {
  const [customerName, setCustomerName] = useState("");
  const [carBrand, setCarBrand] = useState("");
  const [carColor, setCarColor] = useState("");
  const [carLicensePlate, setCarLicensePlate] = useState("");
  const [sessionActive, setSessionActive] = useState(false);

  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [sessionOrders, setSessionOrders] = useState<any[]>([]);
  const [showingBill, setShowingBill] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CASH">("UPI");
  const [paymentState, setPaymentState] = useState<"SELECTING" | "CLAIMED" | "PAID">("SELECTING");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCallingStaff, setIsCallingStaff] = useState(false);
  const [staffCalled, setStaffCalled] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedSession = localStorage.getItem(`car_session_${restaurant.slug}`);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setCustomerName(parsed.customerName || "");
        setCarBrand(parsed.carBrand || "");
        setCarColor(parsed.carColor || "");
        setCarLicensePlate(parsed.carLicensePlate || "");
        setSessionActive(true);
      } catch (e) {}
    }

    const savedOrders = localStorage.getItem(`car_orders_${restaurant.slug}`);
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
          setSessionOrders(parsedOrders);
          setShowingBill(true);
        }
      } catch (e) {}
    }
  }, [restaurant.slug]);

  if (!mounted) return null;

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !carBrand.trim() || !carColor.trim()) return;

    const data = { customerName, carBrand, carColor, carLicensePlate };
    localStorage.setItem(`car_session_${restaurant.slug}`, JSON.stringify(data));
    setSessionActive(true);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[itemId] || 0;
      const updated = current + delta;
      if (updated <= 0) delete next[itemId];
      else next[itemId] = updated;
      return next;
    });
  };

  const allItems = restaurant.categories.flatMap((c: any) => c.items);
  const totalItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const subtotalPaise = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = allItems.find((i: any) => i.id === id);
    return sum + (item?.pricePaise || 0) * qty;
  }, 0);

  const taxPaise = Math.round(subtotalPaise * 0.05);
  const totalPaise = subtotalPaise + taxPaise;

  const handlePlaceOrder = async () => {
    if (totalItemCount === 0) return;
    setPlacing(true);
    setError("");

    try {
      const itemsPayload = Object.entries(cart).map(([menuItemId, quantity]) => ({
        menuItemId,
        quantity
      }));

      const res = await fetch("/api/orders/car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant.slug,
          customerName,
          carBrand,
          carColor,
          carLicensePlate,
          items: itemsPayload,
          instructions
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      setSessionOrders((prev) => {
        const updated = [...prev, data.order];
        localStorage.setItem(`car_orders_${restaurant.slug}`, JSON.stringify(updated));
        return updated;
      });
      setShowingBill(true);
      setCart({});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  const handleCloseSession = async () => {
    for (const order of sessionOrders) {
      await fetch("/api/orders/close-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id })
      }).catch(() => {});
    }
    localStorage.removeItem(`car_session_${restaurant.slug}`);
    localStorage.removeItem(`car_orders_${restaurant.slug}`);
    setSessionClosed(true);
  };

  if (sessionClosed) {
    const rawReviewUrl = restaurant.googleReviewUrl ? restaurant.googleReviewUrl.trim() : "";
    const googleReviewUrl = rawReviewUrl
      ? (rawReviewUrl.startsWith("http://") || rawReviewUrl.startsWith("https://") ? rawReviewUrl : `https://${rawReviewUrl}`)
      : "https://search.google.com/local/writereview?placeid=ChIJFTpMm4H7DDkR2Vf75xmcuss";

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-4xl">
            👋
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">Thank You!</h1>
            <p className="text-gray-600 font-medium text-sm">
              We hope you enjoyed your meal, <span className="font-bold text-slate-900">{customerName || "Valued Guest"}</span>! Have a safe drive home! 🚗
            </p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-semibold">
            ✨ Visit {restaurant.name} again soon! Your session has been safely completed.
          </div>

          {/* Google Review Prompt */}
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-xs"
          >
            ⭐ Write a Google Review
          </a>

          <button
            onClick={() => {
              setSessionClosed(false);
              setSessionOrders([]);
              setShowingBill(false);
              setSessionActive(false);
              setCustomerName("");
              setCarBrand("");
              setCarColor("");
              setCarLicensePlate("");
            }}
            className="text-xs text-slate-500 font-bold hover:underline block mx-auto pt-2"
          >
            Order Again / Start New Session
          </button>
        </div>
      </div>
    );
  }

  if (!sessionActive) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Car-Side Ordering</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome to {restaurant.name}. Enter your vehicle details so our staff can bring your order to your car.</p>
          </div>

          <form onSubmit={handleStartSession} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rohan Sharma"
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Car Color *</label>
                <input
                  type="text"
                  required
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  placeholder="e.g. White"
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Car Brand/Model *</label>
                <input
                  type="text"
                  required
                  value={carBrand}
                  onChange={(e) => setCarBrand(e.target.value)}
                  placeholder="e.g. Maruti Swift"
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Number Plate (Optional)</label>
              <input
                type="text"
                value={carLicensePlate}
                onChange={(e) => setCarLicensePlate(e.target.value)}
                placeholder="e.g. DL 3C AB 1234"
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 uppercase"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              Start Ordering <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }


  const handleClaimPayment = async () => {
    if (sessionOrders.length === 0) return;
    setIsProcessingPayment(true);
    try {
      const orderIds = sessionOrders.map((o) => o.id);
      const totalAmountPaise = sessionOrders.reduce((sum, o) => sum + (o.totalPaise || 0), 0);

      await fetch("/api/orders/claim-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds, method: paymentMethod })
      });

      const socket = io();
      socket.emit("payment_claimed", {
        restaurantId: restaurant.id,
        method: paymentMethod,
        amount: totalAmountPaise
      });

      setPaymentState("CLAIMED");
    } catch (e) {
      alert("Failed to update payment status");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCallStaffToCar = async () => {
    setIsCallingStaff(true);
    try {
      const socket = io();
      socket.emit("call_waiter", { 
        restaurantId: restaurant.id, 
        message: `🚗 Drive-In Car Staff Alert: ${carColor} ${carBrand} (${customerName}) ${carLicensePlate ? `• ${carLicensePlate}` : ""}`
      });

      const firstTableNumber = (restaurant.tables && restaurant.tables.length > 0) ? restaurant.tables[0].number : 1;
      await fetch("/api/waiter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant.slug,
          tableNumber: firstTableNumber,
          type: "CALL_WAITER"
        })
      }).catch(() => {});

      setStaffCalled(true);
      setTimeout(() => setStaffCalled(false), 30000);
    } catch (err) {
      alert("Failed to alert staff. Please try again.");
    } finally {
      setIsCallingStaff(false);
    }
  };

  const handlePrintReceipt = () => {
    const allItems = sessionOrders.flatMap((o) => o.items || []);
    const subtotalPaiseSum = sessionOrders.reduce((sum, o) => sum + (o.subtotalPaise || 0), 0);
    const taxPaiseSum = sessionOrders.reduce((sum, o) => sum + (o.taxPaise || 0), 0);
    const totalPaiseSum = sessionOrders.reduce((sum, o) => sum + (o.totalPaise || 0), 0);
    const orderNumbersList = sessionOrders.map((o) => `#${o.dailyOrderNumber || o.orderNumber}`).join(", ");
    
    const itemsHtml = allItems.map((item: any) => `
      <div class="item">
        <span>${item.quantity}x ${item.nameSnapshot}</span>
        <span>₹${((item.pricePaise * item.quantity) / 100).toFixed(2)}</span>
      </div>
    `).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${restaurant.name}</title>
  <style>
    body { font-family: monospace; width: 300px; margin: 0 auto; padding: 20px; color: #000; }
    .text-center { text-align: center; }
    .bold { font-weight: bold; }
    .border-b { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
    .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .totals { display: flex; justify-content: space-between; margin-top: 5px; }
    .mt-10 { margin-top: 10px; }
    .mt-20 { margin-top: 20px; }
    .text-sm { font-size: 12px; }
    .text-lg { font-size: 16px; }
  </style>
</head>
<body>
  <div class="text-center border-b">
    <div class="bold text-lg">${restaurant.name}</div>
    <div class="text-sm mt-10">🚗 Drive-In Receipt</div>
    <div class="text-sm">${carColor} ${carBrand}</div>
    <div class="text-sm">${customerName} ${carLicensePlate ? `• ${carLicensePlate}` : ""}</div>
    <div class="text-sm mt-10">Order(s): ${orderNumbersList}</div>
  </div>
  
  <div class="border-b mt-10">
    ${itemsHtml}
  </div>
  
  <div class="border-b mt-10">
    <div class="totals">
      <span>Subtotal</span>
      <span>₹${(subtotalPaiseSum / 100).toFixed(2)}</span>
    </div>
    <div class="totals">
      <span>GST (5%)</span>
      <span>₹${(taxPaiseSum / 100).toFixed(2)}</span>
    </div>
    <div class="totals bold text-lg mt-10">
      <span>TOTAL</span>
      <span>₹${(totalPaiseSum / 100).toFixed(2)}</span>
    </div>
  </div>
  
  <div class="text-center mt-20 text-sm">
    <p>Thank you for visiting!</p>
    <p>Powered by SwiftTab</p>
  </div>
  
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  if (showingBill && sessionOrders.length > 0) {
    const rawReviewUrl = restaurant.googleReviewUrl ? restaurant.googleReviewUrl.trim() : "";
    const googleReviewUrl = rawReviewUrl
      ? (rawReviewUrl.startsWith("http://") || rawReviewUrl.startsWith("https://") ? rawReviewUrl : `https://${rawReviewUrl}`)
      : "https://search.google.com/local/writereview?placeid=ChIJFTpMm4H7DDkR2Vf75xmcuss";

    const allItems = sessionOrders.flatMap((o) => o.items || []);
    const subtotalPaiseSum = sessionOrders.reduce((sum, o) => sum + (o.subtotalPaise || 0), 0);
    const taxPaiseSum = sessionOrders.reduce((sum, o) => sum + (o.taxPaise || 0), 0);
    const totalPaiseSum = sessionOrders.reduce((sum, o) => sum + (o.totalPaise || 0), 0);
    const orderNumbersList = sessionOrders.map((o) => `#${o.dailyOrderNumber || o.orderNumber}`).join(", ");

    return (
      <div className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-md border space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {sessionOrders.length > 1 ? `Orders (${orderNumbersList})` : `Order ${orderNumbersList}`}
            </span>
            <h2 className="text-2xl font-black">Bill & Order Details</h2>
            <p className="text-gray-500 text-xs">
              🚗 {carColor} {carBrand} ({customerName}) {carLicensePlate ? `• ${carLicensePlate}` : ""}
            </p>
          </div>

          {/* QUICK ACTIONS: CALL STAFF & ADD MORE ITEMS */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleCallStaffToCar}
              disabled={isCallingStaff || staffCalled}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <span className="text-base">🛎️</span>
              <span>{staffCalled ? "Staff Alerted!" : "Call Staff to Car"}</span>
            </button>

            <button
              onClick={() => setShowingBill(false)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 py-2.5 px-3 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
            >
              <span className="text-base">➕</span>
              <span>Add More Items</span>
            </button>
          </div>

          {/* Itemized Bill Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 border space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 border-b pb-2">
              Itemized Summary ({allItems.length} items)
            </h3>
            <div className="space-y-2 text-xs">
              {allItems.map((item: any, idx: number) => (
                <div key={`${item.id}-${idx}`} className="flex justify-between items-center text-gray-700 font-medium">
                  <span>{item.quantity}x {item.nameSnapshot}</span>
                  <span className="font-bold">₹{((item.pricePaise * item.quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">₹{(subtotalPaiseSum / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-semibold">₹{(taxPaiseSum / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t">
                <span>Grand Total</span>
                <span className="text-emerald-700">₹{(totalPaiseSum / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* PAYMENT SECTION */}
          {paymentState === "SELECTING" && (
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 text-center">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === "UPI" ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-gray-200 text-gray-600"
                  }`}
                >
                  <span className="text-xl">📱</span>
                  <span>UPI / QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === "CASH" ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-gray-200 text-gray-600"
                  }`}
                >
                  <span className="text-xl">💵</span>
                  <span>Pay Cash at Car</span>
                </button>
              </div>

              {paymentMethod === "UPI" && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-center space-y-3">
                  <p className="text-xs font-bold text-emerald-900">Scan QR Code or Tap UPI Link to Pay Total</p>
                  <div className="w-40 h-40 bg-white p-2 rounded-xl mx-auto border shadow-sm flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                        `upi://pay?pa=restaurant@upi&pn=${encodeURIComponent(restaurant.name)}&am=${(totalPaiseSum / 100).toFixed(2)}&cu=INR`
                      )}`} 
                      alt="UPI QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <a 
                    href={`upi://pay?pa=restaurant@upi&pn=${encodeURIComponent(restaurant.name)}&am=${(totalPaiseSum / 100).toFixed(2)}&cu=INR`}
                    className="inline-block w-full bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-emerald-700 shadow"
                  >
                    🚀 Pay ₹{(totalPaiseSum / 100).toFixed(2)} via UPI App
                  </a>
                </div>
              )}

              <button
                onClick={handleClaimPayment}
                disabled={isProcessingPayment}
                className="w-full bg-black text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isProcessingPayment ? "Processing..." : paymentMethod === "UPI" ? "I Have Paid via UPI" : "Request Cash Collection"}
              </button>
            </div>
          )}

          {/* PAYMENT CLAIMED / SUCCESS STATE */}
          {paymentState === "CLAIMED" && (
            <div className="space-y-5 pt-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                <span className="text-2xl">🎉</span>
                <h4 className="font-extrabold text-emerald-900 text-sm">Payment Confirmation Sent!</h4>
                <p className="text-xs text-emerald-700">
                  Staff has been notified. They will deliver your receipt and food right to your car.
                </p>
              </div>

              {/* GOOGLE REVIEW PROMPT */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900">Enjoying your food?</h4>
                <p className="text-xs text-gray-600">Rate your experience and leave us a quick Google review!</p>
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-md"
                >
                  ⭐ Write a Google Review
                </a>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl text-xs border flex items-center justify-center gap-1.5"
                >
                  🖨️ Print / Save Receipt
                </button>
                <button
                  type="button"
                  onClick={handleCloseSession}
                  className="flex-1 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition text-xs"
                >
                  Done / Finish Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="font-black text-lg text-slate-900">{restaurant.name}</h1>
          <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
            🚗 {carColor} {carBrand} • {customerName}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleCallStaffToCar}
            disabled={isCallingStaff || staffCalled}
            className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1"
          >
            {staffCalled ? "Staff Alerted!" : "Call Staff to Car 🛎️"}
          </button>
          <button
            onClick={() => setSessionActive(false)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold"
          >
            Edit Car
          </button>
        </div>
      </header>

      {/* Menu Categories & Items */}
      <div className="max-w-lg mx-auto p-4 space-y-8">
        {restaurant.categories.map((cat: any) => (
          <div key={cat.id} className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 border-b pb-1">{cat.name}</h2>
            <div className="space-y-3">
              {cat.items.map((item: any) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${item.foodType === "VEG" ? "bg-emerald-600" : "bg-red-600"}`} />
                      <span className="font-bold text-slate-900">{item.name}</span>
                    </div>
                    <p className="text-sm font-black text-slate-700">₹{(item.pricePaise / 100).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl">
                    {cart[item.id] ? (
                      <>
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 font-black bg-white rounded-lg text-slate-700 shadow-sm">-</button>
                        <span className="font-black px-1 text-slate-900">{cart[item.id]}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 font-black bg-emerald-700 text-white rounded-lg shadow-sm">+</button>
                      </>
                    ) : (
                      <button onClick={() => updateQuantity(item.id, 1)} className="px-4 py-1.5 bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-sm">
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Cart Bar */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-2xl z-50">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 font-medium">{totalItemCount} items</p>
              <p className="text-xl font-black text-emerald-700">₹{(totalPaise / 100).toFixed(2)}</p>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <ShoppingBag className="w-5 h-5" />
              {placing ? "Placing..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
