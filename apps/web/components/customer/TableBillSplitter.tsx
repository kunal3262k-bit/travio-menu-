"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Split, QrCode, Check, X, CreditCard, ChevronRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatMoney } from "@/lib/utils";

interface TableBillSplitterProps {
  isOpen: boolean;
  onClose: () => void;
  totalPaise: number;
  tableNumber: number;
  restaurantName: string;
  upiVpa?: string;
}

export function TableBillSplitter({
  isOpen,
  onClose,
  totalPaise,
  tableNumber,
  restaurantName,
  upiVpa = "swifttab@icici"
}: TableBillSplitterProps) {
  const [splitCount, setSplitCount] = useState(2);
  const [mode, setMode] = useState<"equal" | "qr">("equal");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || totalPaise === 0) return null;

  const perPersonPaise = Math.round(totalPaise / splitCount);
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(restaurantName)}&am=${(perPersonPaise / 100).toFixed(2)}&tn=${encodeURIComponent(`Table ${tableNumber} Share`)}&cu=INR`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-2xl z-10 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                <Split className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Table Bill Splitter</h3>
                <p className="text-xs text-slate-400">Table {tableNumber} · Total: {formatMoney(totalPaise)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {mode === "equal" ? (
            <div className="space-y-4">
              {/* Split selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Number of People Splitting
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSplitCount(num)}
                      className={`py-2.5 rounded-xl font-bold text-sm transition-all border ${
                        splitCount === num
                          ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-950/50"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Per Person Amount Display */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-800/80 to-slate-800/80 border border-purple-500/40 text-center space-y-1">
                <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Each Person Pays</span>
                <div className="text-3xl font-black text-white font-mono">
                  {formatMoney(perPersonPaise)}
                </div>
                <span className="text-[11px] text-slate-400">
                  {splitCount} shares × {formatMoney(perPersonPaise)} = {formatMoney(totalPaise)}
                </span>
              </div>

              <button
                onClick={() => setMode("qr")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <QrCode className="w-4 h-4" />
                <span>Show My UPI QR Code ({formatMoney(perPersonPaise)})</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-white rounded-2xl inline-block shadow-xl">
                <QRCodeSVG value={upiPayUrl} size={180} />
              </div>

              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Your Individual Share</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{formatMoney(perPersonPaise)}</span>
              </div>

              <p className="text-xs text-slate-300">
                Scan with Google Pay, PhonePe, or Paytm to pay your share directly.
              </p>

              <button
                onClick={() => setMode("equal")}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                ← Back to Split Calculator
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default TableBillSplitter;
