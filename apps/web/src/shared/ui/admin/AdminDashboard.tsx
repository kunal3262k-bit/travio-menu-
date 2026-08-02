import { BarChart3, ClipboardList, IndianRupee, QrCode, UsersRound, Utensils } from "lucide-react";
import { formatMoney } from "@/lib/utils";

const kpis = [
  { label: "Today's orders", value: "86", icon: ClipboardList },
  { label: "Revenue", value: formatMoney(184300), icon: IndianRupee },
  { label: "Average order", value: formatMoney(21400), icon: BarChart3 },
  { label: "Active tables", value: "31 / 42", icon: QrCode }
];

const popularItems = [
  ["Paneer Burger", 42],
  ["Masala Fries", 38],
  ["Cold Coffee", 31],
  ["Chocolate Brownie", 19]
];

export function AdminDashboard() {
  return (
    <main className="min-h-svh bg-[#f8f4ed]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-stone-300 bg-white px-5 py-6 lg:block">
        <h1 className="text-2xl font-semibold">DineFlow</h1>
        <nav className="mt-8 space-y-1 text-sm font-semibold text-stone-700">
          {["Dashboard", "Tables", "Menu", "Orders", "Customers", "Analytics", "Settings"].map((item) => (
            <a key={item} className="block rounded-lg px-3 py-2 hover:bg-stone-100" href={`#${item.toLowerCase()}`}>{item}</a>
          ))}
        </nav>
      </aside>

      <section className="lg:pl-64">
        <header className="border-b border-stone-300 bg-[#f8f4ed] px-5 py-5">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">ABC Cafe</p>
            <h2 className="text-3xl font-semibold text-stone-950">Dashboard</h2>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 px-5 py-6">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-stone-300 bg-white p-4">
                <div className="flex items-center justify-between text-stone-600">
                  <span className="text-sm">{label}</span>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-stone-950">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-stone-300 bg-white">
              <div className="flex items-center justify-between border-b border-stone-200 p-4">
                <h3 className="font-semibold">Recent orders</h3>
                <span className="text-sm text-stone-600">Live from kitchen</span>
              </div>
              <div className="divide-y divide-stone-200">
                {[1042, 1041, 1040, 1039].map((order, index) => (
                  <div key={order} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 p-4 text-sm">
                    <div>
                      <p className="font-semibold">Order #{order}</p>
                      <p className="text-stone-600">Table {index + 4} · {index % 2 ? "Preparing" : "Received"}</p>
                    </div>
                    <span>{formatMoney([42700, 45800, 18900, 32800][index])}</span>
                    <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold">View</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-stone-300 bg-white p-4">
              <h3 className="flex items-center gap-2 font-semibold"><Utensils className="h-4 w-4" /> Popular items</h3>
              <div className="mt-4 space-y-4">
                {popularItems.map(([name, count]) => (
                  <div key={name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{name}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-200">
                      <div className="h-2 rounded-full bg-emerald-700" style={{ width: `${Number(count) * 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {["Generate QR Codes", "CRUD Categories", "Availability Toggle"].map((title) => (
              <div key={title} className="rounded-lg border border-stone-300 bg-white p-4">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">Admin-ready module boundary for the MVP workflow.</p>
              </div>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
