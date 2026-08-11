import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { KitchenBoard } from "@/components/kitchen/KitchenBoard";

export const metadata: Metadata = {
  title: "See SwiftTab in Action",
  description:
    "Watch a 50-second product walkthrough and explore the real SwiftTab workflow — from customer order to kitchen display.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="bg-[#f8f9fa] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Product tour</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
            See SwiftTab in action
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            From customer order to kitchen — see the workflow your restaurant staff actually uses.
          </p>
        </div>
      </section>

      {/* Video */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-xl">
            <video
              src="/demo.mp4"
              poster="/demo/poster.png"
              className="w-full aspect-video object-cover"
              controls
              playsInline
              preload="metadata"
            />
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-gray-400">
            Real SwiftTab product · 50 seconds · no narration required
          </p>
        </div>
      </section>

      {/* Workflow */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-emerald-700">The workflow</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black tracking-tight md:text-4xl">
            Three screens that keep your restaurant running
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {/* 01 — Customer */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">01</span>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Customer</p>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Image
                  src="/demo/customer-menu.png"
                  alt="SwiftTab customer menu — table ordering with categories, items, and prices"
                  width={390}
                  height={844}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Customers browse the restaurant menu from their phone — no app download, no login. The QR code on the table opens the menu directly in their browser.
              </p>
            </div>

            {/* 02 — Cart */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">02</span>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Cart</p>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Image
                  src="/demo/customer-cart.png"
                  alt="SwiftTab customer cart — selected items with subtotal and upsell recommendations"
                  width={390}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                The customer reviews their cart — quantities, subtotal, and smart recommendations — before submitting. Upsell suggestions appear naturally alongside the order.
              </p>
            </div>

            {/* 03 — Kitchen */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">03</span>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Kitchen</p>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <Image
                  src="/demo/kitchen.png"
                  alt="SwiftTab kitchen display — incoming orders with table number, items, and status"
                  width={1280}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Orders appear in the kitchen the moment they are placed. The kitchen staff sees the table, items, special instructions, and order status in a clean display.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive kitchen (deterministic, no backend) */}
      <section className="bg-[#f8f9fa] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-emerald-700">Try it yourself</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black tracking-tight md:text-4xl">
            The kitchen display — live with demo data
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
            This is the actual SwiftTab kitchen component, running with deterministic demo orders. Click &quot;Next&quot; or &quot;Done&quot; to see how orders move through the workflow.
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

      {/* Browse the demo menu */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">Browse the demo menu</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-600">
            See the real customer-facing menu — browse items, add to cart, and explore upsell recommendations.
            This is a browse-only demo; no orders are submitted.
          </p>
          <div className="mt-8">
            <Link
              href="/menu/abc-cafe/12"
              className="inline-block rounded-xl bg-emerald-700 px-8 py-4 text-lg font-bold text-white transition hover:bg-emerald-800"
            >
              Open the demo menu
            </Link>
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
              Get started at ₹999/month
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
