"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function AdminNotifications({ restaurantId }: { restaurantId: string }) {
  const [notifications, setNotifications] = useState<{ id: number, message: string, type: string }[]>([]);

  useEffect(() => {
    // Only connect if we are in browser
    if (typeof window === "undefined") return;

    const socket = io(); // Connects to the same host

    socket.on("connect", () => {
      // Join rooms to listen to everything relevant to the owner
      socket.emit("join_room", `kitchen_${restaurantId}`);
      socket.emit("join_room", `waiter_${restaurantId}`);
      socket.emit("join_room", `admin_${restaurantId}`);
    });

    const addNotification = (message: string, type: "info" | "warning" | "error" | "success" = "info") => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message, type }]);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    };

    socket.on("kitchen_new_order", ({ orderId }) => {
      addNotification(`New Order Received! (#${orderId.substring(0,6)})`, "success");
    });

    socket.on("waiter_bill_requested", ({ tableId }) => {
      addNotification(`Bill Requested for Table ${tableId}`, "warning");
    });

    socket.on("admin_low_rating", ({ rating }) => {
      addNotification(`Alert: A ${rating}-star review was just left.`, "error");
    });

    socket.on("admin_item_out_of_stock", ({ itemName }) => {
      addNotification(`${itemName} is now out of stock.`, "info");
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => (
        <div 
          key={n.id} 
          className={`px-6 py-4 rounded-xl shadow-lg font-bold text-white max-w-sm transform transition-all translate-y-0 opacity-100
            ${n.type === "success" ? "bg-green-600" : ""}
            ${n.type === "warning" ? "bg-orange-500" : ""}
            ${n.type === "error" ? "bg-red-600" : ""}
            ${n.type === "info" ? "bg-black" : ""}
          `}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
