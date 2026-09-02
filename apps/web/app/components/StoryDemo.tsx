"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Scene {
  id: number;
  label: string;
  headline: string;
  description: string;
  image: string;
  imageAlt: string;
  device: "phone" | "desktop";
}

const scenes: Scene[] = [
  {
    id: 0,
    label: "STEP 1",
    headline: "Your customer scans the QR code",
    description:
      "No app download. No login. The menu loads instantly in their phone browser — ready to order in under 2 seconds.",
    image: "/demo/story-menu.png",
    imageAlt: "SwiftTab menu loading on a customer phone after scanning the QR code",
    device: "phone",
  },
  {
    id: 1,
    label: "STEP 2",
    headline: "They browse, tap, and add to cart",
    description:
      "Beautiful dish photos, calorie info, veg/non-veg tags. One tap to add. The floating cart bar shows the running total.",
    image: "/demo/story-add.png",
    imageAlt: "Customer adding Paneer Burger to cart with quantity selector visible",
    device: "phone",
  },
  {
    id: 2,
    label: "STEP 3",
    headline: "Cart confirms — order placed instantly",
    description:
      "Review items, check the total, hit Place Order. No waiter needed. The order flies straight to the kitchen.",
    image: "/demo/story-cart.png",
    imageAlt: "Customer cart showing two items with VIEW TABLE CART floating bar",
    device: "phone",
  },
  {
    id: 3,
    label: "STEP 4",
    headline: "The kitchen sees it in real time",
    description:
      "Orders appear on the Kitchen Display the moment they're placed. Table number, items, special instructions — all at a glance.",
    image: "/demo/kitchen.png",
    imageAlt: "SwiftTab kitchen display showing incoming orders with table numbers",
    device: "desktop",
  },
  {
    id: 4,
    label: "STEP 5",
    headline: "Split the bill. Pay. Done.",
    description:
      "Customers split the bill with friends, scan a UPI QR code, and leave. No awkward flag-the-waiter moment.",
    image: "/demo/customer-call-waiter.png",
    imageAlt: "SwiftTab split bill modal with UPI QR code for seamless payment",
    device: "phone",
  },
];

const SCENE_DURATION = 5000; // 5 seconds per scene

export default function StoryDemo() {
  const [activeScene, setActiveScene] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const nextScene = useCallback(() => {
    setActiveScene((prev) => (prev + 1) % scenes.length);
    setProgress(0);
  }, []);

  const goToScene = useCallback((index: number) => {
    setActiveScene(index);
    setProgress(0);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextScene();
          return 0;
        }
        return prev + 100 / (SCENE_DURATION / 50);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPaused, nextScene]);

  const scene = scenes[activeScene];

  return (
    <div
      className="story-demo"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Progress bar (5 segments) */}
      <div className="story-progress">
        {scenes.map((s, i) => (
          <button
            key={s.id}
            className={`story-progress-segment ${i === activeScene ? "active" : ""} ${i < activeScene ? "done" : ""}`}
            onClick={() => goToScene(i)}
            aria-label={`Go to ${s.label}`}
          >
            <div
              className="story-progress-fill"
              style={{
                width: i === activeScene ? `${progress}%` : i < activeScene ? "100%" : "0%",
              }}
            />
          </button>
        ))}
      </div>

      {/* Scene label */}
      <div className="story-label">{scene.label}</div>

      {/* Main content area */}
      <div className="story-content">
        {/* Text side */}
        <div className="story-text" key={scene.id}>
          <h3 className="story-headline">{scene.headline}</h3>
          <p className="story-description">{scene.description}</p>
        </div>

        {/* Device mockup side */}
        <div className="story-device-wrapper">
          <div className={`story-device ${scene.device === "desktop" ? "story-device-desktop" : "story-device-phone"}`}>
            <div className="story-device-screen" key={scene.id}>
              <Image
                src={scene.image}
                alt={scene.imageAlt}
                fill
                className="story-device-image"
                sizes="(max-width: 768px) 280px, 360px"
                priority={scene.id < 2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Play/pause indicator */}
      {isPaused && (
        <div className="story-paused-badge">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="1" width="3.5" height="10" rx="1" />
            <rect x="7.5" y="1" width="3.5" height="10" rx="1" />
          </svg>
          Paused — hover away to resume
        </div>
      )}

      <style jsx>{`
        .story-demo {
          position: relative;
          background: linear-gradient(135deg, #0a1a14 0%, #0d2818 25%, #112d1e 50%, #0a1a14 100%);
          border-radius: 1.25rem;
          padding: 2rem 2rem 2.5rem;
          overflow: hidden;
          min-height: 520px;
        }
        .story-demo::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Progress bar */
        .story-progress {
          display: flex;
          gap: 6px;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 2;
        }
        .story-progress-segment {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          overflow: hidden;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.2s;
        }
        .story-progress-segment:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .story-progress-fill {
          height: 100%;
          background: #10b981;
          border-radius: 4px;
          transition: width 0.05s linear;
        }

        /* Label */
        .story-label {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #10b981;
          margin-bottom: 1rem;
          position: relative;
          z-index: 2;
        }

        /* Content layout */
        .story-content {
          display: flex;
          align-items: center;
          gap: 3rem;
          position: relative;
          z-index: 2;
        }

        /* Text */
        .story-text {
          flex: 1;
          animation: storyFadeIn 0.5s ease-out;
        }
        .story-headline {
          font-size: 1.75rem;
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
        }
        .story-description {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.7;
          margin: 0;
        }

        /* Device mockup */
        .story-device-wrapper {
          flex-shrink: 0;
          position: relative;
        }
        .story-device {
          position: relative;
          border-radius: 2rem;
          overflow: hidden;
          box-shadow:
            0 0 0 3px rgba(255, 255, 255, 0.08),
            0 25px 60px -15px rgba(0, 0, 0, 0.5),
            0 0 80px -20px rgba(16, 185, 129, 0.15);
          background: #111;
        }
        .story-device-phone {
          width: 260px;
          height: 560px;
        }
        .story-device-desktop {
          width: 420px;
          height: 280px;
          border-radius: 0.75rem;
        }
        .story-device-screen {
          position: relative;
          width: 100%;
          height: 100%;
          animation: storySlideIn 0.6s ease-out;
        }
        .story-device-image {
          object-fit: cover;
          object-position: top;
        }

        /* Paused badge */
        .story-paused-badge {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          z-index: 3;
        }

        /* Animations */
        @keyframes storyFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes storySlideIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .story-demo {
            padding: 1.5rem 1.25rem 2rem;
            min-height: auto;
          }
          .story-content {
            flex-direction: column-reverse;
            gap: 1.5rem;
          }
          .story-headline {
            font-size: 1.35rem;
          }
          .story-description {
            font-size: 0.9rem;
          }
          .story-device-phone {
            width: 200px;
            height: 432px;
          }
          .story-device-desktop {
            width: 320px;
            height: 213px;
          }
        }
      `}</style>
    </div>
  );
}
