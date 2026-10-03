"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Shield, Sparkles, ArrowRight, Lock, Mail, CheckCircle2, HelpCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setSuccessBanner("Your password was updated successfully. You can now log in.");
    }
    const qEmail = searchParams.get("email");
    const qPassword = searchParams.get("password");
    if (qEmail) setEmail(qEmail);
    if (qPassword) setPassword(qPassword);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(
          res.error === "CredentialsSignin"
            ? "Invalid email or password. Please check your credentials or use 'Forgot password?' below."
            : res.error
        );
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("demo@swifttab.com");
    setPassword("demo123");
    setError("");
  };

  return (
    <div className="relative z-10 w-full max-w-md space-y-7 rounded-2xl bg-zinc-950/85 p-6 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.85)] border border-emerald-950/80 backdrop-blur-xl">
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
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Studio Login</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Access your studio dispatch board, bay telemetry, and client defect intake.
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-xs font-medium text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Demo Credentials Quick-Fill Badge */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-zinc-300 text-[11px] font-mono">Demo Studio: demo@swifttab.com</span>
        </div>
        <button
          type="button"
          onClick={handleDemoFill}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-mono font-bold transition border border-emerald-500/30"
        >
          Auto-Fill
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Studio Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="director@apexautospa.com"
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-xs font-medium text-rose-300 animate-in fade-in">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>{loading ? "Authenticating..." : "Log in to Studio OS"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Link */}
      <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-900">
        New studio?{" "}
        <Link href="/register" className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
          Start 14-day free studio trial
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#06080D] text-slate-100 p-4 selection:bg-emerald-500 selection:text-slate-950 font-sans overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <Suspense fallback={<div className="text-zinc-500 font-mono text-sm">Loading Studio OS...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
