import { NextRequest, NextResponse } from "next/server";
import { appendFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const logEntry = {
      timestamp: new Date().toISOString(),
      path: body.path || "/",
      referrer: body.referrer || "direct",
      device: body.screenWidth < 768 ? "mobile" : "desktop",
      ipHash: Buffer.from(ip).toString("base64").substring(0, 12),
      userAgent: userAgent.substring(0, 100),
    };

    // Store visitor log entry cleanly in log directory
    const logsDir = path.join(process.cwd(), ".tmp");
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    const logFile = path.join(logsDir, "visitor-analytics.jsonl");
    appendFileSync(logFile, JSON.stringify(logEntry) + "\n", "utf8");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: true }); // Fail silently to not impact client
  }
}
