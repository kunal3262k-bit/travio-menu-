"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useNotificationSound } from "@/lib/sound";

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
      
      const socket = io();
      socket.emit("call_waiter", { restaurantId: order.restaurantId, tableId: order.tableId });
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
    const socket = io();
    socket.emit("join_room", `order_${order.id}`);

    socket.on("order_status_changed", (data) => {
      if (data.orderId === order.id) {
        setStatus(data.status);
        void playSound("status");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [order.id, playSound]);

  const requestBill = () => {
    setIsRequestingBill(true);
    const socket = io();
    socket.emit("request_bill", { 
      restaurantId: order.restaurantId, 
      tableId: order.tableId, 
      orderId: order.id 
    });
    void playSound("payment");
    setBillRequested(true);
    setIsRequestingBill(false);
    
    // In a real app, this might redirect to a payment page immediately, 
    // or wait for the waiter to confirm the bill on the dashboard.
    // For our flow, we will navigate to the payment screen when the customer wants to pay.
    router.push(`/${order.restaurant.slug}/t/${order.table.number}/payment`);
  };

  const getStatusText = () => {
    switch(status) {
      case "RECEIVED": return "Order Received! Kitchen is reviewing it.";
      case "ACCEPTED": return "Kitchen has accepted your order.";
      case "PREPARING": return "Your food is being prepared!";
      case "READY": return "Food is ready! Waiter is bringing it now.";
      case "SERVED": return "Enjoy your meal!";
      case "COMPLETED": return "Order Complete.";
      default: return "Processing...";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border space-y-8">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Order #{order.orderNumber}</p>
        <h2 className="text-xl font-bold mt-2">{getStatusText()}</h2>
        {!isSoundEnabled && (
          <button
            onClick={unlockSound}
            className="mt-4 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800"
          >
            Enable status sounds
          </button>
        )}
      </div>

      <div className="space-y-4">
        {order.items.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
            <div>
              <span className="font-bold">{item.quantity}x</span> {item.nameSnapshot}
            </div>
            <div className="text-gray-500">₹{((item.pricePaise * item.quantity) / 100).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-bold text-lg pt-4">
        <span>Subtotal</span>
        <span>₹{(order.subtotalPaise / 100).toFixed(2)}</span>
      </div>

      <div className="pt-6 space-y-4">
        <button 
          onClick={() => router.push(`/${order.restaurant.slug}/t/${order.table.number}`)}
          className="w-full bg-white border border-gray-300 text-black py-3 rounded-lg font-bold hover:bg-gray-50"
        >
          + Order More Food
        </button>

        <div className="flex gap-4">
          <button 
            onClick={handleCallWaiter}
            disabled={isCallingWaiter || waiterCalled}
            className="w-1/2 bg-gray-100 text-black py-3 rounded-lg font-bold hover:bg-gray-200 disabled:opacity-50"
          >
            {waiterCalled ? "Waiter Notified" : "Call Waiter 🛎️"}
          </button>
          
          <button 
            onClick={requestBill}
            disabled={isRequestingBill || billRequested}
            className="w-1/2 bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {billRequested ? "Bill Requested" : "Request Bill 🧾"}
          </button>
        </div>
      </div>
    </div>
  );
}
