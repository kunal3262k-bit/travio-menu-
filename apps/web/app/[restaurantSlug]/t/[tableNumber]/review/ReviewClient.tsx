"use client";

import { useState } from "react";

export default function ReviewClient({ 
  restaurantName, 
  googleReviewUrl,
  restaurantSlug
}: { 
  restaurantName: string; 
  googleReviewUrl: string;
  restaurantSlug?: string;
}) {
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState<"RECEIPT" | "RATING" | "FEEDBACK" | "DONE">("RECEIPT");
  const [privateFeedback, setPrivateFeedback] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const rawUrl = googleReviewUrl ? googleReviewUrl.trim() : "";
  const normalizedGoogleUrl = rawUrl
    ? (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`)
    : null;

  const handleRating = (stars: number) => {
    setRating(stars);
    setStep("FEEDBACK");
  };

  const handleOpenGoogle = () => {
    if (normalizedGoogleUrl) {
      window.open(normalizedGoogleUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("Note: No Google Review link configured for this restaurant.");
    }
  };

  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true);
    try {
      if (restaurantSlug) {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantSlug,
            rating,
            comment: privateFeedback
          })
        });
      }
    } catch (e) {
      console.error("Failed to submit feedback:", e);
    } finally {
      setSubmittingFeedback(false);
      setStep("DONE");
    }
  };

  if (step === "RECEIPT") {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border text-center space-y-6 max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2 className="text-3xl font-black">Payment Successful</h2>
        <p className="text-gray-500">Thank you for dining at {restaurantName}.</p>
        
        <button 
          onClick={() => setStep("RATING")}
          className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg mt-8"
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === "RATING") {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border text-center space-y-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold">How was your experience?</h2>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star}
              onClick={() => handleRating(star)}
              className="text-5xl text-gray-200 hover:text-yellow-400 hover:scale-110 transition-transform"
            >
              ★
            </button>
          ))}
        </div>
      </div>
    );
  }


  const getAiSuggestions = (stars: number) => {
    switch (stars) {
      case 5:
        return [
          "Delicious food, super quick QR service, and lovely atmosphere! 🌟",
          "Best dining experience! High quality ingredients & great portion sizes.",
          "Fast order processing, seamless digital payment, highly recommended!"
        ];
      case 4:
        return [
          "Great taste and quick service overall! Enjoyed the meal.",
          "Good food quality and seamless digital ordering experience.",
          "Clean table, courteous service, and tasty dishes."
        ];
      case 3:
        return [
          "Decent food quality, but waiting time was slightly longer than expected.",
          "Taste was okay, would love to see more options on the menu.",
          "Average experience overall, scope for service improvement."
        ];
      case 2:
      case 1:
      default:
        return [
          "Food service was slow and order accuracy needs improvement.",
          "Table service was delayed and food was lukewarm.",
          "Scope for better customer support and quicker turnaround."
        ];
    }
  };

  const handleSelectAiSuggestion = (suggestion: string) => {
    setPrivateFeedback(suggestion);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(suggestion).catch(() => {
          fallbackCopyText(suggestion);
        });
      } else {
        fallbackCopyText(suggestion);
      }
    } catch (_) {
      fallbackCopyText(suggestion);
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch (_) {}
  };

  if (step === "FEEDBACK") {
    const aiSuggestions = getAiSuggestions(rating);

    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border space-y-6 max-w-md mx-auto relative">
        {copiedToast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-2 rounded-full font-bold shadow-lg animate-bounce z-50">
            ✨ AI Review Copied to Clipboard!
          </div>
        )}

        <div className="text-center space-y-2">
          <div className="text-2xl text-yellow-400">
            {"★".repeat(rating)}{"☆".repeat(5 - rating)}
          </div>
          <h2 className="text-xl font-bold">Thank you for rating us!</h2>
          <p className="text-sm text-gray-500">
            Tap an AI suggestion below to copy a ready-made review!
          </p>
        </div>

        {/* ✨ AI SUGGESTION CHIPS */}
        <div className="space-y-2 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
          <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
            ✨ Instant AI Review Suggestions ({rating}★)
          </label>
          <div className="flex flex-col gap-2">
            {aiSuggestions.map((text, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAiSuggestion(text)}
                className="text-left text-xs bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 p-2.5 rounded-lg transition-colors flex items-center justify-between gap-2 shadow-sm font-medium"
              >
                <span>"{text}"</span>
                <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-bold whitespace-nowrap">
                  Tap to Copy
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Public Google Review Button */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-900 text-center">Public Google Review</p>
          {normalizedGoogleUrl ? (
            <a 
              href={normalizedGoogleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2 text-center"
            >
              ⭐ Write a Review on Google Maps
            </a>
          ) : (
            <button 
              onClick={handleOpenGoogle}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              ⭐ Write a Review on Google Maps
            </button>
          )}
        </div>

        {/* Comment Box */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Review / Feedback Text</label>
          <textarea 
            value={privateFeedback}
            onChange={(e) => setPrivateFeedback(e.target.value)}
            placeholder="Selected AI review will appear here..."
            className="w-full border-gray-300 rounded-lg p-3 min-h-[90px] text-sm outline-none focus:ring-2 focus:ring-black border"
          />
        </div>

        <button 
          onClick={handleSubmitFeedback}
          disabled={submittingFeedback}
          className="w-full bg-black text-white py-3.5 rounded-lg font-bold disabled:opacity-50"
        >
          {submittingFeedback ? "Submitting..." : "Complete Review"}
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4 max-w-md mx-auto pt-12">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h2 className="text-3xl font-black">All Done!</h2>
      <p className="text-gray-500">Thank you for helping us improve!</p>
    </div>
  );
}
