"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

export default function AvailabilityClient({ categories }: { categories: any[] }) {
  const router = useRouter();
  
  // Flatten items for easy state management
  const allItems = categories.flatMap(c => c.items);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    Object.fromEntries(allItems.map(i => [i.id, i.available]))
  );

  const toggleAvailability = async (itemId: string) => {
    const current = availability[itemId];
    const updated = !current;
    
    // Optimistic UI update
    setAvailability(prev => ({ ...prev, [itemId]: updated }));
    
    try {
      const res = await fetch("/api/menu/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, available: updated })
      });
      
      if (!res.ok) throw new Error();
      
      // Emit socket event so customers see the out of stock immediately
      // Actually this requires knowing restaurantId, but let's just refresh customer side.
      // Or simply do nothing since the next customer opening menu sees it, and Next.js revalidates.
      router.refresh();
    } catch (e) {
      // Revert on error
      setAvailability(prev => ({ ...prev, [itemId]: current }));
      alert("Failed to update availability.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-14 lg:top-0 bg-gray-50 pt-2 pb-4 z-10">
        <input 
          type="search" 
          placeholder="Search items to 86..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:outline-none text-lg font-medium shadow-sm"
        />
      </div>
      
      {categories.map(category => {
        const filteredItems = category.items.filter((item: any) => 
          item.name.toLowerCase().includes(search.toLowerCase())
        );
        
        if (filteredItems.length === 0) return null;

        return (
          <div key={category.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <h2 className="bg-gray-50 text-xl font-bold p-4 border-b">{category.name}</h2>
            <div className="divide-y">
              {filteredItems.map((item: any) => (
              <div key={item.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${!availability[item.id] ? "opacity-50 bg-gray-50 grayscale" : ""}`}>
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {item.foodType === "VEG" ? (
                      <span className="w-4 h-4 border-2 border-green-600 rounded-sm flex items-center justify-center">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      </span>
                    ) : (
                      <span className="w-4 h-4 border-2 border-red-600 rounded-sm flex items-center justify-center">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      </span>
                    )}
                    {item.name}
                  </h3>
                  <p className="text-gray-500 font-medium mt-1">₹{(item.pricePaise / 100).toFixed(2)}</p>
                </div>
                
                <button
                  onClick={() => toggleAvailability(item.id)}
                  className={`px-6 py-3 rounded-lg font-black text-lg transition-colors min-w-[140px] ${
                    availability[item.id] 
                      ? "bg-white border-2 border-green-500 text-green-700 hover:bg-green-50" 
                      : "bg-red-100 border-2 border-red-500 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {availability[item.id] ? "⭕ Available" : "❌ Sold Out"}
                </button>
              </div>
            ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
