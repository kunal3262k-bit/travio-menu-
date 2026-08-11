import { NextResponse } from "next/server";
import { readPushConfig } from "@/lib/pushMessage";

export const runtime = "nodejs";

/**
 * Public VAPID public key endpoint. Safe to expose — only the PUBLIC half of
 * the VAPID keypair is ever returned; the private key lives in env only.
 */
export async function GET() {
  const config = readPushConfig(process.env);
  if (!config) {
    return NextResponse.json({ error: "Push is not configured on this server" }, { status: 503 });
  }
  return NextResponse.json({ publicKey: config.publicKey });
}
