"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight, Sparkles, QrCode } from "lucide-react";
import ContactLink from "./ContactLink";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
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

        {/* Mobile Hamburger Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/register"
            className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
          >
            Get Started
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-gray-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-[60px] z-50 flex flex-col bg-white px-6 py-6 border-t border-gray-100 md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-4">
            <Link
              href="/demo"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-emerald-700" /> Demo & Workflow
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>

            <Link
              href="/menu/abc-cafe/12"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
              <span className="flex items-center gap-2.5">
                <QrCode className="h-5 w-5 text-emerald-700" /> Sample QR Menu
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>

            <div className="rounded-xl bg-gray-50 px-4 py-3.5 text-base font-semibold text-slate-800">
              <ContactLink
                className="flex w-full items-center justify-between text-slate-800 hover:text-emerald-900"
              />
            </div>

            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
              <span>Restaurant Login</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3.5 text-center text-base font-bold text-white shadow-md hover:bg-emerald-800"
            >
              Create Your Restaurant Account
            </Link>
            <p className="text-center text-xs font-semibold text-gray-500">
              No customer app required · 3-day trial
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
