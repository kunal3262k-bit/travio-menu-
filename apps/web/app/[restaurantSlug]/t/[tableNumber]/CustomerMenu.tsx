"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  name: string;
  pricePaise: number;
  foodType: string;
  imageUrl: string | null;
  description: string | null;
};

type Category = {
  id: string;
  name: string;
  items: Item[];
};

type CartItem = Item & { quantity: number; instructions: string };

import { io } from "socket.io-client";

export default function CustomerMenu({
  restaurant,
  table,
  categories
}: {
  restaurant: any;
  table: any;
  categories: Category[];
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

  const addToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1, instructions: "" }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => 
      prev.map((i) => {
        if (i.id === id) {
          const newQ = i.quantity + delta;
          return newQ > 0 ? { ...i, quantity: newQ } : i;
        }
        return i;
      }).filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.pricePaise * item.quantity), 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant.slug,
          tableNumber: table.number,
          items: cart.map(i => ({
            menuItemId: i.id,
            quantity: i.quantity,
            instructions: i.instructions || undefined
          }))
        })
      });

      if (!res.ok) throw new Error("Failed to place order");
      
      const { order } = await res.json();
      
      // Emit socket event
      const socket = io();
      socket.emit("new_order", { restaurantId: restaurant.id, orderId: order.id });
      
      // Clear cart
      setCart([]);
      
      // Redirect to Order Tracking Page
      router.push(`/${restaurant.slug}/t/${table.number}/order/${order.id}`);
      
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-6 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-500 text-sm font-medium">Table {table.number}</p>
      </header>

      {/* Menu Categories */}
      <div className="max-w-2xl mx-auto p-4 space-y-8">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">{cat.name}</h2>
            <div className="space-y-4">
              {cat.items.map((item) => (
                <div key={item.id} className="bg-white border rounded-lg p-4 flex gap-4 shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm border ${item.foodType === "VEG" ? "border-green-600 bg-green-100" : item.foodType === "NON_VEG" ? "border-red-600 bg-red-100" : "border-yellow-600 bg-yellow-100"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-[2px] ${item.foodType === "VEG" ? "bg-green-600" : item.foodType === "NON_VEG" ? "bg-red-600" : "bg-yellow-600"}`} />
                      </div>
                      <h3 className="font-bold">{item.name}</h3>
                    </div>
                    <p className="text-gray-700 font-medium mt-1">{formatPrice(item.pricePaise)}</p>
                    {item.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
                  </div>
                  
                  <div className="flex flex-col items-end justify-between">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-md object-cover bg-gray-100" />
                    ) : (
                      <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => addToCart(item)}
                      className="mt-2 bg-black text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-sm active:scale-95 transition-transform"
                    >
                      ADD +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{cart.reduce((a,b)=>a+b.quantity, 0)} items</p>
              <p className="font-bold text-lg">{formatPrice(cartTotal)}</p>
            </div>
            
            {/* Extremely simple cart expanding could happen here, but for "Speed > Fancy UI", 
                we'll just let them place the order directly, or open a basic native dialog / summary inline. */}
            <button 
              onClick={placeOrder}
              disabled={isSubmitting}
              className="bg-black text-white px-8 py-3 rounded-lg font-bold text-lg disabled:opacity-50 active:scale-95 transition-transform"
            >
              {isSubmitting ? "Sending..." : "Place Order →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
