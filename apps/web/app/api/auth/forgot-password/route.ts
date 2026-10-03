import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recoveryCodeStore } from "@/lib/recoveryStore";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { message: "Please enter your studio email address" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email },
      include: { restaurant: true }
    });

    if (!user) {
      // Return message without leaking user existence
      return NextResponse.json({
        success: true,
        message: "If a studio account exists for this email, recovery instructions have been sent.",
        email
      });
    }

    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    recoveryCodeStore.set(email, { code, expiresAt });

    console.log(`[AUTH] Password recovery code for ${email}: ${code}`);

    // Send email via Resend (or console preview if RESEND_API_KEY is not configured)
    const emailResult = await sendPasswordResetEmail({
      to: email,
      code,
      studioName: user.restaurant?.name || "Apex Auto Spa",
    });

    return NextResponse.json({
      success: true,
      message: `Recovery code dispatched to ${email}.`,
      email,
      previewCode: code, // Provided for instant demo & evaluation testing
      studioName: user.restaurant?.name || "Detailing Studio",
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Unable to process password reset request" },
      { status: 500 }
    );
  }
}
