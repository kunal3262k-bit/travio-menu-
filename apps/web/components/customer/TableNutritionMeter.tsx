"use client";

import React from "react";
import { Activity, Flame, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

interface TableNutritionMeterProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  isHighProtein?: boolean;
}

export function TableNutritionMeter({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  isHighProtein
}: TableNutritionMeterProps) {
  if (totalCalories === 0) return null;

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 text-white shadow-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="tracking-wide uppercase">Table Macro & Calorie Counter</span>
        </div>
        {isHighProtein && (
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[10px] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> High Protein Target!
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 text-center pt-1">
        <div className="p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
          <span className="block text-[9px] text-slate-400 font-semibold uppercase">Calories</span>
          <span className="text-sm font-black text-amber-400">{totalCalories} <span className="text-[9px] font-normal text-slate-400">kcal</span></span>
        </div>
        <div className="p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
          <span className="block text-[9px] text-slate-400 font-semibold uppercase">Protein</span>
          <span className="text-sm font-black text-blue-400">{totalProtein}g</span>
        </div>
        <div className="p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
          <span className="block text-[9px] text-slate-400 font-semibold uppercase">Fats</span>
          <span className="text-sm font-black text-emerald-400">{totalFat}g</span>
        </div>
        <div className="p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
          <span className="block text-[9px] text-slate-400 font-semibold uppercase">Carbs</span>
          <span className="text-sm font-black text-purple-400">{totalCarbs}g</span>
        </div>
      </div>
    </div>
  );
}
export default TableNutritionMeter;
