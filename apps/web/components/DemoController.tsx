"use client";

import { useState } from "react";
import { PlayCircle, Trash2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function DemoController() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const resetDemo = async () => {
    setLoading(true);
    await fetch("/api/demo/seed", { method: "POST" });
    setLoading(false);
    router.refresh();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition"
      >
        <PlayCircle className="w-5 h-5" /> Sales Mode
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border-2 border-indigo-600 p-4 rounded-2xl shadow-2xl w-72">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-indigo-900">Demo Controller</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="space-y-2">
        <button 
          onClick={resetDemo}
          disabled={loading}
          className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-semibold flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
          {loading ? "Resetting..." : "Reset Demo Database"}
        </button>
        <a 
          href="/menu/demo/1"
          target="_blank"
          className="w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold flex items-center gap-2 block"
        >
          📱 Open Customer View (T1)
        </a>
        <a 
          href="/admin"
          target="_blank"
          className="w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold flex items-center gap-2 block"
        >
          💻 Open Admin Dashboard
        </a>
      </div>
      
      <p className="text-xs text-gray-500 mt-4 text-center">Login with demo@swifttab.com / demo123</p>
    </div>
  );
}
