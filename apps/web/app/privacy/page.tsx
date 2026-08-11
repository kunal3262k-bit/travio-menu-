import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How SwiftTab collects, uses, and protects data for restaurants using its QR ordering and kitchen display software.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 md:p-12">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">SwiftTab</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: 11 August 2026</p>

        <div className="mt-8 space-y-8 leading-7 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-slate-900">1. Overview</h2>
            <p className="mt-2">
              SwiftTab provides QR table ordering, a kitchen display system, and staff tools for restaurants in India.
              This policy explains what information we collect when a restaurant creates an account and uses the
              service, and how we use and protect it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">2. Information we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Restaurant account information:</strong> restaurant name, owner name, phone number, and email
                address that you provide when creating an account.
              </li>
              <li>
                <strong>Menu and operational data:</strong> menu items, prices, photos, table and QR configuration, and
                order history created while using the service.
              </li>
              <li>
                <strong>Staff information:</strong> names and login details of staff members you choose to add to use
                the kitchen and staff screens.
              </li>
              <li>
                <strong>Order information:</strong> order contents, table numbers, timestamps, and payment status
                generated as customers place orders.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">3. How we use information</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To operate the service, including delivering orders to the kitchen display and staff screens.</li>
              <li>To provide onboarding support and respond to your requests.</li>
              <li>To send service-related communications about your account.</li>
              <li>To keep the service secure and diagnose technical issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">4. Payments</h2>
            <p className="mt-2">
              SwiftTab is not a payment processor. Customers pay your restaurant directly by UPI or cash, and SwiftTab
              does not receive or store payment instrument details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">5. Sharing information</h2>
            <p className="mt-2">
              We do not sell personal information. We share information only with service providers that host and
              operate the infrastructure the service runs on, and only as needed to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">6. Security</h2>
            <p className="mt-2">
              The service is served over HTTPS, accounts are protected by passwords, and access to kitchen and staff
              screens is restricted to staff you add. No security system is completely foolproof, and we work to keep
              your data safe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">7. Your rights</h2>
            <p className="mt-2">
              You can access and correct the account information you provided, and you can delete your account and
              associated data by contacting us. We process personal data in accordance with the Digital Personal Data
              Protection Act, 2023, and applicable Indian law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900">8. Contact</h2>
            <p className="mt-2">
              For privacy questions, contact the SwiftTab team. We will respond as soon as possible.
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

          <section>
            <h2 className="text-xl font-bold text-slate-900">9. Changes</h2>
            <p className="mt-2">
              We may update this policy as the service evolves. When we do, we will update the date at the top of this
              page.
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
