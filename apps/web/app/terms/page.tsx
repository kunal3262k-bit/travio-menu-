import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms under which restaurants use SwiftTab's QR ordering, kitchen display, and staff tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 md:p-12">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">SwiftTab</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: 11 August 2026</p>

        <div className="mt-8 space-y-8 leading-7 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900">1. The service</h2>
            <p className="mt-2">
              SwiftTab provides a QR table ordering system, a kitchen display system, and staff tools for restaurants
              in India. Customers scan a QR code, view the restaurant&apos;s menu in their phone browser, and place an
              order that is delivered to the restaurant&apos;s kitchen screen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. Accounts</h2>
            <p className="mt-2">
              You must provide accurate account information — restaurant name, owner name, phone number, and email —
              when you create an account. You are responsible for the activity on your account and for managing access
              for your staff.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. Subscription and fees</h2>
            <p className="mt-2">
              SwiftTab is offered at a flat monthly price, as shown on the pricing section of the website. There is no
              per-order commission and no percentage of sales. Subscription fee details, including any billing
              arrangements and applicable taxes, will be communicated to you before your account is activated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Payments between restaurants and customers</h2>
            <p className="mt-2">
              SwiftTab is not a payment processor. Customer payments are made directly to your restaurant by UPI or
              cash. You are responsible for collecting and confirming payments from your customers in accordance with
              applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Your responsibilities</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Your menu, prices, and item availability are your responsibility and must be accurate.</li>
              <li>You are responsible for displaying QR codes in your restaurant and car-side areas.</li>
              <li>You must comply with applicable food, safety, and consumer laws for your restaurant.</li>
              <li>You must not use the service for any unlawful purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">6. Availability</h2>
            <p className="mt-2">
              The service depends on an internet connection. We work to keep the service reliable but do not guarantee
              uninterrupted availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">7. Intellectual property</h2>
            <p className="mt-2">
              The SwiftTab software, branding, and website are owned by us or our licensors. Your menu and restaurant
              data belong to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">8. Limitation of liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by law, SwiftTab is not liable for indirect or consequential losses
              arising from your use of the service, including lost revenue or lost orders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">9. Contact</h2>
            <p className="mt-2">
              For questions about these terms, contact the SwiftTab team.
              {SUPPORT_EMAIL ? (
                <span>
                  {" "}
                  You can also write to us at{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-emerald-700 hover:text-emerald-900">
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </span>
              ) : null}
            </p>
          </section>
        </div>

        <p className="mt-8 border-t border-gray-100 pt-6 text-sm text-gray-500">
          <Link href="/" className="font-semibold text-emerald-700 hover:text-emerald-900">
            ← Back to SwiftTab
          </Link>
        </p>
      </div>
    </main>
  );
}
