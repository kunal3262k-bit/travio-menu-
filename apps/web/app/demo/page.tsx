import type { Metadata } from "next";
import { DemoMode } from "@/components/demo/DemoMode";

export const metadata: Metadata = {
  title: "Live Demo",
  description:
    "See SwiftTab in action: walk the full ordering journey from QR scan to kitchen preparation, payment, and the owner's view.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return <DemoMode />;
}
