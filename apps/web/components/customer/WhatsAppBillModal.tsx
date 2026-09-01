"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Check, X, ShieldCheck, ArrowRight, ReceiptText } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface WhatsAppBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  orderNumber?: number;
  totalPaise: number;
  tableNumber: number;
}

export function WhatsAppBillModal({
  isOpen,
  onClose,
  restaurantName,
  orderNumber,
  totalPaise,
  tableNumber
}: WhatsAppBillModalProps) {
  const [phone, setPhone] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    // Simulate WhatsApp bill dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 600);
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-2xl z-10 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Instant WhatsApp Bill</h3>
                <p className="text-xs text-slate-400">Table {tableNumber} · {restaurantName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white">Digital Bill Sent!</h4>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Your itemized GST receipt for <strong className="text-emerald-400 font-mono">{formatMoney(totalPaise)}</strong> has been sent to WhatsApp number <strong className="text-white font-mono">+91 {phone}</strong>.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span className="text-xs text-slate-300">Bill Total</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{formatMoney(totalPaise)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enter WhatsApp Number
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-700 focus-within:border-emerald-500 bg-slate-800">
                  <span className="px-3.5 py-3 text-xs font-bold text-slate-400 bg-slate-850 border-r border-slate-700 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3.5 py-3 text-sm text-white bg-transparent focus:outline-none placeholder-slate-500"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% spam-free digital receipt & order status updates.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || phone.length < 10}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isSubmitting ? "Generating Receipt..." : "Send Bill on WhatsApp"}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default WhatsAppBillModal;
