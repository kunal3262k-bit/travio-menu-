"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail, KeyRound, CheckCircle2, Shield, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to request recovery code");

      if (data.previewCode) {
        setPreviewCode(data.previewCode);
        setCode(data.previewCode); // Prefill for smooth testing
      }
      setSuccess("Recovery verification code generated.");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setSuccess("Password updated successfully! Redirecting to studio login...");
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#06080D] text-slate-100 p-4 selection:bg-emerald-500 selection:text-slate-950 font-sans overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-7 rounded-2xl bg-zinc-950/85 p-8 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.85)] border border-emerald-950/80 backdrop-blur-xl">
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
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {step === 1 ? "Reset Studio Password" : "Set New Password"}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {step === 1
                ? "Enter your studio administrator email to receive a secure recovery code."
                : `Enter the 6-digit recovery code sent to ${email} and choose a new password.`}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 py-1">
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${step === 1 ? "text-emerald-400" : "text-zinc-500"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400" : "bg-zinc-900 border border-zinc-700 text-zinc-400"}`}>1</span>
            <span>Request Code</span>
          </div>
          <div className="w-8 h-px bg-zinc-800" />
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${step === 2 ? "text-emerald-400" : "text-zinc-500"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400" : "bg-zinc-900 border border-zinc-700 text-zinc-400"}`}>2</span>
            <span>New Password</span>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-xs font-medium text-rose-300 animate-in fade-in">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-xs font-medium text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Step 1 Form: Request Code */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Studio Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="director@apexautospa.com"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
              <span>Testing recovery?</span>
              <button
                type="button"
                onClick={() => setEmail("demo@swifttab.com")}
                className="text-emerald-400 hover:text-emerald-300 underline font-mono"
              >
                Use demo@swifttab.com
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? "Generating Code..." : "Send Recovery Code"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2 Form: Verify Code & Set Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {previewCode && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                <span>Verification Code: <strong className="font-mono text-sm tracking-widest text-emerald-400">{previewCode}</strong></span>
                <span className="text-[10px] font-mono text-emerald-400/80 uppercase">Auto-detected</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                6-Digit Recovery Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="123456"
                  className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                New Studio Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter new password"
                className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.6)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? "Updating Password..." : "Update Password & Login"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-900 flex items-center justify-between">
          <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio Login
          </Link>
          <Link href="/register" className="font-bold text-emerald-400 hover:text-emerald-300">
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
