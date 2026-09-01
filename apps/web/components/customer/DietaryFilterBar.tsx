"use client";

import React from "react";
import { Activity, Flame, Leaf, Wheat, Sparkles } from "lucide-react";

export type DietaryFilterType = "ALL" | "HIGH_PROTEIN" | "LOW_CALORIE" | "KETO" | "VEGAN" | "GLUTEN_FREE" | "POPULAR";

interface DietaryFilterBarProps {
  selectedFilter: DietaryFilterType;
  onSelectFilter: (filter: DietaryFilterType) => void;
  itemCounts?: Record<DietaryFilterType, number>;
}

export function DietaryFilterBar({
  selectedFilter,
  onSelectFilter,
  itemCounts
}: DietaryFilterBarProps) {
  const filters: { id: DietaryFilterType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "ALL", label: "All Items", icon: null, color: "emerald" },
    { id: "HIGH_PROTEIN", label: "High Protein (25g+)", icon: <Activity className="w-3.5 h-3.5" />, color: "blue" },
    { id: "LOW_CALORIE", label: "Under 400 kcal", icon: <Flame className="w-3.5 h-3.5" />, color: "amber" },
    { id: "KETO", label: "Keto Friendly", icon: <Sparkles className="w-3.5 h-3.5" />, color: "purple" },
    { id: "VEGAN", label: "100% Vegan", icon: <Leaf className="w-3.5 h-3.5" />, color: "emerald" },
    { id: "GLUTEN_FREE", label: "Gluten Free", icon: <Wheat className="w-3.5 h-3.5" />, color: "teal" }
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-1">
      <div className="flex items-center gap-2 min-w-max">
        {filters.map((f) => {
          const isSelected = selectedFilter === f.id;
          const count = itemCounts ? itemCounts[f.id] : undefined;

          return (
            <button
              key={f.id}
              onClick={() => onSelectFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-500/50 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {f.icon && <span className={isSelected ? "text-emerald-400" : "text-slate-500"}>{f.icon}</span>}
              <span>{f.label}</span>
              {typeof count === "number" && count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default DietaryFilterBar;
