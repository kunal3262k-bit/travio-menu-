"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

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
  const [waiterConfirmed, setWaiterConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const settings = restaurant.settings || {};
  const upiQrUrl = settings.upiQrUrl || "https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"; // Mock default
  
  useEffect(() => {
    const socket = io();
    socket.emit("join_room", `table_${table.id}`);

    socket.on("bill_confirmed", () => {
      setWaiterConfirmed(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [table.id]);

  const handlePayment = async () => {
    if (!paymentMethod) return;
    setIsProcessing(true);
    
    // 1. Mark orders as COMPLETED
    try {
      await fetch("/api/orders/batch-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds })
      });
      
      // 2. Redirect to Review flow
      router.push(`/${restaurant.slug}/t/${table.number}/review`);
    } catch (e) {
      alert("Payment failed");
      setIsProcessing(false);
    }
  };

  const formatPrice = (p: number) => `₹${(p / 100).toFixed(2)}`;

  if (!waiterConfirmed) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        <h2 className="text-2xl font-bold">Waiting for Confirmation</h2>
        <p className="text-gray-500">Your waiter is confirming your final bill amount. This will only take a moment.</p>
        
        {/* Fallback override for demo purposes */}
        <button onClick={() => setWaiterConfirmed(true)} className="text-xs text-gray-300 mt-12 block mx-auto underline">
          Simulate Waiter Confirmation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6 border space-y-6">
      <h2 className="text-2xl font-bold text-center border-b pb-4">Bill Summary</h2>
      
      <div className="space-y-4">
        {orders.map((o: any) => (
          <div key={o.id} className="space-y-2">
            {o.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.nameSnapshot}</span>
                <span className="text-gray-600">{formatPrice(item.pricePaise * item.quantity)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2 text-sm font-medium text-gray-600">
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
      </div>

      <div className="flex justify-between text-xl font-black border-t pt-4">
        <span>Grand Total</span>
        <span>{formatPrice(grandTotal)}</span>
      </div>

      <div className="pt-8">
        <h3 className="font-bold mb-4 text-center">Select Payment Method</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setPaymentMethod("UPI")}
            className={`py-3 rounded-lg border-2 font-bold ${paymentMethod === "UPI" ? "border-black bg-gray-50" : "border-gray-200 text-gray-500"}`}
          >
            Restaurant UPI QR
          </button>
          <button 
            onClick={() => setPaymentMethod("CASH")}
            className={`py-3 rounded-lg border-2 font-bold ${paymentMethod === "CASH" ? "border-black bg-gray-50" : "border-gray-200 text-gray-500"}`}
          >
            Cash
          </button>
        </div>
      </div>
      
      {paymentMethod === "UPI" && (
        <div className="p-4 bg-gray-50 rounded-lg text-center space-y-4">
          <img src={upiQrUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto mix-blend-multiply" />
          <p className="text-sm font-medium text-gray-600">Scan to pay with any UPI app</p>
        </div>
      )}

      {paymentMethod && (
        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {isProcessing ? "Processing..." : `Complete ${paymentMethod} Payment`}
        </button>
      )}
    </div>
  );
}
