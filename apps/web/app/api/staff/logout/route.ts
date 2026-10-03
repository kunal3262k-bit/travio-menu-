import { NextRequest, NextResponse } from "next/server";
import { clearStaffSessionCookie } from "@/lib/staffAuth";

export async function POST(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const requestSecure = forwardedProto?.split(",")[0]?.trim().toLowerCase() === "https";

  const response = NextResponse.json({ success: true, message: "Staff logged out successfully" });
  clearStaffSessionCookie(response, { requestSecure });
  return response;
}
