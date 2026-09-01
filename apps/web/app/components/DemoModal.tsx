"use client";

import { useState, useRef, useCallback } from "react";
import { PlayCircle, X } from "lucide-react";

export default function DemoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-white font-bold text-base border border-emerald-500/25 transition-all flex items-center justify-center gap-2.5 hover:border-emerald-500/40"
      >
        <PlayCircle className="w-5 h-5 text-emerald-400" /> Watch Interactive Demo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
            <video
              ref={videoRef}
              src="/demo.mp4"
              poster="/demo/poster.png"
              className="w-full h-full object-cover"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      )}
    </>
  );
}
