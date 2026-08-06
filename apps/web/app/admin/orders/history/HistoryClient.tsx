"use client";

import { useState } from "react";
import { Printer, Search, ArrowRight } from "lucide-react";
import ThermalReceiptPrint from "../../components/ThermalReceiptPrint";

export default function HistoryClient({
  initialOrders,
  restaurant
}: {
  initialOrders: any[];
  restaurant: any;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("PAID"); // ALL, PAID, UNPAID, CANCELLED
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const groupOrdersIntoSessions = (rawOrders: any[]) => {
    const sessionMap = new Map<string, any>();

    for (const order of rawOrders) {
      // Use tableSessionId as the grouping key; fall back to order id for old orders
      const key = order.tableSessionId || order.id;

      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          // Session identity
          sessionKey: key,
          tableSessionId: order.tableSessionId,
          invoiceNumber: order.invoiceNumber,
          // Use earliest order's createdAt as the session time
          createdAt: order.createdAt,
          // Location info from first order
          sessionType: order.sessionType,
          table: order.table,
          carColor: order.carColor,
          carBrand: order.carBrand,
          carLicensePlate: order.carLicensePlate,
          customerName: order.customerName,
          // Aggregates
          subtotalPaise: 0,
          taxPaise: 0,
          totalPaise: 0,
          items: [],
          orderIds: [],
          orderNumbers: [],
          paymentStatus: order.paymentStatus,
          status: order.status,
        });
      }

      const session = sessionMap.get(key)!;
      session.subtotalPaise += order.subtotalPaise || 0;
      session.taxPaise += order.taxPaise || 0;
      session.totalPaise += order.totalPaise || 0;
      session.items.push(...(order.items || []));
      session.orderIds.push(order.id);
      session.orderNumbers.push(order.dailyOrderNumber || order.orderNumber);

      // Keep earliest order's invoice number
      if (order.invoiceNumber && !session.invoiceNumber) {
        session.invoiceNumber = order.invoiceNumber;
      }
    }

    return Array.from(sessionMap.values());
  };

  const getFilteredSessions = () => {
    const filtered = orders.filter((o) => {
      // 1. Filter by Status
      if (statusFilter !== "ALL") {
        if (statusFilter === "PAID" && o.paymentStatus !== "PAID") return false;
        if (statusFilter === "UNPAID" && o.paymentStatus === "PAID") return false;
        if (statusFilter === "CANCELLED" && o.status !== "CANCELLED") return false;
      }
      
      // 2. Filter by Search Query
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const invMatch = o.invoiceNumber?.toString().includes(q);
      const orderNumMatch = o.dailyOrderNumber?.toString().includes(q) || o.orderNumber?.toString().includes(q);
      const tableMatch = o.table?.number?.toString().includes(q);
      const custMatch = o.customerName?.toLowerCase().includes(q);
      return invMatch || orderNumMatch || tableMatch || custMatch;
    });

    return groupOrdersIntoSessions(filtered);
  };

  const handlePrintBill = (session: any) => {
    const combinedOrder = {
      id: session.orderIds[0],
      invoiceNumber: session.invoiceNumber,
      orderNumber: Math.min(...session.orderNumbers),
      dailyOrderNumber: Math.min(...session.orderNumbers),
      createdAt: session.createdAt,
      table: session.table,
      tableNumber: session.table?.number,
      sessionType: session.sessionType,
      carColor: session.carColor,
      carBrand: session.carBrand,
      carLicensePlate: session.carLicensePlate,
      customerName: session.customerName,
      subtotalPaise: session.subtotalPaise,
      taxPaise: session.taxPaise,
      totalPaise: session.totalPaise,
      paymentStatus: session.paymentStatus,
      items: session.items,
      isReprint: session.paymentStatus === "PAID",
    };
    setSelectedOrder(combinedOrder);
  };

  const filteredSessions = getFilteredSessions();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Invoice #, Order #, Table, or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
          />
        </div>
        
        {/* Status Tabs */}
        <div className="flex bg-gray-200/50 p-1 rounded-lg">
          {["PAID", "UNPAID", "CANCELLED", "ALL"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                statusFilter === tab 
                  ? "bg-white text-black shadow-sm" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold">Date & Time</th>
              <th className="px-6 py-4 font-semibold">Invoice #</th>
              <th className="px-6 py-4 font-semibold">Order #</th>
              <th className="px-6 py-4 font-semibold">Location</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No paid orders found matching your search.
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => (
                <tr key={session.sessionKey} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium" suppressHydrationWarning>
                    {new Date(session.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    })}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {session.invoiceNumber ? `INV-${session.invoiceNumber}` : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    #{Math.min(...session.orderNumbers)}
                    {session.orderIds.length > 1 && (
                      <span className="block text-[10px] text-gray-400">
                        {session.orderIds.length} rounds combined
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {session.sessionType === "CAR"
                      ? `Car (${session.carLicensePlate || "Drive-in"})`
                      : `Table ${session.table?.number || "?"}`}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    ₹{(session.totalPaise / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {session.status === "CANCELLED" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        CANCELLED
                      </span>
                    ) : session.paymentStatus === "PAID" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                        PENDING
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handlePrintBill(session)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-black hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md"
                    >
                      <Printer className="w-4 h-4" />
                      {session.paymentStatus === "PAID" ? "Reprint" : "Print Draft"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <ThermalReceiptPrint
          restaurant={restaurant}
          order={selectedOrder}
          autoPrint={false}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
