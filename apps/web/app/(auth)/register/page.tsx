"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Shield, Sparkles, ArrowRight, Building2, User, Phone, Mail, Lock, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const studioName = formData.get("studioName") as string;
    const ownerName = formData.get("ownerName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const bayCount = formData.get("bayCount") as string;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studioName, ownerName, phone, email, password, bayCount }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }

      // Auto login after registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error("Failed to auto-login. Please login manually.");
      }

      // Redirect directly to the Studio Command Center
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#06080D] text-slate-100 p-4 sm:p-6 selection:bg-emerald-500 selection:text-slate-950 font-sans overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg space-y-7 rounded-2xl bg-zinc-950/90 p-8 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.9)] border border-emerald-950/80 backdrop-blur-xl">
        {/* Header & Logo */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center rounded-xl bg-emerald-500/10 p-2 border border-emerald-500/25 group-hover:border-emerald-500/50 transition-colors">
              <Image
                src="/logo-icon.png"
                alt="SwiftTab Logo"
                width={36}
                height={36}
                className="h-7 w-auto"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Swift<span className="text-emerald-400">Tab</span> <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 ml-1">Auto</span>
            </span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold tracking-wide uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 14-Day Free Studio Trial
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Launch Your Studio OS
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Deploy your live shop bay dispatch, 60s defect intake, and 1-tap client upsells in under 2 minutes.
            </p>
          </div>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Studio / Business Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  name="studioName"
                  type="text"
                  required
                  placeholder="Apex Auto Spa"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Owner / Director Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  name="ownerName"
                  type="text"
                  required
                  placeholder="Marcus Vance"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Studio Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="(555) 234-5678"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Active Detailing Bays
              </label>
              <select
                name="bayCount"
                defaultValue="4"
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              >
                <option value="2">1–2 Bays (Solo Craft)</option>
                <option value="4">3–4 Bays (Pro Studio)</option>
                <option value="6">5–6 Bays (Elite Multi-Bay)</option>
                <option value="8">7–8+ Bays (Enterprise Facility)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                name="email"
                type="email"
                required
                placeholder="director@apexautospa.com"
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Set Studio Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                name="password"
                type="password"
                required
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-xs font-medium text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-bold text-sm shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_50px_rgba(16,185,129,0.65)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? "Configuring Studio..." : "Start 14-Day Free Trial"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Guarantee Points */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-900 text-center text-[10px] font-mono text-zinc-400">
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>No Credit Card</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Instant Setup</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Cancel Anytime</span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-zinc-400">
          Already have a studio account?{" "}
          <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
            Log in to Studio OS
          </Link>
        </div>
      </div>
    </div>
  );
}
