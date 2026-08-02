"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BrandingClient({ restaurant }: { restaurant: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    logoUrl: restaurant.logoUrl || "",
    coverImage: restaurant.coverImage || "",
    brandColor: restaurant.brandColor || "#000000",
    googleReviewUrl: restaurant.googleReviewUrl || "",
    upiQrUrl: restaurant.upiQrUrl || "",
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
        alert("Branding updated!");
        router.refresh();
      } else {
        alert("Failed to update branding");
      }
    } catch (err) {
      alert("Error saving branding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <label className="text-sm font-bold flex justify-between">
          Logo URL
          <span className="text-gray-400 font-normal">Optional</span>
        </label>
        <input 
          type="url" 
          value={formData.logoUrl} 
          onChange={e => setFormData({...formData, logoUrl: e.target.value})}
          className="w-full border p-2 rounded-lg"
          placeholder="https://..."
        />
        {formData.logoUrl && (
          <img src={formData.logoUrl} alt="Logo Preview" className="h-16 w-16 object-contain border rounded" />
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold flex justify-between">
          Cover Image URL
          <span className="text-gray-400 font-normal">Optional</span>
        </label>
        <input 
          type="url" 
          value={formData.coverImage} 
          onChange={e => setFormData({...formData, coverImage: e.target.value})}
          className="w-full border p-2 rounded-lg"
          placeholder="https://..."
        />
        {formData.coverImage && (
          <img src={formData.coverImage} alt="Cover Preview" className="h-32 w-full object-cover border rounded" />
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold">Brand Color (Hex code)</label>
        <div className="flex items-center gap-4">
          <input 
            type="color" 
            value={formData.brandColor} 
            onChange={e => setFormData({...formData, brandColor: e.target.value})}
            className="w-12 h-12 p-1 rounded-lg cursor-pointer"
          />
          <input 
            type="text" 
            value={formData.brandColor} 
            onChange={e => setFormData({...formData, brandColor: e.target.value})}
            className="w-32 border p-2 rounded-lg uppercase"
            pattern="^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$"
          />
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <label className="text-sm font-bold">Google Review URL</label>
        <p className="text-xs text-gray-500 mb-1">Customers will be redirected here after giving a 4-5 star rating.</p>
        <input 
          type="url" 
          value={formData.googleReviewUrl} 
          onChange={e => setFormData({...formData, googleReviewUrl: e.target.value})}
          className="w-full border p-2 rounded-lg"
          placeholder="https://g.page/r/..."
        />
      </div>

      <div className="space-y-2 pt-4 border-t">
        <label className="text-sm font-bold">UPI QR Code Image URL</label>
        <p className="text-xs text-gray-500 mb-1">Shown to customers on the digital bill.</p>
        <input 
          type="url" 
          value={formData.upiQrUrl} 
          onChange={e => setFormData({...formData, upiQrUrl: e.target.value})}
          className="w-full border p-2 rounded-lg"
          placeholder="https://..."
        />
        {formData.upiQrUrl && (
          <img src={formData.upiQrUrl} alt="UPI QR Preview" className="h-32 w-32 object-contain border rounded" />
        )}
      </div>

      <button 
        disabled={saving}
        className="bg-black text-white px-6 py-3 rounded-lg font-bold w-full md:w-auto mt-4"
      >
        {saving ? "Saving..." : "Save Branding"}
      </button>
    </form>
  );
}
