import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Shield } from "lucide-react";
import Navbar from "./components/Navbar";
import { CinemaStageHero } from "@/components/detailing/CinemaStageHero";
import { MotionMarquee } from "@/components/detailing/MotionMarquee";
import { PaintCorrectionInspector } from "@/components/detailing/PaintCorrectionInspector";
import { StickyStackCards } from "@/components/detailing/StickyStackCards";
import { ExoticFleetDeck } from "@/components/detailing/ExoticFleetDeck";
import { StudioRoiCalculator } from "@/components/detailing/StudioRoiCalculator";
import { ApexDemoSandbox } from "@/components/detailing/ApexDemoSandbox";
import { AwwwardsPricingSection } from "./components/AwwwardsPricingSection";
import { AmbientStageLights } from "@/components/detailing/AmbientStageLights";
import { IntakeWalkaroundSection } from "@/components/detailing/IntakeWalkaroundSection";
import { PosCompatibilitySection } from "@/components/detailing/PosCompatibilitySection";

export const metadata: Metadata = {
  title: "SwiftTab Auto — The Live Bay Tracker & Upsell OS for Auto Detailing Studios",
  description:
    "The modern bay dispatch, digital defect shield, and client experience platform for high-end auto detailing & PPF studios. Real-time vehicle tracking, 60s intake, and 1-tap service upsells.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SwiftTab Auto — The Live Bay Tracker & Upsell OS for Auto Detailing Studios",
    description:
      "Tesla-grade live bay tracking, 60s defect intake, and 1-tap add-on service approvals for ceramic coating and PPF studios.",
    url: "https://justswifttab.com",
    siteName: "SwiftTab Auto",
    type: "website",
  },
};

const detailingFaqs = [
  {
    q: "How does the 60-second digital defect intake protect my studio?",
    a: "When a customer drops off their car, your technician walks around with their phone and snaps 4-angle photos of existing scratches, rock chips, or curb rash. The client receives an automated SMS with the defect summary and signs off digitally before compounding starts, completely shielding your studio from false damage claims.",
  },
  {
    q: "Do car owners need to download an app or register an account?",
    a: "No. The live vehicle tracker opens instantly in any mobile browser (Safari, Chrome) via a secure, tokenized SMS link. There is zero login, no passwords, and no friction for your clients.",
  },
  {
    q: "How does the 1-tap service upsell engine work?",
    a: "When technicians spot dry leather or water spots under shop inspection lights, they tap a button to trigger a photo-backed recommendation to the client's live tracker (e.g. 'Ceramic Wheel Coating +$199'). The client approves with one tap, automatically updating the work order total.",
  },
  {
    q: "What hardware is required in our bays?",
    a: "Zero proprietary hardware. The Shop Bay Board runs in any modern browser on shop wall monitors, smart TVs, iPads, or technicians' smartphones. Works seamlessly with your existing equipment.",
  },
  {
    q: "Do you take a percentage or commission on our detailing jobs?",
    a: "No. SwiftTab charges 0% commission on your service revenue. You keep 100% of every paint correction, ceramic coating, and PPF job. You only pay a flat monthly or annual software subscription.",
  },
  {
    q: "Can I customize the platform with my studio's branding?",
    a: "Yes. Your logo, brand colors, studio name, and custom service catalog are displayed across the Shop Bay Board and client tracking portal.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#06080D] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "SwiftTab Auto",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "The live bay dispatch, digital defect shield, and client experience OS for auto detailing and PPF studios.",
            offers: [
              { "@type": "Offer", price: "99", priceCurrency: "USD", name: "Solo Craft Monthly" },
              { "@type": "Offer", price: "199", priceCurrency: "USD", name: "Pro Studio Monthly" },
              { "@type": "Offer", price: "349", priceCurrency: "USD", name: "Elite Multi-Bay Monthly" },
            ],
          }),
        }}
      />

      {/* Floating Ambient Stage Lights & Micro-Particles */}
      <AmbientStageLights />

      {/* Global Luxury Navigation */}
      <Navbar />

      {/* 1. Cinema Stage Hero with 4K Porsche & Interactive Continuous Laser Sweep */}
      <CinemaStageHero />

      {/* 2. Infinite Scrolling Filmstrip Marquee */}
      <MotionMarquee />

      {/* 3. Interactive Paint Correction Optical Laser Inspector */}
      <PaintCorrectionInspector />

      {/* 4. The 4-Card 3D Physical Stack with Spring Pop-Up HUD */}
      <StickyStackCards />

      {/* 5. 60-Second Digital Defect Intake Walkaround Workflow */}
      <IntakeWalkaroundSection />

      {/* 6. 3D Exotic Supercar Fleet Deck with Pop-Up Work Order Drawers */}
      <ExoticFleetDeck />

      {/* 7. Studio ROI & Revenue Velocity Calculator */}
      <StudioRoiCalculator />

      {/* 8. Zero POS Disruption Compatibility Layer */}
      <PosCompatibilitySection />

      {/* 7. Main Interactive Two-Way Sandbox Dock */}
      <section id="demo-sandbox" className="py-24 border-b border-zinc-800/80 bg-[#070A0F] relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
              <span>DUAL-ENGINE LIVE SANDBOX</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Test Both Sides of the Platform Live.
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg">
              Advance vehicles across shop bays on the left, and watch the client&apos;s live mobile tracker sync in real time on the right.
            </p>
          </div>

          <ApexDemoSandbox />
        </div>
      </section>

      {/* 8. Transparent Studio Pricing Section */}
      <AwwwardsPricingSection />

      {/* 9. Studio FAQ Section */}
      <section className="py-24 border-b border-zinc-800/80 bg-[#06080E] relative z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Everything Studio Owners Ask.
            </h2>
          </div>

          <div className="space-y-4">
            {detailingFaqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-6 transition-all [&_summary::-webkit-details-marker]:hidden open:border-emerald-500/40"
              >
                <summary className="flex cursor-pointer items-center justify-between text-base font-bold text-white">
                  <span>{faq.q}</span>
                  <span className="ml-4 shrink-0 rounded-full bg-zinc-800 p-1.5 text-emerald-400 transition group-open:rotate-180">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final Launch CTA Banner */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#07090D] via-[#091017] to-[#06080E] z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
            <Shield className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Give Your Studio the Finish It Deserves.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate pre-existing damage disputes, keep technicians in sync, and unlock +$1,450 in 1-tap add-on service approvals on every build.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-[0_0_35px_rgba(16,185,129,0.4)] active:scale-95 transition"
            >
              Start 14-Day Free Trial — Plans from $99/mo
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-sm border border-zinc-800 transition"
            >
              View Fullscreen Demo Sandbox
            </Link>
          </div>
          <p className="text-xs text-zinc-500 pt-2 font-mono">
            No credit card required to start · Instant setup in under 60 seconds
          </p>
        </div>
      </section>

      {/* 11. Luxury Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#05060A] py-12 px-6 text-xs text-zinc-500 relative z-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">SwiftTab Auto</span>
            <span>•</span>
            <span>The Detailing Studio Operating System</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-emerald-400 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-emerald-400 transition">
              Terms of Service
            </Link>
            <Link href="/demo" className="hover:text-emerald-400 transition">
              Interactive Demo
            </Link>
          </div>
          <div>
            © {new Date().getFullYear()} SwiftTab Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
