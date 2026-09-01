"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight, Sparkles, QrCode, LogIn } from "lucide-react";
import ContactLink from "./ContactLink";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-emerald-950/60 bg-[#070D0B]/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:py-4">
          {/* Brand logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative flex items-center justify-center rounded-xl bg-emerald-500/10 p-1.5 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
              <Image
                src="/logo-icon.png"
                alt="SwiftTab Logo"
                width={179}
                height={166}
                className="h-7 w-auto sm:h-8"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Swift<span className="text-emerald-400">Tab</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-7 md:flex">
            <Link
              href="/demo"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400"
            >
              Interactive Demo
            </Link>
            <Link
              href="/menu/abc-cafe/12"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400"
            >
              Sample Menu
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400"
            >
              Pricing
            </Link>
            <ContactLink className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400" />
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="relative inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-[0_0_24px_rgba(0,184,124,0.4)] active:scale-[0.98]"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex items-center gap-2.5 md:hidden">
            <Link
              href="/register"
              className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-sm"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-2 text-slate-300 hover:text-white hover:bg-emerald-900/50 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Solid Full-Screen Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#070D0B] text-slate-100 p-6 md:hidden animate-in fade-in duration-150 overflow-y-auto">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-emerald-950/60 pb-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
              <div className="rounded-xl bg-emerald-500/10 p-1.5 border border-emerald-500/20">
                <Image
                  src="/logo-icon.png"
                  alt="SwiftTab Logo"
                  width={179}
                  height={166}
                  className="h-7 w-auto"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Swift<span className="text-emerald-400">Tab</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-2 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="mt-6 flex flex-col space-y-3 flex-1">
            <Link
              href="/demo"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-emerald-900/30 bg-[#0C1613] p-4 text-base font-semibold text-white transition hover:border-emerald-500/40 hover:bg-emerald-950/40"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-400" /> Interactive Customer Demo
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>

            <Link
              href="/menu/abc-cafe/12"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-emerald-900/30 bg-[#0C1613] p-4 text-base font-semibold text-white transition hover:border-emerald-500/40 hover:bg-emerald-950/40"
            >
              <span className="flex items-center gap-3">
                <QrCode className="h-5 w-5 text-emerald-400" /> Sample QR Menu
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>

            <Link
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-emerald-900/30 bg-[#0C1613] p-4 text-base font-semibold text-white transition hover:border-emerald-500/40 hover:bg-emerald-950/40"
            >
              <span className="text-slate-200">Pricing & Plans</span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>

            <div className="rounded-2xl border border-emerald-900/30 bg-[#0C1613] p-4 text-base font-semibold text-white">
              <ContactLink className="flex w-full items-center justify-between text-slate-200 hover:text-emerald-400" />
            </div>

            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-emerald-900/30 bg-[#0C1613] p-4 text-base font-semibold text-white transition hover:border-emerald-500/40 hover:bg-emerald-950/40"
            >
              <span className="flex items-center gap-3">
                <LogIn className="h-5 w-5 text-emerald-400" /> Restaurant Login
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </Link>
          </div>

          {/* Drawer Footer Call to Action */}
          <div className="mt-8 pt-6 border-t border-emerald-950/60 flex flex-col gap-3">
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-center text-base font-bold text-slate-950 shadow-lg hover:bg-emerald-400 active:scale-[0.98]"
            >
              Start 3-Day Risk-Free Trial
            </Link>
            <p className="text-center text-xs font-medium text-slate-500">
              No credit card required · Instant setup
            </p>
          </div>
        </div>
      )}
    </>
  );
}
