import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CarFront,
  CheckCircle2,
  ChefHat,
  CreditCard,
  IndianRupee,
  Menu as MenuIcon,
  Plus,
  Printer,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Utensils,
  Wallet,
} from "lucide-react";
import DemoModal from "./components/DemoModal";
import ContactLink from "./components/ContactLink";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/site-config";
import { demoOrders, demoRestaurant } from "@/lib/demo-data";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SwiftTab — QR Table Ordering & Kitchen Display for Indian Restaurants",
  description:
    "SwiftTab lets customers order from their phone by scanning a QR code on the table. Orders reach your kitchen in real time. Staff stay in control of service and UPI or cash payment. No customer app, no per-order commission.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SwiftTab — QR Table Ordering & Kitchen Display",
    description:
      "Customers scan a QR code and order from their own phone. Orders reach the kitchen in real time. No customer app, no per-order commission.",
    url: "https://justswifttab.com",
    siteName: "SwiftTab",
    type: "website",
    images: [{ url: "https://justswifttab.com/logo-full.png", width: 1200, height: 630, alt: "SwiftTab" }],
  },
};

const howItWorks = [
  {
    step: "1",
    title: "Create your restaurant account",
    text: "Register with your restaurant name, phone and email. You land in the setup flow that takes you from menu to go-live.",
  },
  {
    step: "2",
    title: "Add your menu",
    text: "Type items in, or upload a photo of your printed menu and let the menu importer build the digital menu for you.",
  },
  {
    step: "3",
    title: "Print your QR codes",
    text: "Print QR codes for your tables — and car-side codes if you offer drive-in ordering — and place them where customers sit.",
  },
  {
    step: "4",
    title: "Open the kitchen and staff screens",
    text: "Open the kitchen display and staff screens on any phone, tablet, or laptop with a browser. No special hardware required.",
  },
  {
    step: "5",
    title: "Customers scan and order",
    text: "A customer scans the QR with their phone camera. Your menu opens in their browser. No app to install, no login.",
  },
  {
    step: "6",
    title: "Serve, track, and get paid",
    text: "Orders appear in your kitchen in real time. Staff confirm UPI payments or collect cash, and you stay in control.",
  },
];

const faqs = [
  {
    q: "Do customers need to download an app?",
    a: "No. The QR code opens your menu in the customer's phone browser. There is nothing to install and no account for the customer to create.",
  },
  {
    q: "Do I need to replace my existing POS or billing system?",
    a: "No. SwiftTab is a dine-in ordering and kitchen display system, not a full POS. It works alongside your existing billing setup, and it does not charge a per-order commission.",
  },
  {
    q: "What hardware do I need?",
    a: "A screen for the kitchen and staff — any phone, tablet, or laptop with a modern browser. Customers use their own phones. You can print kitchen tickets and bills from the staff device using your existing printer.",
  },
  {
    q: "How does the kitchen receive orders?",
    a: "Orders appear on the kitchen display the moment a customer places them, with a sound alert, the table number, items, special instructions, and the time. The kitchen updates each order's status as it is prepared.",
  },
  {
    q: "Can my waiters still take orders?",
    a: "Yes — waiters stay at the centre of service. Customers order from the phone menu, and waiters receive call-waiter and bill requests, verify UPI payments, collect cash, and handle the table. SwiftTab is built to make ordering smoother, not to replace your staff.",
  },
  {
    q: "How does payment work?",
    a: "Customers pay your restaurant directly — by your UPI QR code or in cash. Staff confirm the payment on their screen. Money never passes through SwiftTab, which is why there is no per-order commission.",
  },
  {
    q: "Does SwiftTab support car-side or drive-in ordering?",
    a: "Yes. Car-side ordering lets customers scan a QR code from their vehicle, place an order, pay, and the order is released to the kitchen for preparation.",
  },
  {
    q: "Can I change menu items and mark things unavailable?",
    a: "Yes. You can edit your menu at any time from the admin panel, and toggle any item available or sold out instantly. Sold-out items disappear from the customer menu.",
  },
  {
    q: "What if a customer needs a waiter?",
    a: "The menu includes a call-waiter button and a bill request button. The request reaches your staff screen in real time.",
  },
  {
    q: "How quickly can I get started?",
    a: "Sign up, add your menu, print your QR codes, and open the kitchen screen. Most restaurants go live the same day once their menu is ready.",
  },
  {
    q: "What happens if the internet connection drops?",
    a: "SwiftTab is a live, online system — ordering, the kitchen display, and staff screens need a working internet connection. If the connection drops, you can fall back on your usual verbal ordering until it returns.",
  },
];

const pricingIncluded = [
  "Unlimited orders",
  "Unlimited tables",
  "Digital menu with photos",
  "AI menu importer",
  "Kitchen display system",
  "Waiter & staff screens",
  "Car-side ordering",
  "QR code generation & printing",
  "UPI / cash payment confirmation",
  "Onboarding support",
];

export default function Home() {
  const phoneItems = [
    demoRestaurant.categories[0].items[0],
    demoRestaurant.categories[1].items[0],
    demoRestaurant.categories[2].items[0],
  ];
  const previewOrder = demoOrders[0];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "SwiftTab",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "QR table ordering and kitchen display system for Indian restaurants. Customers scan a QR code and order from their own phone. Orders reach the kitchen in real time. No customer app, no per-order commission.",
            offers: { "@type": "Offer", price: "999", priceCurrency: "INR", description: "Monthly subscription" },
          }),
        }}
      />

      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="" width={179} height={166} className="h-10 w-auto lg:h-12" priority />
            <span className="text-xl font-bold tracking-tight text-emerald-950 lg:text-2xl">SwiftTab</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="text-sm font-semibold text-gray-600 hover:text-emerald-900">
              Demo
            </Link>
            <ContactLink className="text-sm font-semibold text-gray-600 hover:text-emerald-900" />
            <Link href="/login" className="py-3 text-sm font-semibold text-gray-600 hover:text-emerald-900">
              Restaurant Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f8f9fa]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <QrCode className="h-3.5 w-3.5" /> QR ordering for Indian restaurants
            </p>
            <h1 className="text-3xl font-black leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Your customers order from the table.
              <span className="text-emerald-700"> Your kitchen gets it instantly.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Place a QR code on each table. Customers scan it with their phone, browse your menu, and order without
              waiting for a waiter. Orders reach the kitchen in real time, and your staff stay in control of service,
              payment, and the dining room.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-xl bg-emerald-700 px-8 py-4 text-center text-lg font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 sm:w-auto"
              >
                Create your menu
              </Link>
              <DemoModal />
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> No customer app
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> No per-order commission
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Works on any phone
              </li>
            </ul>
          </div>

          <ProductPreview phoneItems={phoneItems} previewOrder={previewOrder} />
        </div>
      </section>

      {/* Product flow strip */}
      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 text-sm font-semibold text-gray-700 md:grid-cols-7">
          {["Scan QR", "Browse menu", "Place order", "Order hits kitchen", "Kitchen prepares", "Staff serve & confirm payment", "Customer enjoys"].map(
            (step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">
                  {i + 1}
                </span>
                <span>{step}</span>
              </div>
            )
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-emerald-700">How it works</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black tracking-tight md:text-4xl">
            From sign-up to your first QR order — in six steps
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-lg font-black text-emerald-800">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 leading-7 text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center">
            <Link href="/register" className="font-bold text-emerald-700 underline underline-offset-4 hover:text-emerald-900">
              Start the setup now →
            </Link>
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#f8f9fa] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-emerald-700">What SwiftTab covers</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black tracking-tight md:text-4xl">
            The full ordering loop — from table to kitchen to payment
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <FeatureCard
              icon={QrCode}
              title="QR table ordering"
              points={[
                "Customers scan the QR on the table with their phone camera",
                "Your menu opens in their browser — no app, no login",
                "Veg / non-veg and spice labels on every item",
                "Call-waiter and bill-request buttons right in the menu",
              ]}
            />
            <FeatureCard
              icon={ChefHat}
              title="Kitchen display system"
              points={[
                "Orders appear on the kitchen screen the moment they are placed",
                "Sound alert, table number, items, instructions, and time on every order",
                "Kitchen updates each order as it goes from received to ready",
                "Print kitchen tickets or bills from the staff device if you use a printer",
              ]}
            />
            <FeatureCard
              icon={Bell}
              title="Waiter operations"
              points={[
                "Waiters receive call-waiter and bill requests on their screen",
                "Waiters verify UPI payments and manage cash collection",
                "Staff sign in to their own screen — no shared accounts",
                "Technology handles the repetitive parts so staff can focus on hospitality",
              ]}
            />
            <FeatureCard
              icon={CarFront}
              title="Car-side (drive-in) ordering"
              points={[
                "Customers scan a car QR code from their vehicle",
                "They order and pay before the order is released to the kitchen",
                "The kitchen gets a paid order ready to prepare and serve",
                "Works with the same menu, kitchen, and staff screens",
              ]}
            />
            <FeatureCard
              icon={Wallet}
              title="Payments that stay yours"
              points={[
                "Customers pay your restaurant directly — your UPI QR code or cash",
                "Staff confirm the payment on their screen",
                "Money never passes through SwiftTab",
                "No per-order commission, ever",
              ]}
            />
            <FeatureCard
              icon={Smartphone}
              title="Your menu, under your control"
              points={[
                "Add items manually or upload a photo of your printed menu",
                "Edit prices and descriptions any time",
                "Mark items sold out instantly — they disappear from the menu",
                "Generate and print QR codes for tables and cars",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Hardware / POS objections */}
      <section id="hardware" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-emerald-700">What you need</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-black tracking-tight md:text-4xl">
            You probably already have everything required
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <HardwareRow
              icon={ScanLine}
              title="Customers need a phone with a camera"
              text="Every smartphone scans a QR code with the built-in camera. No app to install."
            />
            <HardwareRow
              icon={ChefHat}
              title="The kitchen needs one screen"
              text="A phone, tablet, or laptop with a browser. The kitchen display runs entirely in the browser."
            />
            <HardwareRow
              icon={Bell}
              title="Staff need a phone or tablet"
              text="Waiters receive requests and confirm payments from their own device."
            />
            <HardwareRow
              icon={Printer}
              title="Printing works with your printer"
              text="Kitchen tickets and bills are printed from the staff device using your existing printer."
            />
          </div>
          <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <h3 className="text-xl font-bold text-emerald-950">Keep your existing POS and billing.</h3>
            <p className="mx-auto mt-2 max-w-2xl leading-7 text-emerald-900/80">
              SwiftTab is a dine-in ordering and kitchen display system. It is not a replacement for your billing setup
              and does not take a commission from your orders.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-emerald-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-300">Pricing</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">One simple monthly price</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100">
            No per-order commission. No percentage of your sales. Just software that works for a flat monthly price.
          </p>

          <div className="mt-12 rounded-3xl bg-white p-8 text-left text-slate-900 shadow-2xl">
            <h3 className="text-xl font-bold">SwiftTab</h3>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-black">₹999</span>
              <span className="font-semibold text-gray-500">/month</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              One price for the full product — setup, menu, QR codes, kitchen, staff, and car-side ordering.
            </p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {pricingIncluded.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-8 block w-full rounded-xl bg-emerald-700 py-4 text-center text-lg font-bold text-white transition hover:bg-emerald-800"
            >
              Get started at ₹999/month
            </Link>
            <p className="mt-3 text-center text-xs text-gray-500">
              Start free — sign up and set up your menu, QR codes, and kitchen screen before committing.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-emerald-700">FAQ</p>
          <h2 className="mt-3 text-center text-3xl font-black tracking-tight md:text-4xl">Questions restaurant owners ask</h2>
          <div className="mt-10 divide-y divide-gray-200 border-y border-gray-200">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold marker:hidden">
                  {faq.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 transition group-open:rotate-45">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 leading-7 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / final CTA */}
      <section className="bg-[#f8f9fa] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">See SwiftTab in action</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-600">
            Watch the demo, open the live menu, or create your restaurant account. You will be in the setup flow in the
            next few minutes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/demo"
              className="rounded-xl bg-emerald-700 px-8 py-4 text-lg font-bold text-white transition hover:bg-emerald-800"
            >
              See SwiftTab in action
            </Link>
            <DemoModal />
          </div>
          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-gray-600">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Served over HTTPS
            </span>
            <span className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-600" /> Transparent ₹999/month pricing
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Production product
            </span>
            <ContactLink className="text-emerald-700 hover:text-emerald-900" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo-icon.png" alt="" width={179} height={166} className="h-10 w-auto lg:h-12" />
                <span className="text-xl font-bold tracking-tight text-emerald-950 lg:text-2xl">SwiftTab</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-6 text-gray-600">
                QR ordering, kitchen display, and staff tools built for Indian restaurants.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Product</p>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-gray-700">
                <li>
                  <Link href="/demo" className="hover:text-emerald-800">
                    See SwiftTab in action
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-emerald-800">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-emerald-800">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-emerald-800">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Restaurant</p>
              <ul className="mt-3 space-y-2 text-sm font-semibold text-gray-700">
                <li>
                  <Link href="/register" className="hover:text-emerald-800">
                    Get started
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-emerald-800">
                    Restaurant login
                  </Link>
                </li>
                {SUPPORT_EMAIL || SUPPORT_WHATSAPP ? (
                  <li>
                    <ContactLink className="hover:text-emerald-800" />
                  </li>
                ) : null}
                <li>
                  <Link href="/privacy" className="hover:text-emerald-800">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-emerald-800">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
            © 2026 SwiftTab. Built for Indian restaurants.
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductPreview({
  phoneItems,
  previewOrder,
}: {
  phoneItems: typeof demoRestaurant.categories[number]["items"];
  previewOrder: (typeof demoOrders)[number];
}) {
  const phoneTotalPaise = phoneItems.reduce((sum, item) => sum + item.pricePaise, 0);
  return (
    <div className="relative">
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-5 lg:gap-6">
        {/* Customer phone */}
        <div className="col-span-1 rounded-[2rem] border-[10px] border-slate-900 bg-[#f8f4ed] p-4 shadow-2xl sm:col-span-3">
          <div className="flex items-center justify-between border-b border-stone-300 px-2 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
                Table {demoRestaurant.tableNumber}
              </p>
              <h3 className="text-lg font-semibold">{demoRestaurant.name}</h3>
            </div>
            <QrCode className="h-5 w-5 text-stone-700" />
          </div>
          <div className="space-y-3 py-3">
            {phoneItems.map((item) => (
              <div key={item.id} className="grid grid-cols-[56px_1fr] gap-3 rounded-lg bg-white p-2">
                <div className="relative h-16 w-14 overflow-hidden rounded-md bg-stone-200">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="mt-0.5 text-xs text-stone-600">{formatMoney(item.pricePaise)}</p>
                  <span
                    className={`mt-1 inline-flex w-fit items-center gap-1 text-[10px] font-bold ${
                      item.foodType === "NON_VEG" ? "text-red-700" : "text-emerald-700"
                    }`}
                  >
                    <Utensils className="h-3 w-3" /> {item.foodType === "NON_VEG" ? "Non veg" : "Veg"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-stone-950 p-3 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <MenuIcon className="h-4 w-4" /> Cart
              </span>
              <span className="text-sm font-semibold">{formatMoney(phoneTotalPaise)} + GST</span>
            </div>
            <div className="mt-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-stone-950">
              Place order
            </div>
          </div>
        </div>

        {/* Kitchen + staff cards */}
        <div className="col-span-1 flex flex-col gap-4 sm:col-span-2">
          <div className="rounded-xl border border-white/10 bg-stone-950 p-4 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <ChefHat className="h-4 w-4 text-emerald-300" /> Kitchen
              </h3>
              <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold">
                <Bell className="h-3 w-3 text-emerald-300" /> Alert
              </span>
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.06] p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] text-stone-300">Order #{previewOrder.orderNumber}</p>
                  <p className="text-lg font-semibold">Table {previewOrder.table}</p>
                </div>
                <span className="rounded-md bg-amber-300 px-2 py-0.5 text-[10px] font-bold text-stone-950">Received</span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-stone-200">
                {previewOrder.items.map((item) => (
                  <p key={item.name}>
                    {item.quantity} x {item.name}
                    {item.instructions && <span className="text-amber-200"> · {item.instructions}</span>}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xl">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <CreditCard className="h-4 w-4 text-emerald-700" /> Payment
            </h3>
            <p className="mt-1 text-xs text-stone-500">Paid directly to the restaurant</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">UPI</span>
              <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">Cash</span>
              <span className="ml-auto text-xs font-semibold text-stone-600">Staff confirms</span>
            </div>
          </div>

          <Link
            href="/demo"
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-white px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
          >
            <Sparkles className="h-4 w-4" /> Explore the workflow
          </Link>
        </div>
      </div>
      <p className="mt-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
        Preview from the live product · demo data
      </p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  points,
}: {
  icon: typeof QrCode;
  title: string;
  points: string[];
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-7">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2.5 leading-6 text-gray-600">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HardwareRow({ icon: Icon, title, text }: { icon: typeof QrCode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-gray-600">{text}</p>
    </div>
  );
}
