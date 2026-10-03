import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/site-config";
import { ShieldCheck, Lock, FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | SwiftTab Auto",
  description:
    "Privacy Policy for SwiftTab Auto — explaining how vehicle intake data, defect photos, inspection signatures, and studio operational data are collected, protected, and processed.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
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
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono tracking-wider uppercase mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Data Protection & Security
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm font-mono text-zinc-400">
            Effective Date: October 2, 2026 • Platform: SwiftTab Auto (justswifttab.com)
          </p>

          <div className="mt-8 pt-8 border-t border-zinc-800/80 space-y-10 leading-relaxed text-zinc-300 text-sm sm:text-base">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">01.</span>
                Platform Purpose & Overview
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                SwiftTab Auto (&quot;SwiftTab&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides a cloud-based studio operating system designed for automotive detailing, Paint Protection Film (PPF), ceramic coating, and window tint studios. Our platform facilitates pre-service vehicle walkaround inspections, defect documentation, live dispatch bay boards, digital client authorization waivers, and VIP customer dossiers.
              </p>
              <p className="mt-3 text-zinc-400 leading-7">
                This Privacy Policy describes how we collect, store, process, and safeguard information when detailing studios (&quot;Studios&quot; or &quot;Subscribers&quot;) and their vehicle-owning customers (&quot;Vehicle Owners&quot; or &quot;End Clients&quot;) use our services via <span className="text-zinc-200 font-mono">justswifttab.com</span> and associated web applications.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">02.</span>
                Information We Collect & Process
              </h2>
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                  <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">A. Studio Account Information</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Business name, studio owner/operator contact details (name, email address, commercial phone number), billing address, and staff technician roster accounts.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                  <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">B. Vehicle & Inspection Defect Data</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Vehicle Identification Number (VIN), license plate, make, model, model year, paint color, pre-existing defect photographic evidence (scratches, rock chips, swirl marks, dents), paint thickness depth gauge readings, and technician inspection notes.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                  <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">C. Client Authorization Signatures & Approvals</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    End Client full name, mobile telephone number, timestamped touch-screen electronic signature vectors acknowledging pre-existing vehicle defects, and digital records of approved service upgrades.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
                  <h3 className="font-semibold text-zinc-100 text-sm sm:text-base">D. Automated Telemetry & Performance Logs</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    IP address, browser user-agent, device characteristics, request timestamps, and system diagnostics necessary to maintain uptime, protect against cyber threats, and optimize real-time Socket.IO dispatch updates.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">03.</span>
                How We Use Collected Information
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
                <li><strong className="text-zinc-200">Studio Operations:</strong> Powering real-time Kanban dispatch boards, tracking vehicles across service bays, and recording work-order history.</li>
                <li><strong className="text-zinc-200">Defect Shield & Liability Defense:</strong> Preserving immutable, timestamped photo evidence and customer signatures to protect studios against fraudulent damage claims.</li>
                <li><strong className="text-zinc-200">Customer Communication:</strong> Delivering mobile vehicle trackers, photo-backed service upsell requests, and warranty re-coat reminders at the direction of the studio.</li>
                <li><strong className="text-zinc-200">System Integrity:</strong> Monitoring security anomalies, diagnosing server latency, and improving application responsiveness.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">04.</span>
                SMS & Messaging Compliance (TCPA & Consumer Privacy)
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                SwiftTab Auto provides tools for studios to send transactional SMS messages (such as inspection approval links, vehicle ready notifications, and warranty dossiers) to vehicle owners.
              </p>
              <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-200/90 leading-6">
                <strong>Studio Responsibility:</strong> Studios must obtain prior express consent from vehicle owners before entering their telephone number into SwiftTab for SMS notifications, in compliance with the United States Telephone Consumer Protection Act (TCPA) and applicable state laws. SwiftTab does not sell, lease, or rent phone numbers to third-party advertisers. Message and data rates may apply.
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">05.</span>
                Data Storage, Security & Sub-processors
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                We implement industry-standard administrative, physical, and technical controls to safeguard customer data against unauthorized access, loss, or alteration:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
                <li><strong className="text-zinc-200">Encryption in Transit & Rest:</strong> All traffic is encrypted via HTTPS with TLS 1.3. Databases and persistent backups reside on secured, isolated virtual private servers.</li>
                <li><strong className="text-zinc-200">Cloud Infrastructure:</strong> Hosted on Amazon Web Services (AWS) data centers located in the United States (US East, N. Virginia) to ensure minimal latency and strict physical security controls.</li>
                <li><strong className="text-zinc-200">CDN & Edge Protection:</strong> Cloudflare edge routing for DDoS protection and web application firewall security.</li>
                <li><strong className="text-zinc-200">Database Engine:</strong> Dedicated PostgreSQL instance with automated daily snapshots.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">06.</span>
                Data Ownership & Retention
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                The studio retains complete ownership of its customer lists, inspection records, and operational data. SwiftTab acts as a data processor on behalf of the studio. We retain operational data for the duration of the studio&apos;s active subscription. Upon account termination, a studio may request an export or complete purge of their records by contacting our support team.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="text-amber-400 font-mono text-sm">07.</span>
                Your Privacy Rights & Contact
              </h2>
              <p className="mt-3 text-zinc-400 leading-7">
                Depending on your location, you may have rights under applicable data protection laws (such as GDPR, California Consumer Privacy Act / CCPA, and India DPDPA) to request access, correction, or deletion of your personal data.
              </p>
              <div className="mt-4 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm">
                <p className="text-zinc-300 font-medium">Privacy Officer & Data Inquiries:</p>
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
