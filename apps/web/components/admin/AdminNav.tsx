"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  ChefHat,
  Bell,
  Grid3X3,
  UtensilsCrossed,
  Settings,
  Activity,
  LogOut,
  Menu,
  X,
  BookOpen,
  MessageSquare,
  ClipboardList
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/kitchen", label: "Kitchen", icon: ChefHat },
  { href: "/admin/waiter", label: "Waiter", icon: Bell },
  { href: "/admin/tables", label: "Tables", icon: Grid3X3 },
  { href: "/admin/orders/history", label: "Order History", icon: ClipboardList },
  { href: "/admin/menu", label: "Menu Editor", icon: BookOpen },
  { href: "/admin/menu-availability", label: "86 Items", icon: UtensilsCrossed },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/health", label: "Health", icon: Activity },
];

export function AdminNav({ restaurantName, userRole }: { restaurantName: string, userRole?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(item: typeof navItems[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const filteredNavItems = navItems.filter(item => {
    if (userRole === "WAITER") return item.href === "/admin/waiter";
    if (userRole === "KITCHEN") return item.href === "/admin/kitchen";
    return true; // ADMIN sees all
  });

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 text-white p-2.5 rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold tracking-tight">SwiftTab</h2>
            <p className="text-xs text-gray-400 truncate max-w-[160px]">{restaurantName}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
