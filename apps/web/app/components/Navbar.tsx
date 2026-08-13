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
              className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-slate-700 hover:bg-gray-50 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Solid Full-Screen Mobile Drawer Overlay (Matches Brand Color Scheme 100%) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white text-slate-900 p-6 md:hidden animate-in fade-in duration-150 overflow-y-auto">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
              <Image
                src="/logo-icon.png"
                alt="SwiftTab Logo"
                width={179}
                height={166}
                className="h-9 w-auto"
              />
              <span className="text-xl font-bold tracking-tight text-emerald-950">SwiftTab</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-slate-700 hover:bg-gray-100 focus:outline-none"
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
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-[#f8f9fa] p-4 text-base font-bold text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-950"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-700" /> Live Product Demo
              </span>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              href="/menu/abc-cafe/12"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-[#f8f9fa] p-4 text-base font-bold text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-950"
            >
              <span className="flex items-center gap-3">
                <QrCode className="h-5 w-5 text-emerald-700" /> Sample Customer QR Menu
              </span>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>

            <div className="rounded-2xl border border-gray-100 bg-[#f8f9fa] p-4 text-base font-bold text-slate-900">
              <ContactLink className="flex w-full items-center justify-between text-slate-900 hover:text-emerald-800" />
            </div>

            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-[#f8f9fa] p-4 text-base font-bold text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-950"
            >
              <span className="flex items-center gap-3">
                <LogIn className="h-5 w-5 text-emerald-700" /> Restaurant Login
              </span>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>

          {/* Drawer Footer Call to Action */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-4 text-center text-base font-bold text-white shadow-lg hover:bg-emerald-800 active:scale-[0.98]"
            >
              Create Your Restaurant Account
            </Link>
            <p className="text-center text-xs font-medium text-gray-500">
              No customer app required · 3-day trial
            </p>
          </div>
        </div>
      )}
    </>
  );
}
