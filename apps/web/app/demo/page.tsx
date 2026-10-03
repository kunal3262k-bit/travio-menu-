import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Shield, Sparkles } from "lucide-react";
import { ApexDemoSandbox } from "@/components/detailing/ApexDemoSandbox";

export const metadata: Metadata = {
  title: "ApexBay Live Demo — The Auto Detailing & PPF Studio OS",
  description:
    "Try the live ApexBay interactive sandbox. See how car drop-off, shop bay dispatch, and client mobile live tracking sync in real time.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#070D0B] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top Banner */}
      <section className="relative overflow-hidden pt-16 pb-14 border-b border-emerald-950/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-700/50 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-lg shadow-emerald-950/50">
            <Sparkles className="w-3.5 h-3.5" /> LIVE INTERACTIVE PRODUCT DEMO
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-white">
            Experience ApexBay in Real Time
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-400">
            No signup required. Test both sides of the platform below: advance vehicles across the Shop Bay Board on the left, and watch the client&apos;s live mobile tracker update instantly on the right.
          </p>
        </div>
      </section>

      {/* Main Interactive Sandbox */}
      <section className="px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <ApexDemoSandbox />
        </div>
      </section>

      {/* How it Works: 3 Steps for Detailing Studios */}
      <section className="border-t border-emerald-950/60 bg-[#0A120E] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">How It Works in Your Shop</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-white">
              Built for Speed in Dusty, High-Pressure Bays
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="p-6 rounded-2xl bg-[#070D0B] border border-emerald-950/70 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xl font-black text-emerald-400 font-mono">
                01
              </div>
              <h3 className="text-base font-bold text-white">60-Sec Intake & Defect Scan</h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Technician walks around the vehicle, snaps 4-angle defect photos, and logs pre-existing scratches. The customer signs off digitally via SMS, shielding your studio from false damage claims.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#070D0B] border border-emerald-950/70 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xl font-black text-emerald-400 font-mono">
                02
              </div>
              <h3 className="text-base font-bold text-white">Live Bay Dispatch Board</h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Mount on shop TVs or hand to technicians on iPads. Move cars from Decon $\rightarrow$ Paint Correction $\rightarrow$ Cleanroom $\rightarrow$ Curing with a single tap. Audio chimes keep the crew in sync.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#070D0B] border border-emerald-950/70 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xl font-black text-emerald-400 font-mono">
                03
              </div>
              <h3 className="text-base font-bold text-white">Client Live Tracker & 1-Tap Upsell</h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Car owners watch their vehicle&apos;s progress in real-time. When technicians spot swirl marks or dry leather, they trigger 1-tap add-on recommendations that clients approve on the spot.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Zero proprietary hardware required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Runs on any iPad, iPhone, Android, or TV
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 14-day risk-free trial on your bays
            </span>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-emerald-950/80 bg-gradient-to-b from-[#0A140F] to-[#070D0B] px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-white">
            Ready to upgrade your shop&apos;s client experience?
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Eliminate damage disputes, stop manual text updates, and add \$200–\$500 in upsells to every high-ticket detailing job.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-900/40 active:scale-95 transition text-center"
            >
              Start 14-Day Free Trial — Plans from $99/mo
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-800 transition text-center"
            >
              View Full Platform Details
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
