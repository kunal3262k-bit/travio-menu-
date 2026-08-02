"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";

export default function WaiterClient({ 
  initialRequests, 
  initialReadyOrders, 
  restaurantId 
}: { 
  initialRequests: any[], 
  initialReadyOrders: any[],
  restaurantId: string 
}) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [readyOrders, setReadyOrders] = useState(initialReadyOrders);

  useEffect(() => {
    const socket = io();
    socket.emit("join_room", `waiter_${restaurantId}`);

    socket.on("waiter_order_status", () => {
      // Refresh to get new READY orders (or we could fetch API)
      router.refresh();
    });
    
    socket.on("waiter_bill_requested", () => {
      router.refresh();
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId, router]);

  const resolveRequest = async (id: string, type: string, tableId: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    
    if (type === "REQUEST_BILL") {
      const socket = io();
      socket.emit("bill_confirmed", { tableId, restaurantId });
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

  return (
    <div className="space-y-8">
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
              <div key={order.id} className="bg-white border-2 border-green-500 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black">Table {order.table.number}</h3>
                  <span className="text-sm font-bold text-gray-500">#{order.orderNumber}</span>
                </div>
                <button 
                  onClick={() => markOrderServed(order.id)}
                  className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold"
                >
                  Mark Served
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
