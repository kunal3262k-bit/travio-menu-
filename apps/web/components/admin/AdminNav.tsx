"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Shield,
  ShieldCheck,
  Grid3X3,
  Settings,
  Activity,
  LogOut,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  ClipboardList,
  Users,
  Radio,
  Layers,
  ChevronRight,
} from "lucide-react";

const studioNavItems = [
  { href: "/admin", label: "Studio Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Vehicle Work Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Services & PPF Catalog", icon: Layers },
  { href: "/admin/tables", label: "Bay Allocation & Fleet", icon: Grid3X3 },
  { href: "/admin/staff", label: "Technicians Roster", icon: Users },
  { href: "/admin/feedback", label: "Client 5★ Reviews", icon: MessageSquare },
  { href: "/admin/settings", label: "Studio Settings", icon: Settings },
  { href: "/admin/health", label: "System Telemetry", icon: Activity },
];

export function AdminNav({ restaurantName, userRole }: { restaurantName: string; userRole?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(item: typeof studioNavItems[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3.5 left-4 z-50 lg:hidden bg-zinc-900 border border-zinc-800 text-white p-2.5 rounded-xl shadow-xl flex items-center gap-2"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-emerald-400" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#070D0B] text-slate-100 border-r border-emerald-950/70 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-950/70 bg-[#09130F]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-500/10 p-1.5 border border-emerald-500/25">
              <Image
                src="/logo-icon.png"
                alt="SwiftTab Logo"
                width={28}
                height={28}
                className="h-6 w-auto"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white">Swift<span className="text-emerald-400">Tab</span></span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">Auto</span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-[140px] font-medium">{restaurantName || "Studio Partner"}</p>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Status Pill */}
        <div className="px-4 py-2.5 bg-emerald-950/20 border-b border-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">Bay Sockets Live</span>
          </div>
          <Link
            href="/demo"
            target="_blank"
            className="text-[10px] font-mono text-zinc-400 hover:text-emerald-400 flex items-center gap-0.5"
          >
            Live Demo <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto font-sans">
          {studioNavItems.map((item) => {
            const active = isActive(item);
            const IconComp = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 shadow-md shadow-emerald-950/40"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                }`}
              >
                <IconComp className={`h-4 w-4 shrink-0 ${active ? "text-emerald-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User & Logout */}
        <div className="p-3 border-t border-emerald-950/70 bg-[#09130F]">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4 text-zinc-500" />
            <span>Sign Out of Studio</span>
          </button>
        </div>
      </aside>
    </>
  );
}
