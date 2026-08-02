import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@core/auth/authOptions";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-black mb-8">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
            <Link href="/admin/settings/profile" className="px-4 py-2 rounded-lg font-medium hover:bg-gray-100 whitespace-nowrap">
              Restaurant Profile
            </Link>
            <Link href="/admin/settings/branding" className="px-4 py-2 rounded-lg font-medium hover:bg-gray-100 whitespace-nowrap">
              Branding & Links
            </Link>
            <Link href="/admin/settings/operations" className="px-4 py-2 rounded-lg font-medium hover:bg-gray-100 whitespace-nowrap">
              Operations & Status
            </Link>
          </nav>
        </aside>
        
        <main className="flex-1 bg-white p-6 rounded-xl shadow-sm border">
          {children}
        </main>
      </div>
    </div>
  );
}
