"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";

export default function FeedbackPortalClient({ initialFeedbacks }: { initialFeedbacks: any[] }) {
  const [feedbacks] = useState<any[]>(initialFeedbacks);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filtered = filterRating
    ? feedbacks.filter((f) => f.rating === filterRating)
    : feedbacks;

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "N/A";

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold text-xl">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Average Rating</p>
            <p className="text-3xl font-black text-slate-900">{avgRating} / 5</p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Submissions</p>
            <p className="text-3xl font-black text-slate-900">{feedbacks.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterRating(null)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            filterRating === null ? "bg-slate-900 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
          }`}
        >
          All ({feedbacks.length})
        </button>
        {[5, 4, 3, 2, 1].map((r) => {
          const count = feedbacks.filter((f) => f.rating === r).length;
          return (
            <button
              key={r}
              onClick={() => setFilterRating(r)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filterRating === r ? "bg-slate-900 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r} ★ ({count})
            </button>
          );
        })}
      </div>

      {/* Feedback Feed */}
      {filtered.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">
          <p className="font-bold text-lg">No feedback found</p>
          <p className="text-sm mt-1">Customer comments and ratings will appear here as orders are reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white border rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 text-amber-400 text-lg">
                  {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                  <span className="text-xs font-bold text-slate-700 ml-2">({item.rating}/5)</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              {item.comment ? (
                <p className="text-slate-800 text-sm font-medium bg-slate-50 p-4 rounded-xl border">
                  "{item.comment}"
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">No written comment provided.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
