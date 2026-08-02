"use client";

import { useState } from "react";

export default function ReviewClient({ 
  restaurantName, 
  googleReviewUrl 
}: { 
  restaurantName: string, 
  googleReviewUrl: string 
}) {
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState<"RECEIPT" | "RATING" | "FEEDBACK_BAD" | "FEEDBACK_GOOD" | "DONE">("RECEIPT");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [privateFeedback, setPrivateFeedback] = useState("");

  const handleRating = async (stars: number) => {
    setRating(stars);
    if (stars >= 4) {
      setStep("FEEDBACK_GOOD");
      setLoadingAI(true);
      try {
        const res = await fetch("/api/feedback/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurantName, rating: stars })
        });
        const data = await res.json();
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch (err) {
        // Fallback suggestions
        setSuggestions(["Great food and excellent service!", "Loved the ambiance, will definitely visit again.", "Best place in town!"]);
      } finally {
        setLoadingAI(false);
      }
    } else {
      setStep("FEEDBACK_BAD");
    }
  };

  const copyAndReview = (text: string) => {
    navigator.clipboard.writeText(text);
    window.open(googleReviewUrl, "_blank");
    setStep("DONE");
  };

  if (step === "RECEIPT") {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2 className="text-3xl font-black">Payment Successful</h2>
        <p className="text-gray-500">Thank you for dining at {restaurantName}. Your receipt has been sent to your email (if provided).</p>
        
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
      <div className="bg-white rounded-xl shadow-sm p-8 border text-center space-y-8">
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

  if (step === "FEEDBACK_BAD") {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border space-y-6">
        <h2 className="text-2xl font-bold text-center">We're sorry to hear that.</h2>
        <p className="text-gray-500 text-center text-sm">
          Your feedback goes directly to the management so we can improve.
        </p>
        <textarea 
          value={privateFeedback}
          onChange={(e) => setPrivateFeedback(e.target.value)}
          placeholder="What could we do better?"
          className="w-full border-gray-300 rounded-lg p-3 min-h-[120px] outline-none focus:ring-2 focus:ring-black"
        />
        <button 
          onClick={() => setStep("DONE")}
          className="w-full bg-black text-white py-4 rounded-lg font-bold"
        >
          Send Feedback
        </button>
      </div>
    );
  }

  if (step === "FEEDBACK_GOOD") {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">You're awesome!</h2>
          <p className="text-gray-500 mt-2">
            Would you mind sharing your experience on Google? It helps us a lot. 
            We even wrote some suggestions for you!
          </p>
        </div>

        {loadingAI ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((sug, i) => (
              <button 
                key={i}
                onClick={() => copyAndReview(sug)}
                className="w-full text-left p-4 border rounded-lg hover:border-black hover:bg-gray-50 transition-colors text-sm text-gray-700"
              >
                "{sug}"
                <div className="text-xs text-blue-600 mt-2 font-bold flex items-center gap-1">
                  Copy & Open Google <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                </div>
              </button>
            ))}
          </div>
        )}
        
        <button 
          onClick={() => setStep("DONE")}
          className="w-full text-gray-400 font-medium text-sm mt-4 underline"
        >
          No thanks
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <h2 className="text-3xl font-black">All Done!</h2>
      <p className="text-gray-500">Have a great day.</p>
    </div>
  );
}
