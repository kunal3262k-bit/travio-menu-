"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight, Sparkles, QrCode, LogIn, PhoneCall } from "lucide-react";
import ContactLink from "./ContactLink";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:py-4">
          {/* Brand logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo-icon.png"
              alt="SwiftTab Logo"
              width={179}
              height={166}
              className="h-9 w-auto sm:h-10 lg:h-12"
              priority
            />
            <span className="text-xl font-bold tracking-tight text-emerald-950 sm:text-2xl">
              SwiftTab
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/demo"
              className="text-sm font-semibold text-gray-600 transition hover:text-emerald-900"
            >
              Demo
            </Link>
            <Link
              href="/menu/abc-cafe/12"
              className="text-sm font-semibold text-gray-600 transition hover:text-emerald-900"
            >
              Sample QR Menu
            </Link>
            <ContactLink className="text-sm font-semibold text-gray-600 transition hover:text-emerald-900" />
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-600 transition hover:text-emerald-900"
            >
              Restaurant Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/register"
              className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-gray-100 hover:text-slate-900 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Solid Full-Screen Mobile Drawer Overlay (Zero Bleed-Through) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white p-6 md:hidden animate-in fade-in duration-200 overflow-y-auto">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
              <Image
                src="/logo-icon.png"
                alt="SwiftTab Logo"
                width={179}
                height={166}
                className="h-9 w-auto brightness-200"
              />
              <span className="text-xl font-bold tracking-tight text-white">SwiftTab</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-white hover:bg-white/20 focus:outline-none"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="mt-6 flex flex-col space-y-3 flex-1">
            <Link
              href="/demo"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-base font-bold text-white transition hover:bg-white/15"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-400" /> Live Product Demo
              </span>
              <ArrowRight className="h-5 w-5 text-white/40" />
            </Link>

            <Link
              href="/menu/abc-cafe/12"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-base font-bold text-white transition hover:bg-white/15"
            >
              <span className="flex items-center gap-3">
                <QrCode className="h-5 w-5 text-emerald-400" /> Sample Customer QR Menu
              </span>
              <ArrowRight className="h-5 w-5 text-white/40" />
            </Link>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-base font-bold text-white">
              <ContactLink className="flex w-full items-center justify-between text-white hover:text-emerald-300" />
            </div>

            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-base font-bold text-white transition hover:bg-white/15"
            >
              <span className="flex items-center gap-3">
                <LogIn className="h-5 w-5 text-emerald-400" /> Restaurant Login
              </span>
              <ArrowRight className="h-5 w-5 text-white/40" />
            </Link>
          </div>

          {/* Drawer Footer Call to Action */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-center text-base font-extrabold text-white shadow-xl hover:bg-emerald-500 active:scale-[0.98]"
            >
              Create Your Restaurant Account
            </Link>
            <p className="text-center text-xs font-medium text-emerald-300/80">
              No customer app required · 3-day risk-free trial
            </p>
          </div>
        </div>
      )}
    </>
  );
}
