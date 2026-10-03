import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HealthClient from "./HealthClient";

export default async function HealthDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let dbStatus = "Disconnected";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "Connected";
  } catch (e) {
    dbStatus = "Error";
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight">System Telemetry</h1>
        <p className="text-xs text-zinc-400 font-mono mt-1">
          Live infrastructure health for your Studio OS instance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Web Server */}
        <div className="bg-zinc-900/80 border border-emerald-950/70 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
              Web Server
            </p>
            <p className="font-bold text-white text-sm">Next.js App Router</p>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Port 3008 · Edge Runtime</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE</span>
          </div>
        </div>

        {/* Database */}
        <div className="bg-zinc-900/80 border border-emerald-950/70 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
              Database (PostgreSQL)
            </p>
            <p className="font-bold text-white text-sm">{dbStatus}</p>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Prisma ORM · Connection Pool</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-4 h-4 rounded-full ${
                dbStatus === "Connected"
                  ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                  : "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
              }`}
            />
            <span
              className={`text-[10px] font-mono font-bold ${
                dbStatus === "Connected" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {dbStatus === "Connected" ? "OK" : "ERR"}
            </span>
          </div>
        </div>

        {/* Push Notifications (client component) */}
        <HealthClient />

        {/* Version */}
        <div className="bg-zinc-900/80 border border-emerald-950/70 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
              SwiftTab Auto OS
            </p>
            <p className="font-bold text-white text-sm">v1.4.0 — Phase 4A</p>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Bay Dispatch · Defect Vault · WhatsApp
            </p>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-lg text-[11px] font-bold text-emerald-400 font-mono">
            PROD
          </div>
        </div>

        {/* Auth Session */}
        <div className="bg-zinc-900/80 border border-emerald-950/70 rounded-2xl p-5 flex items-center justify-between shadow-lg md:col-span-2">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
              Authentication
            </p>
            <p className="font-bold text-white text-sm">
              NextAuth · Credentials Provider · JWT Session
            </p>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Signed in as: {session.user?.email} &nbsp;·&nbsp; Role:{" "}
              <span className="text-emerald-400 font-bold">{session.user?.role}</span>
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold">OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
