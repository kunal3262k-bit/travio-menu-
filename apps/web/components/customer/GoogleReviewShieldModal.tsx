"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, X, ShieldAlert, Heart, ExternalLink, MessageSquare } from "lucide-react";

interface GoogleReviewShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  googleReviewUrl?: string | null;
  tableNumber: number;
}

export function GoogleReviewShieldModal({
  isOpen,
  onClose,
  restaurantName,
  googleReviewUrl,
  tableNumber
}: GoogleReviewShieldModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const activeRating = hoverRating || rating;

  const handleSelectStar = (stars: number) => {
    setRating(stars);
    if (stars >= 4) {
      // 4 or 5 stars -> Redirect to Google Maps review
      const targetUrl = googleReviewUrl || `https://www.google.com/search?q=${encodeURIComponent(restaurantName + " reviews")}`;
      setTimeout(() => {
        window.open(targetUrl, "_blank");
        setSubmitted(true);
      }, 400);
    }
  };

  const handlePrivateComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-2xl z-10 space-y-5 text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {submitted ? (
            <div className="py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7 fill-emerald-400" />
              </div>
              <h4 className="text-lg font-bold text-white">Thank You for Dining With Us!</h4>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                {rating >= 4
                  ? "Your review helps our kitchen and staff continue serving the best meals in town."
                  : "Your private feedback was immediately sent to the restaurant manager to ensure your next visit is flawless."}
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">How was your dining experience?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Table {tableNumber} · {restaurantName}</p>
              </div>

              {/* 5-Star Interactive Rating Selector */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleSelectStar(star)}
                    className="p-1.5 transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= activeRating
                          ? "text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-slate-600"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Dynamic Guidance depending on rating */}
              {rating > 0 && rating <= 3 && (
                <form onSubmit={handlePrivateComplaintSubmit} className="space-y-3 pt-2 text-left animate-fadeIn">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>We are so sorry we didn&apos;t meet your expectations. Please tell our manager what went wrong so we can make it right immediately.</span>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Tell our manager what we can improve (service, taste, timing)..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Send Directly to Manager
                  </button>
                </form>
              )}

              {rating >= 4 && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
                  <span>Opening Google Maps Review Page...</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
export default GoogleReviewShieldModal;
