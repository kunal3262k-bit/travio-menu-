import Link from "next/link";
import { CheckCircle2, PlayCircle, Utensils, Zap, Users, TrendingUp } from "lucide-react";
import DemoModal from "./components/DemoModal";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-tighter text-emerald-950">SwiftTab</div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-emerald-900">Restaurant Login</Link>
          <Link href="/register" className="text-sm font-semibold bg-emerald-900 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-800 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
          Increase restaurant sales <br className="hidden md:block"/>
          <span className="text-emerald-600">without hiring more waiters.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          The fastest way to take orders. Customers scan, order, and pay from their phone. Your kitchen gets tickets instantly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-emerald-900 text-white rounded-xl font-bold text-lg hover:bg-emerald-800 transition shadow-xl shadow-emerald-900/20">
            Start Free Trial
          </Link>
          <DemoModal />
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-black mb-6">Stop losing money to slow service.</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Users className="text-red-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Staffing is expensive</h3>
                  <p className="text-gray-600">Finding and keeping good waiters is harder than ever. You shouldn't have to overstaff just for the weekend rush.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Utensils className="text-orange-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Missed up-sells</h3>
                  <p className="text-gray-600">Waiters forget to ask "would you like fries with that?". A digital menu never forgets.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-emerald-900 p-8 rounded-3xl text-white shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">The SwiftTab Solution</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-center text-lg"><CheckCircle2 className="text-emerald-400" /> Instant ordering, zero wait time</li>
              <li className="flex gap-3 items-center text-lg"><CheckCircle2 className="text-emerald-400" /> Beautiful digital menus that sell</li>
              <li className="flex gap-3 items-center text-lg"><CheckCircle2 className="text-emerald-400" /> Send orders straight to the kitchen</li>
              <li className="flex gap-3 items-center text-lg"><CheckCircle2 className="text-emerald-400" /> 1-Tap item availability toggles</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-black mb-16">Live in 10 minutes.</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6">1</div>
            <h3 className="text-xl font-bold mb-3">Upload Menu Photos</h3>
            <p className="text-gray-600">Our AI instantly converts your printed menu into a beautiful digital experience.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6">2</div>
            <h3 className="text-xl font-bold mb-3">Print QR Codes</h3>
            <p className="text-gray-600">Stick them on your tables. No apps for customers to download, just scan with the camera.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6">3</div>
            <h3 className="text-xl font-bold mb-3">Receive Orders</h3>
            <p className="text-gray-600">Tickets print directly in your kitchen. Watch your table turnover rate skyrocket.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-emerald-950 py-24 px-6 text-white text-center">
        <h2 className="text-4xl font-black mb-6">Simple, honest pricing.</h2>
        <p className="text-emerald-200 mb-12 text-lg">No commissions. No hidden fees. Just software that works.</p>
        
        <div className="bg-white text-slate-900 max-w-md mx-auto p-8 rounded-3xl shadow-2xl">
          <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-400 line-through decoration-red-500 decoration-2">₹2999</span>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full uppercase tracking-wider">Early Adopter Offer</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-5xl font-black">₹999</span>
              <span className="text-gray-500 font-semibold ml-1">/month</span>
            </div>
          </div>
          <ul className="space-y-4 text-left mb-8">
            <li className="flex gap-3"><CheckCircle2 className="text-emerald-500" /> Unlimited Orders</li>
            <li className="flex gap-3"><CheckCircle2 className="text-emerald-500" /> Unlimited Tables</li>
            <li className="flex gap-3"><CheckCircle2 className="text-emerald-500" /> Digital Menu with Photos</li>
            <li className="flex gap-3"><CheckCircle2 className="text-emerald-500" /> AI Menu Importer</li>
            <li className="flex gap-3"><CheckCircle2 className="text-emerald-500" /> Kitchen & Admin Dashboards</li>
          </ul>
          <Link href="/register" className="block w-full py-4 bg-emerald-900 text-white rounded-xl font-bold text-lg hover:bg-emerald-800 transition text-center">
            Start 7-Day Free Trial
          </Link>
        </div>
      </section>

      {/* FAQ & Footer Placeholder */}
      <footer className="bg-white py-12 px-6 text-center border-t">
        <p className="text-gray-500 font-semibold">© 2026 SwiftTab. Built for Indian Restaurants.</p>
      </footer>
    </div>
  );
}
