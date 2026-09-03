import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { KitchenBoard } from "@/components/kitchen/KitchenBoard";
import InteractiveDemo from "@/app/components/InteractiveDemo";

export const metadata: Metadata = {
  title: "See SwiftTab in Action — Try the Live Demo",
  description:
    "Try the real SwiftTab product right in your browser. Browse the menu, add items, and see how orders flow to the kitchen display.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="bg-[#f8f9fa] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Live product demo</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
            Try SwiftTab right now
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            No sign-up. No video. This is the actual product — browse the menu, add items to cart, and see orders land in the kitchen display.
          </p>
        </div>
      </section>

      {/* Interactive Demo — the main attraction */}
      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <InteractiveDemo />
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="bg-[#f8f9fa] px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-emerald-700">How it works</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black tracking-tight md:text-4xl">
            Three steps. Zero friction.
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-2xl font-black text-emerald-800">
                1
              </div>
              <h3 className="mt-4 text-lg font-bold">Customer scans QR</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                The QR code on each table opens the menu instantly in any phone browser. No app download, no login.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-2xl font-black text-emerald-800">
                2
              </div>
              <h3 className="mt-4 text-lg font-bold">They order from their phone</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Browse dishes with photos, calorie info, and veg/non-veg tags. Add to cart and place the order in seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-2xl font-black text-emerald-800">
                3
              </div>
              <h3 className="mt-4 text-lg font-bold">Kitchen gets it instantly</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Orders appear in real-time on the Kitchen Display. Table number, items, and status — all at a glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive kitchen */}
      <section id="kitchen-board" className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-emerald-700">Try it yourself</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black tracking-tight md:text-4xl">
            The kitchen display — live with demo data
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
            This is the actual SwiftTab kitchen component. Click &quot;Next&quot; or &quot;Done&quot; to see how orders move through the workflow.
          </p>
          <div className="mt-8 rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            <KitchenBoard />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-gray-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> No database required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> No authentication
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Runs entirely in the browser
            </span>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-emerald-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">Ready to try SwiftTab?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100">
            Create your restaurant account and go live the same day.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block rounded-xl bg-white px-8 py-4 text-lg font-bold text-emerald-950 transition hover:bg-emerald-50"
            >
              Start 3-Day Free Trial — Plans from ₹2,999/mo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
