"use client";

import { useState } from "react";
import { Smartphone, Monitor, RotateCcw } from "lucide-react";
import { KitchenBoard } from "@/components/kitchen/KitchenBoard";

export default function InteractiveDemo() {
  const [view, setView] = useState<"phone" | "desktop">("phone");
  const [iframeKey, setIframeKey] = useState(0);

  const reset = () => setIframeKey((k) => k + 1);

  return (
    <div className="interactive-demo-root">
      {/* Controls */}
      <div className="demo-controls">
        <div className="demo-controls-left">
          <button
            className={`demo-toggle ${view === "phone" ? "active" : ""}`}
            onClick={() => setView("phone")}
          >
            <Smartphone className="w-4 h-4" /> Customer view
          </button>
          <button
            className={`demo-toggle ${view === "desktop" ? "active" : ""}`}
            onClick={() => setView("desktop")}
          >
            <Monitor className="w-4 h-4" /> Kitchen display
          </button>
        </div>
        <button className="demo-reset" onClick={reset} title="Restart demo">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Prompt */}
      <p className="demo-prompt">
        {view === "phone"
          ? "👇 This is the real SwiftTab menu. Scroll, tap items, add to cart — try it."
          : "👇 This is the real kitchen display. Click 'Next' to move orders through the workflow."}
      </p>

      {/* Device frame */}
      <div className={`demo-frame ${view === "phone" ? "demo-frame-phone" : "demo-frame-desktop"}`}>
        {/* Phone notch */}
        {view === "phone" && <div className="demo-notch" />}

        <div className="demo-screen">
          {view === "phone" ? (
            <iframe
              key={`${view}-${iframeKey}`}
              src="/menu/abc-cafe/12"
              className="demo-iframe"
              title="SwiftTab customer menu demo"
              allow="clipboard-write"
            />
          ) : (
            <div className="h-full w-full overflow-y-auto bg-white p-4" key={`${view}-${iframeKey}`}>
              <KitchenBoard />
            </div>
          )}
        </div>
      </div>

      {/* Hint */}
      <p className="demo-hint">
        {view === "phone"
          ? "This is not a video — it's the actual product running live."
          : "Simulates live Kitchen Display System (KDS) on any kitchen tablet or screen."}
      </p>

      <style jsx>{`
        .interactive-demo-root {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Controls bar */
        .demo-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 600px;
          margin-bottom: 1rem;
          gap: 0.75rem;
        }
        .demo-controls-left {
          display: flex;
          gap: 0.5rem;
        }
        .demo-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .demo-toggle:hover {
          border-color: #10b981;
          color: #0f172a;
        }
        .demo-toggle.active {
          background: #10b981;
          border-color: #10b981;
          color: #fff;
        }
        .demo-reset {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0.5rem 0.85rem;
          border-radius: 999px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .demo-reset:hover {
          border-color: #f97316;
          color: #f97316;
        }

        /* Prompt */
        .demo-prompt {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.25rem;
          text-align: center;
        }

        /* Phone frame */
        .demo-frame {
          position: relative;
          background: #0a0a0a;
          box-shadow:
            0 0 0 2px #2a2a2a,
            0 0 0 6px #111,
            0 25px 80px -15px rgba(0, 0, 0, 0.4),
            0 0 60px -10px rgba(16, 185, 129, 0.08);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .demo-frame-phone {
          width: 375px;
          height: 780px;
          padding: 14px;
          border-radius: 3rem;
        }
        .demo-frame-desktop {
          width: min(100%, 900px);
          height: 520px;
          border-radius: 1rem;
          padding: 8px;
        }

        /* Screen wrapper to clip iframe corners */
        .demo-screen {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #fff;
          position: relative;
          transform: translateZ(0); /* Forces clipping in webkit */
        }
        .demo-frame-phone .demo-screen {
          border-radius: 2.25rem;
        }
        .demo-frame-desktop .demo-screen {
          border-radius: 0.5rem;
        }

        /* Notch */
        .demo-notch {
          position: absolute;
          top: 13px; /* Just overlaps the inner screen edge */
          left: 50%;
          transform: translateX(-50%);
          width: 140px;
          height: 30px;
          background: #0a0a0a;
          border-radius: 0 0 1.25rem 1.25rem;
          z-index: 10;
        }

        /* iframe */
        .demo-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: #fff;
        }

        /* Hint */
        .demo-hint {
          margin-top: 0.75rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: #94a3b8;
          text-align: center;
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
          .demo-frame-phone {
            width: 320px;
            height: 660px;
            padding: 10px;
            border-radius: 2.5rem;
          }
          .demo-frame-phone .demo-screen {
            border-radius: 1.75rem;
          }
          .demo-notch {
            top: 9px;
            width: 110px;
            height: 24px;
          }
          .demo-controls {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
