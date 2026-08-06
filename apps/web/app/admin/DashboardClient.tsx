"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThermalReceiptPrint from "./components/ThermalReceiptPrint";

export default function DashboardClient({ initialMetrics, initialStatus, restaurant }: { initialMetrics: any, initialStatus: string, restaurant?: any }) {
  const router = useRouter();
  const [metrics] = useState(initialMetrics);
  const [status, setStatus] = useState(initialStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [closing, setClosing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [printingOrder, setPrintingOrder] = useState<any>(null);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/restaurant/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      setStatus(newStatus);
    } catch (e) {
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCloseDay = async () => {
    setClosing(true);
    try {
      setReport({
        sales: metrics?.sales || 0,
        orders: metrics?.orders || 0,
        avgBill: metrics?.avgBill || 0,
        date: new Date().toLocaleDateString(),
        upiSales: metrics?.upiSales || 0,
        cashSales: metrics?.cashSales || 0,
        cardSales: metrics?.cardSales || 0,
        pending: metrics?.pending || 0,
        cancelledOrders: metrics?.cancelledOrders || 0,
        itemBreakdown: metrics?.itemBreakdown || [],
        recentOrders: metrics?.recentOrders || [],
        detailedOrders: metrics?.detailedOrders || []
      });
    } catch (e) {
      if (typeof window !== "undefined") window.alert("Error generating summary");
    } finally {
      setClosing(false);
    }
  };

  const statusConfig: Record<string, { bg: string; border: string; dot: string; glow: string; label: string; desc: string }> = {
    LIVE: {
      bg: "from-emerald-950 to-emerald-900",
      border: "border-emerald-500/30",
      dot: "bg-emerald-400",
      glow: "shadow-emerald-500/20",
      label: "System Live",
      desc: "Kitchen is accepting QR orders in real-time."
    },
    PAUSED: {
      bg: "from-amber-950 to-amber-900",
      border: "border-amber-500/30",
      dot: "bg-amber-400",
      glow: "shadow-amber-500/20",
      label: "Rush Mode",
      desc: "Kitchen overwhelmed — QR ordering paused temporarily."
    },
    CLOSED: {
      bg: "from-red-950 to-red-900",
      border: "border-red-500/30",
      dot: "bg-red-400",
      glow: "shadow-red-500/20",
      label: "Closed",
      desc: "Restaurant is closed. No orders accepted."
    }
  };

  const currentStatus = statusConfig[status] || statusConfig.LIVE;

  return (
    <div className="space-y-6">

      {/* ── STATUS CONTROL STRIP ── */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentStatus.bg} border ${currentStatus.border} shadow-xl ${currentStatus.glow}`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMC44IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-3.5 h-3.5 rounded-full ${currentStatus.dot}`}></div>
              <div className={`absolute inset-0 w-3.5 h-3.5 rounded-full ${currentStatus.dot} animate-ping opacity-40`}></div>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">{currentStatus.label}</h2>
              <p className="text-sm text-white/60 font-medium">{currentStatus.desc}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(["LIVE", "PAUSED", "CLOSED"] as const).map(s => {
              const isActive = status === s;
              const labels: Record<string, string> = { LIVE: "🟢 Go Live", PAUSED: "⏸ Pause", CLOSED: "🔴 Close" };
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={isUpdatingStatus || isActive}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-lg scale-[1.02]"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-sm"
                  }`}
                >
                  {labels[s]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PRIMARY KPI ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card — Hero */}
        <div className="relative overflow-hidden col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Today's Revenue</p>
          <p className="text-4xl font-black text-white tracking-tight">
            ₹{(metrics.sales / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
              <span className="text-emerald-400 text-xs font-bold">{metrics.orders} orders</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
              <span className="text-slate-300 text-xs font-bold">Avg ₹{(metrics.avgBill / 100).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <span className="text-lg">🪑</span>
            </div>
            {metrics.tablesActive > 0 && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
            )}
          </div>
          <p className="text-3xl font-black text-slate-900">{metrics.tablesActive}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Tables Active</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <span className="text-lg">⏳</span>
            </div>
            {metrics.pending > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </div>
          <p className="text-3xl font-black text-slate-900">{metrics.pending}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Pending Orders</p>
        </div>
      </div>

      {/* ── SECONDARY KPI ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <span className="text-lg">✅</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{metrics.completed}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Completed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
            <span className="text-lg">📱</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{metrics.scans}</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">QR Scans</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <span className="text-lg">📊</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{metrics.conversion}%</p>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Conversion Rate</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <span className="text-lg">🏆</span>
          </div>
          <p className="text-3xl font-black text-emerald-900">{metrics.lifetimePaidOrders || 0}</p>
          <p className="text-xs text-emerald-700 font-semibold mt-0.5">Lifetime Orders</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Since {metrics.joinedDate || "launch"}</p>
        </div>
      </div>

      {/* ── QUICK ACTIONS STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <a
          href="/admin/kitchen"
          className="group relative overflow-hidden flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <span className="text-white text-lg">🍳</span>
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">Kitchen KDS</p>
            <p className="text-[11px] text-slate-500 font-medium">Live orders</p>
          </div>
        </a>

        <a
          href="/admin/waiter"
          className="group relative overflow-hidden flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <span className="text-white text-lg">🧑‍🍳</span>
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">Waiter Panel</p>
            <p className="text-[11px] text-slate-500 font-medium">Requests & bills</p>
          </div>
        </a>

        <a
          href="/admin/tables"
          className="group relative overflow-hidden flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <span className="text-white text-lg">📋</span>
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">Tables & QR</p>
            <p className="text-[11px] text-slate-500 font-medium">Manage standees</p>
          </div>
        </a>

        <a
          href="/admin/orders"
          className="group relative overflow-hidden flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <span className="text-white text-lg">📦</span>
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">Order History</p>
            <p className="text-[11px] text-slate-500 font-medium">Billing & reprints</p>
          </div>
        </a>
      </div>

      {/* ── DAILY SUMMARY CTA ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-200/30 to-transparent"></div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Daily Summary</h2>
              <p className="text-sm text-slate-500 font-medium">Payment breakdown, top items & sales report</p>
            </div>
          </div>
          <button
            onClick={handleCloseDay}
            disabled={closing}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            {closing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                Processing…
              </>
            ) : (
              "View Summary →"
            )}
          </button>
        </div>
      </div>

      {/* ── REPORT MODAL ── */}
      {report && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
              <h2 className="text-2xl font-black text-white">Daily Summary</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">{report.date}</p>
            </div>

            <div className="p-8 overflow-y-auto max-h-[65vh] space-y-6">
              {report.pending > 0 && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold border border-red-200 text-sm flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <span>{report.pending} open order{report.pending > 1 ? "s" : ""}. Close them before treating this as a final report.</span>
                </div>
              )}

              {/* Revenue Hero */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                <p className="text-3xl font-black text-emerald-900">₹{(report.sales / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center gap-3 mt-3 text-xs font-bold text-emerald-700">
                  <span>{report.orders} orders</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                  <span>Avg ₹{(report.avgBill / 100).toFixed(0)}</span>
                  {report.cancelledOrders > 0 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-red-400"></span>
                      <span className="text-red-600">{report.cancelledOrders} cancelled</span>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Breakdown */}
              <div>
                <h3 className="font-black text-sm text-slate-900 mb-3 uppercase tracking-wider">Payment Breakdown</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "UPI", value: report.upiSales, color: "from-blue-500 to-indigo-500" },
                    { label: "Cash", value: report.cashSales, color: "from-emerald-500 to-teal-500" },
                    { label: "Card", value: report.cardSales, color: "from-violet-500 to-purple-500" }
                  ].map(pm => (
                    <div key={pm.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                      <div className={`w-8 h-1 rounded-full bg-gradient-to-r ${pm.color} mx-auto mb-2`}></div>
                      <p className="text-lg font-black text-slate-900">₹{(pm.value / 100).toFixed(0)}</p>
                      <p className="text-[11px] text-slate-500 font-bold">{pm.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Items */}
              {report.itemBreakdown && report.itemBreakdown.length > 0 && (
                <div>
                  <h3 className="font-black text-sm text-slate-900 mb-3 uppercase tracking-wider">Top Sellers</h3>
                  <div className="space-y-2">
                    {report.itemBreakdown.map((item: any, i: number) => (
                      <div key={item.name} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-400 w-5">#{i + 1}</span>
                          <span className="font-bold text-sm text-slate-800 truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-xs font-black">{item.quantity}×</span>
                          <span className="text-sm font-bold text-slate-600">₹{(item.revenue / 100).toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Orders Log */}
              {report.detailedOrders && report.detailedOrders.length > 0 && (
                <div>
                  <h3 className="font-black text-sm text-slate-900 mb-3 uppercase tracking-wider">Today's Orders Log</h3>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {report.detailedOrders.map((order: any) => (
                      <div key={order.id} className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/60 border-b border-slate-200/60">
                          <span className="font-black text-xs text-slate-800">
                            Order #{order.orderNumber} — {
                              order.sessionType === "CAR"
                                ? `🚗 ${order.carColor || ""} ${order.carBrand || ""} (${order.carLicensePlate || "Drive-In"})`
                                : `🪑 Table ${order.tableNumber || "N/A"}`
                            }
                          </span>
                          <span className="font-black text-xs text-emerald-700">₹{(order.totalPaise / 100).toFixed(2)}</span>
                        </div>
                        <div className="px-4 py-2.5 space-y-1.5">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                              order.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" :
                              order.paymentStatus === "CLAIMED" ? "bg-amber-100 text-amber-700" :
                              "bg-slate-200 text-slate-600"
                            }`}>{order.paymentMethod || "UNPAID"}</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                              order.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                              order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>{order.status}</span>
                          </div>
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs text-slate-600">
                              <span>{item.quantity}× {item.name}</span>
                              <span className="text-slate-500 font-semibold">₹{((item.pricePaise * item.quantity) / 100).toFixed(0)}</span>
                            </div>
                          ))}
                          <div className="pt-1.5 flex justify-end">
                            <button
                              onClick={() => setPrintingOrder(order)}
                              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-colors"
                            >
                              🖨️ Print
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => setReport(null)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL THERMAL BILL PRINT MODAL */}
      {printingOrder && (
        <ThermalReceiptPrint 
          restaurant={restaurant || { name: "SwiftTab Restaurant" }} 
          order={printingOrder} 
          onClose={() => setPrintingOrder(null)} 
        />
      )}
    </div>
  );
}
