import { ReactNode } from "react";
import Link from "next/link";

export default function SetupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight">DineFlow Setup</div>
          <div className="flex gap-4 text-sm font-medium text-gray-500">
            <span className="text-black">1. Menu</span>
            <span>2. QR Codes</span>
            <span>3. Go Live</span>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
