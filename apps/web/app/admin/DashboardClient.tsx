"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardClient({ initialMetrics, initialStatus }: { initialMetrics: any, initialStatus: string }) {
  const router = useRouter();
  const [metrics] = useState(initialMetrics);
  const [status, setStatus] = useState(initialStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [closing, setClosing] = useState(false);
  const [report, setReport] = useState<any>(null);

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
      // We will just generate the visual report.
      setReport({
        sales: metrics?.sales || 0,
        orders: metrics?.orders || 0,
        avgBill: metrics?.avgBill || 0,
        date: new Date().toLocaleDateString()
      });
    } catch (e) {
      if (typeof window !== "undefined") window.alert("Error closing day");
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* RESTAURANT STATUS CONTROLS - THE PANIC BUTTONS */}
      <div className={`border-2 rounded-2xl p-6 shadow-sm transition-colors ${
        status === "LIVE" ? "bg-green-50 border-green-200" : 
        status === "PAUSED" ? "bg-orange-50 border-orange-200" : 
        "bg-red-50 border-red-200"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black mb-2">Digital Orders: {status}</h2>
            <p className="text-gray-600 font-medium">
              {status === "LIVE" ? "Kitchen is accepting QR orders." : 
               status === "PAUSED" ? "Kitchen is overwhelmed. QR orders paused." : 
               "Restaurant is closed. No orders accepted."}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleStatusChange("LIVE")}
              disabled={isUpdatingStatus || status === "LIVE"}
              className={`px-6 py-4 rounded-xl font-black text-lg transition-all ${
                status === "LIVE" ? "bg-green-600 text-white shadow-lg scale-105" : "bg-white text-gray-500 hover:bg-gray-50 opacity-60"
              }`}
            >
              🟢 LIVE
            </button>
            <button 
              onClick={() => handleStatusChange("PAUSED")}
              disabled={isUpdatingStatus || status === "PAUSED"}
              className={`px-6 py-4 rounded-xl font-black text-lg transition-all ${
                status === "PAUSED" ? "bg-orange-500 text-white shadow-lg scale-105" : "bg-white text-gray-500 hover:bg-gray-50 opacity-60"
              }`}
            >
              ⏸️ PAUSE (RUSH)
            </button>
            <button 
              onClick={() => handleStatusChange("CLOSED")}
              disabled={isUpdatingStatus || status === "CLOSED"}
              className={`px-6 py-4 rounded-xl font-black text-lg transition-all ${
                status === "CLOSED" ? "bg-red-600 text-white shadow-lg scale-105" : "bg-white text-gray-500 hover:bg-gray-50 opacity-60"
              }`}
            >
              🔴 CLOSE
            </button>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 font-bold mb-1">Today's Sales</p>
          <p className="text-3xl font-black text-green-600">₹{(metrics.sales / 100).toFixed(2)}</p>
        </div>
        
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 font-bold mb-1">Today's Orders</p>
          <p className="text-3xl font-black">{metrics.orders}</p>
        </div>
        
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 font-bold mb-1">Average Bill</p>
          <p className="text-3xl font-black">₹{(metrics.avgBill / 100).toFixed(2)}</p>
        </div>
        
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 font-bold mb-1">Tables Active</p>
          <p className="text-3xl font-black text-orange-600">{metrics.tablesActive}</p>
        </div>
        
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 font-bold mb-1">Pending Orders</p>
          <p className="text-3xl font-black text-red-600">{metrics.pending}</p>
        </div>
        
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-500 font-bold mb-1">Completed Orders</p>
          <p className="text-3xl font-black text-blue-600">{metrics.completed}</p>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm">
          <p className="text-indigo-800 font-bold mb-1">QR Scans Today</p>
          <p className="text-3xl font-black text-indigo-900">{metrics.scans}</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm">
          <p className="text-indigo-800 font-bold mb-1">Conversion Rate</p>
          <p className="text-3xl font-black text-indigo-900">{metrics.conversion}%</p>
        </div>
      </div>

      {/* DAILY CLOSING */}
      <div className="bg-gray-50 border rounded-xl p-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Daily Closing</h2>
          <p className="text-gray-600">Generate today's sales report and close the register.</p>
        </div>
        <button 
          onClick={handleCloseDay}
          disabled={closing}
          className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800"
        >
          {closing ? "Processing..." : "Close Day"}
        </button>
      </div>

      {/* REPORT MODAL */}
      {report && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-8 text-center">
            <h2 className="text-2xl font-black mb-1">Daily Summary</h2>
            <p className="text-gray-500 mb-8">{report.date}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-gray-600">Total Sales</span>
                <span className="font-black">₹{(report.sales / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-gray-600">Total Orders</span>
                <span className="font-black">{report.orders}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-gray-600">Avg Bill</span>
                <span className="font-black">₹{(report.avgBill / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setReport(null)}
                className="flex-1 bg-gray-200 text-black px-4 py-3 rounded-lg font-bold hover:bg-gray-300"
              >
                Close
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-bold hover:bg-gray-800"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
