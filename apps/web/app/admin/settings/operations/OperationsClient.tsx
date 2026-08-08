"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OperationsClient({ restaurant }: { restaurant: any }) {
  const router = useRouter();
  const settings = restaurant.settings || {};
  
  const [status, setStatus] = useState(restaurant.status);
  const [businessHours, setBusinessHours] = useState(settings.businessHours || "Mon-Sun, 09:00 AM - 11:00 PM");
  const [openTime, setOpenTime] = useState(settings.openTime || "09:00");
  const [closeTime, setCloseTime] = useState(settings.closeTime || "23:00");
  const [gstEnabled, setGstEnabled] = useState(settings.gstEnabled !== false); // default true
  const [gstPercentage, setGstPercentage] = useState(settings.gstPercentage || 5);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/restaurant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          settings: {
            ...settings,
            businessHours,
            openTime,
            closeTime,
            gstEnabled,
            gstPercentage: parseInt(gstPercentage, 10)
          }
        })
      });
      if (res.ok) {
        alert("Operations updated!");
        router.refresh();
      } else {
        alert("Failed to update operations");
      }
    } catch (err) {
      alert("Error saving operations");
    } finally {
      setSaving(false);
    }
  };

  const getStatusDescription = (s: string) => {
    switch(s) {
      case "LIVE": return "Accepting orders normally.";
      case "PAUSED": return "Menu is visible, but ordering is disabled.";
      case "TEMPORARILY_BUSY": return "Kitchen is busy. Customers see a wait time message.";
      case "CLOSED": return "Restaurant is closed. Customers cannot place orders.";
      case "SETUP": return "Still configuring restaurant.";
      default: return "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      
      {/* Restaurant Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold border-b pb-2">Restaurant Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["LIVE", "TEMPORARILY_BUSY", "PAUSED", "CLOSED"].map(s => (
            <div 
              key={s}
              onClick={() => setStatus(s)}
              className={`border-2 p-4 rounded-xl cursor-pointer transition-colors ${
                status === s ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">{s.replace("_", " ")}</span>
                <input type="radio" checked={status === s} readOnly className="w-4 h-4 text-black" />
              </div>
              <p className="text-sm text-gray-500">{getStatusDescription(s)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Operating Hours & Unmanned Detection Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-bold">Operating Hours & Unmanned Role Detection</h3>
        <p className="text-xs text-gray-500">
          Used to trigger Unmanned Role Warnings on the Admin Dashboard if kitchen or waiter panels have no active staff 15+ minutes after opening.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Daily Opening Time (24h) *</label>
            <input
              type="time"
              required
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className="w-full border p-2.5 rounded-lg text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Daily Closing Time (24h) *</label>
            <input
              type="time"
              required
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className="w-full border p-2.5 rounded-lg text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-sm font-medium text-gray-600">Customer Display Business Hours Label</label>
          <input 
            type="text" 
            value={businessHours} 
            onChange={e => setBusinessHours(e.target.value)}
            className="w-full border p-2 rounded-lg"
            placeholder="e.g., Mon-Sun, 09:00 AM - 11:00 PM"
          />
        </div>
      </div>

      {/* GST Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-bold">Billing & Taxes</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={gstEnabled} 
              onChange={e => setGstEnabled(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-bold">Enable GST Calculation</span>
          </label>
          
          {gstEnabled && (
            <div className="pl-8 space-y-2">
              <label className="text-sm font-medium">GST Percentage (%)</label>
              <input 
                type="number" 
                value={gstPercentage} 
                onChange={e => setGstPercentage(e.target.value)}
                className="w-32 border p-2 rounded-lg"
                min="0" max="100"
              />
            </div>
          )}
        </div>
      </div>

      <button 
        disabled={saving}
        className="bg-black text-white px-6 py-3 rounded-lg font-bold w-full md:w-auto mt-8"
      >
        {saving ? "Saving..." : "Save Operations"}
      </button>
    </form>
  );
}
