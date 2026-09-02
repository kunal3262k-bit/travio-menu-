"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";

export default function DemoModal() {
  return (
    <Link
      href="/demo"
      className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-white font-bold text-base border border-emerald-500/25 transition-all flex items-center justify-center gap-2.5 hover:border-emerald-500/40"
    >
      <PlayCircle className="w-5 h-5 text-emerald-400" /> Watch Interactive Demo
    </Link>
  );
}
