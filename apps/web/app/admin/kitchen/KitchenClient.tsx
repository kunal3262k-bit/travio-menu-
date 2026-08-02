"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function KitchenClient({ initialOrders, restaurantId }: { initialOrders: any[], restaurantId: string }) {
  const [orders, setOrders] = useState(initialOrders);
  const [unacknowledged, setUnacknowledged] = useState<string[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const playPingSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.1); // E6
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio play failed");
    }
  };

  useEffect(() => {
    // Attempt to enable audio on any user interaction
    const enableAudio = () => setIsAudioEnabled(true);
    window.addEventListener("click", enableAudio, { once: true });
    return () => window.removeEventListener("click", enableAudio);
  }, []);

  useEffect(() => {
    const socket = io();
    socket.emit("join_room", `kitchen_${restaurantId}`);

    socket.on("kitchen_new_order", async ({ orderId }) => {
      playPingSound();
      setUnacknowledged(prev => [...prev, orderId]);
      
      // Fetch latest orders without reloading the page
      try {
        const res = await fetch("/api/kitchen/active-orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch new orders");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

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
      
      // We don't necessarily need to reload here because our optimistic update worked,
      // and the server route we hit should emit the event to the customer.
      // Wait, we need the API route to emit the socket event! But we can't emit from the API route easily.
      // So the client emits it here!
      const socket = io();
      socket.emit("order_status_updated", { orderId, status, restaurantId });
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

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <h2 className="text-2xl font-bold mb-2">No Active Orders</h2>
        <p>Waiting for customers to place orders...</p>
      </div>
    );
  }

  return (
    <>
      {!isAudioEnabled && (
        <div className="bg-blue-900 text-blue-100 p-4 rounded-xl mb-6 text-center font-bold animate-pulse cursor-pointer border border-blue-500" onClick={() => setIsAudioEnabled(true)}>
          Click anywhere to enable order sound alerts 🔔
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map(order => {
          const isUnack = unacknowledged.includes(order.id);
          const cardClasses = isUnack 
            ? "border-4 border-red-500 bg-red-900/40 animate-pulse scale-105 transition-transform" 
            : `${getStatusColor(order.status)} border-2 transition-all`;

          return (
          <div key={order.id} className={`rounded-xl p-6 ${cardClasses} flex flex-col`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-black">Table {order.table.number}</h3>
              <p className="text-sm text-gray-400">Order #{order.orderNumber}</p>
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
                onClick={() => updateStatus(order.id, "COMPLETED")}
                className="col-span-2 bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-lg font-bold text-xl transition-colors"
              >
                Finish Order
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
    </>
  );
}
