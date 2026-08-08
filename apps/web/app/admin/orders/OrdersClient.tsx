"use client";

import { useState } from "react";
import ThermalReceiptPrint from "../components/ThermalReceiptPrint";
import { getBusinessDayStart } from "@/src/shared/utils/dateUtils";

interface OrdersClientProps {
  initialOrders: any[];
  restaurant: any;
}

export default function OrdersClient({ initialOrders, restaurant }: OrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("TODAY");
  const [sessionFilter, setSessionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Group individual order rows into sessions for display.
  // Orders sharing the same tableSessionId are one customer visit.
  // ─────────────────────────────────────────────────────────────
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
        });
      }

      const session = sessionMap.get(key)!;
      session.subtotalPaise += order.subtotalPaise || 0;
      session.taxPaise += order.taxPaise || 0;
      session.totalPaise += order.totalPaise || 0;
      session.items.push(...(order.items || []));
      session.orderIds.push(order.id);
      session.orderNumbers.push(order.dailyOrderNumber || order.orderNumber);

      // Session is PAID only if ALL orders in it are PAID
      if (order.paymentStatus !== "PAID" && session.paymentStatus === "PAID") {
        session.paymentStatus = order.paymentStatus;
      }

      // Keep earliest order's invoice number (it's the same for all in a session)
      if (order.invoiceNumber && !session.invoiceNumber) {
        session.invoiceNumber = order.invoiceNumber;
      }
    }

    return Array.from(sessionMap.values());
  };

  const getFilteredSessions = () => {
    const today5am = getBusinessDayStart();

    const yesterday5am = new Date(today5am);
    yesterday5am.setDate(yesterday5am.getDate() - 1);

    const weekAgo = new Date(today5am);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const filtered = orders.filter(order => {
      const createdAt = new Date(order.createdAt);
      if (dateFilter === "TODAY" && createdAt < today5am) return false;
      if (dateFilter === "YESTERDAY" && (createdAt < yesterday5am || createdAt >= today5am)) return false;
      if (dateFilter === "WEEK" && createdAt < weekAgo) return false;
      if (sessionFilter !== "ALL" && order.sessionType !== sessionFilter) return false;
      if (statusFilter !== "ALL" && order.paymentStatus !== statusFilter) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const dailyNo = String(order.dailyOrderNumber || order.orderNumber);
        const invNo = String(order.invoiceNumber || "");
        const custName = (order.customerName || "").toLowerCase();
        const carPlate = (order.carLicensePlate || "").toLowerCase();
        const tableNo = String(order.table?.number || "");
        if (
          !dailyNo.includes(query) &&
          !invNo.includes(query) &&
          !custName.includes(query) &&
          !carPlate.includes(query) &&
          !tableNo.includes(query)
        ) return false;
      }

      return true;
    });

    return groupOrdersIntoSessions(filtered);
  };

  const handlePrintBill = async (session: any) => {
    setLoading(true);
    // Build a combined synthetic order object for the receipt printer
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
      isReprint: true,
    };

    try {
      await fetch(`/api/orders/${session.orderIds[0]}/reprint`, { method: "POST" });
    } catch (e) {
      // Non-critical, just for print count tracking
    } finally {
      setLoading(false);
      setPrintingOrder(combinedOrder);
    }
  };

  const filteredSessions = getFilteredSessions();

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl space-y-4 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search Order #, Invoice #, Table, Car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="TODAY">📅 Today (5am Cutoff)</option>
            <option value="YESTERDAY">📅 Yesterday</option>
            <option value="WEEK">🗓️ Last 7 Days</option>
            <option value="ALL">🌐 All Time History</option>
          </select>

          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">🍽️ All Sessions (Table + Car)</option>
            <option value="TABLE">🪑 In-Dining Tables Only</option>
            <option value="CAR">🚗 Drive-In Cars Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">💳 All Payment Statuses</option>
            <option value="PAID">✅ Paid Only</option>
            <option value="CLAIMED">⏳ Pending Claims</option>
            <option value="UNPAID">🔴 Unpaid Only</option>
          </select>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-700/60">
          <span>
            Showing <strong className="text-emerald-400">{filteredSessions.length}</strong> of{" "}
            {groupOrdersIntoSessions(orders).length} sessions
          </span>
          <span>Orders from the same visit are combined into one row</span>
        </div>
      </div>

      {/* SESSIONS TABLE */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-700">
                <th className="p-4">Date / Time</th>
                <th className="p-4">Order #</th>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Location</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4 text-right">Subtotal</th>
                <th className="p-4 text-right">Tax (5%)</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No sessions match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const itemsCount = session.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
                  const invDisplay = session.invoiceNumber
                    ? `INV-${session.invoiceNumber}`
                    : `-`;
                  const isMultiRound = session.orderIds.length > 1;

                  return (
                    <tr key={session.sessionKey} className="hover:bg-slate-700/40 transition">
                      <td className="p-4 text-slate-300 text-xs">
                        {new Date(session.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-200">#{session.orderNumbers.join(', #')}</div>
                        {isMultiRound && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {session.orderIds.length} rounds
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-black text-white font-mono">{invDisplay}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-200">
                        {session.sessionType === "CAR" ? (
                          <div className="space-y-0.5">
                            <span className="bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded text-xs font-bold inline-block">
                              🚗 Drive-In
                            </span>
                            <div className="text-xs text-slate-300">
                              {session.carColor} {session.carBrand} ({session.carLicensePlate || session.customerName || "Car"})
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded text-xs font-bold inline-block">
                              🪑 Table {session.table?.number || "-"}
                            </span>
                            {session.customerName && (
                              <div className="text-xs text-slate-400">{session.customerName}</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-300 max-w-xs">
                        <span className="font-bold">{itemsCount} items: </span>
                        {session.items.map((i: any) => `${i.quantity}x ${i.nameSnapshot}`).join(", ")}
                      </td>
                      <td className="p-4 text-right text-slate-300 font-mono text-xs">
                        ₹{(session.subtotalPaise / 100).toFixed(2)}
                      </td>
                      <td className="p-4 text-right text-slate-400 font-mono text-xs">
                        ₹{(session.taxPaise / 100).toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-black text-white font-mono">
                        ₹{(session.totalPaise / 100).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                          session.paymentStatus === "PAID"
                            ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/50"
                            : session.paymentStatus === "CLAIMED"
                            ? "bg-amber-900/60 text-amber-300 border border-amber-500/50"
                            : "bg-red-900/60 text-red-300 border border-red-500/50"
                        }`}>
                          {session.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handlePrintBill(session)}
                          disabled={loading}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition flex items-center justify-center gap-1.5 mx-auto"
                        >
                          <span>🖨️</span>
                          <span>Print Bill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* THERMAL BILL PRINT MODAL */}
      {printingOrder && (
        <ThermalReceiptPrint
          restaurant={restaurant}
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}
    </div>
  );
}
