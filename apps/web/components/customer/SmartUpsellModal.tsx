"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, X, Utensils } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { Dish3DModalItem } from "./Dish3DModal";

interface SmartUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerItemName: string;
  recommendedItems: any[];
  onAddRecommendedItem: (item: any) => void;
}

export function SmartUpsellModal({
  isOpen,
  onClose,
  triggerItemName,
  recommendedItems,
  onAddRecommendedItem
}: SmartUpsellModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || recommendedItems.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 text-white shadow-2xl z-10 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Popular Chef Pairings</h3>
                <p className="text-xs text-slate-300">
                  Guests ordering <span className="font-semibold text-emerald-400">{triggerItemName}</span> also love:
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Recommended Items List */}
          <div className="space-y-2.5">
            {recommendedItems.slice(0, 3).map((recItem) => (
              <div
                key={recItem.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                    {recItem.imageUrl ? (
                      <Image
                        src={recItem.imageUrl}
                        alt={recItem.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Utensils className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{recItem.name}</h4>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {formatMoney(recItem.pricePaise)}
                    </span>
                    {recItem.proteinGrams && (
                      <span className="ml-2 text-[10px] text-blue-300 font-semibold">
                        💪 {recItem.proteinGrams}g Protein
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onAddRecommendedItem(recItem);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            No thanks, continue to cart
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default SmartUpsellModal;
