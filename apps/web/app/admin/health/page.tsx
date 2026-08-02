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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black mb-8">System Health</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold mb-1">Web Server</p>
            <p className="font-bold">Next.js App Router</p>
          </div>
          <div className="w-4 h-4 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold mb-1">Database (PostgreSQL)</p>
            <p className="font-bold">{dbStatus}</p>
          </div>
          <div className={`w-4 h-4 rounded-full ${dbStatus === "Connected" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" : "bg-red-500"}`}></div>
        </div>

        <HealthClient />

        <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold mb-1">DineFlow Version</p>
            <p className="font-bold">v1.4.0 (Phase 4A)</p>
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-md text-xs font-bold text-gray-500">PROD</div>
        </div>
      </div>
    </div>
  );
}
