"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileClient({ restaurant }: { restaurant: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: restaurant.name || "",
    cuisine: restaurant.cuisine || "",
    address: restaurant.address || "",
    phone: restaurant.phone || "",
    instagramUrl: restaurant.instagramUrl || "",
    facebookUrl: restaurant.facebookUrl || "",
    websiteUrl: restaurant.websiteUrl || "",
    isVegOnly: restaurant.isVegOnly || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/restaurant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Profile updated!");
        router.refresh();
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold">Restaurant Name</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full border p-2 rounded-lg"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold">Cuisine (e.g. Italian, North Indian)</label>
          <input 
            type="text" 
            value={formData.cuisine} 
            onChange={e => setFormData({...formData, cuisine: e.target.value})}
            className="w-full border p-2 rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={formData.isVegOnly} 
            onChange={e => setFormData({...formData, isVegOnly: e.target.checked})}
            className="w-4 h-4"
          />
          <span className="text-sm font-bold text-green-700">Pure Veg Restaurant</span>
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">Address</label>
        <textarea 
          value={formData.address} 
          onChange={e => setFormData({...formData, address: e.target.value})}
          className="w-full border p-2 rounded-lg min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">Phone Number</label>
        <input 
          type="text" 
          value={formData.phone} 
          onChange={e => setFormData({...formData, phone: e.target.value})}
          className="w-full border p-2 rounded-lg"
        />
      </div>

      <h3 className="text-lg font-bold pt-4 border-t">Social Links</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">Instagram</span>
          <input 
            type="url" 
            value={formData.instagramUrl} 
            onChange={e => setFormData({...formData, instagramUrl: e.target.value})}
            className="flex-1 border p-2 rounded-lg"
            placeholder="https://instagram.com/..."
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">Facebook</span>
          <input 
            type="url" 
            value={formData.facebookUrl} 
            onChange={e => setFormData({...formData, facebookUrl: e.target.value})}
            className="flex-1 border p-2 rounded-lg"
            placeholder="https://facebook.com/..."
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">Website</span>
          <input 
            type="url" 
            value={formData.websiteUrl} 
            onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
            className="flex-1 border p-2 rounded-lg"
            placeholder="https://..."
          />
        </div>
      </div>

      <button 
        disabled={saving}
        className="bg-black text-white px-6 py-3 rounded-lg font-bold w-full md:w-auto"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
