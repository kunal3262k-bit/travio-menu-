import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/site-config";
import { Scale, FileCheck, AlertTriangle, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | SwiftTab Auto",
  description:
    "Terms of Service governing the use of SwiftTab Auto — the operating system for automotive detailing, PPF, and ceramic coating studios.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#05070B] text-zinc-100 px-4 sm:px-6 py-16 sm:py-24 selection:bg-amber-500/20 selection:text-amber-200">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to SwiftTab Auto
          </Link>
        </div>

        {/* Header Hero */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-8 sm:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono tracking-wider uppercase mb-4">
            <Scale className="w-3.5 h-3.5" />
            Studio Software Agreement
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm font-mono text-zinc-400">
            Last Updated: October 2, 2026 • Platform: SwiftTab Auto (justswifttab.com)
          </p>

          <div className="mt-8 pt-8 border-t border-zinc-800/80 space-y-10 leading-relaxed text-zinc-300 text-sm sm:text-base">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">01.</span>
                Acceptance of Terms & Scope
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                These Terms of Service (&quot;Agreement&quot;) constitute a legally binding agreement between SwiftTab Technologies (&quot;SwiftTab&quot;, &quot;we&quot;, &quot;us&quot;) and the automotive detailing, Paint Protection Film (PPF), ceramic coating, or window tint business (&quot;Studio&quot;, &quot;Subscriber&quot;, or &quot;You&quot;) accessing or using the SwiftTab Auto platform via <span className="text-zinc-200 font-mono">justswifttab.com</span>.
              </p>
              <p className="mt-3 text-zinc-400 leading-7">
                By creating an account, launching a pilot, or utilizing any feature of the SwiftTab Auto software, you acknowledge that you have read, understood, and agree to be bound by this Agreement.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">02.</span>
                Studio Operating System Service
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                SwiftTab Auto provides a specialized software-as-a-service (SaaS) workflow solution including:
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-zinc-400">
                <li>Pre-service digital defect documentation and vehicle walkaround photo logging.</li>
                <li>Real-time multi-bay Kanban dispatch and technician work-order tracking.</li>
                <li>Photo-backed mobile upsell delivery and client approval workflows.</li>
                <li>Digital vehicle hand-off certificates and VIP warranty dossiers.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">03.</span>
                Subscription, Fees & Billing
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                SwiftTab Auto is licensed on a recurring subscription basis (monthly or annual billing) at the rates published on our pricing schedule. SwiftTab does not charge per-order commissions or take a percentage of your studio&apos;s customer revenue.
              </p>
              <p className="mt-3 text-zinc-400 leading-7">
                Subscriptions automatically renew unless canceled prior to the renewal date. All payments are non-refundable once the billing cycle commences, except where required by law.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">04.</span>
                Studio Pass-Through Liability Shield & Workshop Disclaimers
              </h2>
              <div className="mt-3 p-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200/90 text-sm leading-6">
                <div className="flex items-center gap-2 font-bold text-rose-300 uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Crucial Disclaimer of Workshop Liability
                </div>
                <p>
                  <strong>SwiftTab is a software provider only.</strong> SwiftTab is not an automotive shop, mechanical technician, garage keeper, or insurance underwriter. Under no circumstances shall SwiftTab be liable for:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-xs sm:text-sm text-rose-200/80">
                  <li>Any physical damage, scratches, dents, swirl marks, paint burns, or clear-coat failure on any vehicle serviced in your studio.</li>
                  <li>Defective application, peeling, discoloration, or failure of third-party film, PPF, vinyl wrap, or ceramic/graphene coatings.</li>
                  <li>Disputes between your studio and your vehicle-owning clients regarding pricing, workmanship, warranties, or pre-existing defects.</li>
                  <li>Workshop accidents, technician bodily injury, chemical exposure, fire, theft, or vehicle property damage occurring on your premises.</li>
                </ul>
                <p className="mt-2 text-xs text-rose-300/80">
                  The Studio represents that it maintains active Garage Keepers Liability and Commercial General Liability insurance policies covering customer vehicles under its custody and control.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">05.</span>
                Electronic Signatures & Defect Waivers
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                SwiftTab Auto provides touch-screen canvas signing capabilities to record vehicle owner acknowledgment of pre-existing defects. Both parties agree that digital signatures captured through SwiftTab meet the legal standards of the United States Electronic Signatures in Global and National Commerce Act (ESIGN Act), the Uniform Electronic Transactions Act (UETA), and applicable electronic signature statutes.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">06.</span>
                Customer Consent & TCPA Compliance
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                The Studio represents and warrants that before submitting any vehicle owner&apos;s telephone number to the platform for SMS updates or photo upsells, the Studio has obtained all necessary authorizations and express consent in compliance with the Telephone Consumer Protection Act (47 U.S.C. § 227) and local telecommunications regulations.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">07.</span>
                Intellectual Property & Studio Data
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                SwiftTab and its licensors retain all right, title, and interest in and to the software, interfaces, brand assets, and algorithms. You retain full ownership of all vehicle inspection photos, client contact rosters, and business records uploaded to your account.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">08.</span>
                Limitation of Liability
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                To the maximum extent permitted by applicable law, in no event shall SwiftTab, its founders, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages (including loss of profits, studio downtime, or vehicle depreciation).
              </p>
              <p className="mt-3 text-zinc-400 leading-7">
                SwiftTab&apos;s total aggregate liability arising out of or related to this Agreement shall be limited to the total fees actually paid by the Studio to SwiftTab during the twelve (12) months preceding the incident giving rise to liability.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">09.</span>
                Governing Law & Inquiries
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                This Agreement shall be governed by and construed in accordance with the laws of India, without regard to conflict of laws principles. Export of software services to international subscribers is conducted under standard foreign inward remittance guidelines.
              </p>
              <div className="mt-4 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm">
                <p className="text-zinc-300 font-medium">Legal Inquiries & Studio Support:</p>
                <p className="mt-1 text-zinc-400 font-mono">
                  SwiftTab Technologies • Support:{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="text-amber-400 hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
