import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "SwiftTab Auto <onboarding@resend.dev>";

export interface SendPasswordResetEmailParams {
  to: string;
  code: string;
  studioName?: string;
  resetUrl?: string;
}

/**
 * Sends a luxury dark-mode password recovery email via Resend.
 * Gracefully falls back to console preview if RESEND_API_KEY is not configured yet.
 */
export async function sendPasswordResetEmail({
  to,
  code,
  studioName = "Apex Auto Spa",
  resetUrl,
}: SendPasswordResetEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Studio Password Recovery</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #06080D; color: #E2E8F0; margin: 0; padding: 32px 16px; }
        .container { max-width: 520px; margin: 0 auto; background: #0A1016; border: 1px solid #10B98140; border-radius: 16px; padding: 36px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
        .logo { font-size: 20px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; margin-bottom: 24px; }
        .logo span { color: #10B981; }
        .badge { display: inline-block; padding: 4px 10px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; color: #34D399; font-size: 11px; font-family: monospace; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; }
        h1 { font-size: 24px; font-weight: 900; color: #FFFFFF; margin: 0 0 12px 0; line-height: 1.2; }
        p { font-size: 14px; line-height: 1.6; color: #94A3B8; margin: 0 0 20px 0; }
        .code-box { background: #040609; border: 1px dashed #10B98180; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #10B981; }
        .btn { display: inline-block; width: 100%; text-align: center; padding: 14px 20px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #04100B !important; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 10px; box-shadow: 0 0 24px rgba(16,185,129,0.4); box-sizing: border-box; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #1E293B; text-align: center; font-size: 12px; color: #64748B; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Swift<span>Tab</span> Auto</div>
        <div class="badge">Security Verification</div>
        <h1>Reset Your Studio Password</h1>
        <p>A request was received to reset the password for your studio administrative account at <strong>${studioName}</strong> (${to}).</p>
        
        <p>Enter the 6-digit recovery code below on the password reset screen:</p>
        
        <div class="code-box">
          <div class="code">${code}</div>
        </div>

        ${
          resetUrl
            ? `<a href="${resetUrl}" class="btn">Click Here to Set New Password</a>`
            : ""
        }

        <p style="margin-top: 24px; font-size: 12px; color: #64748B;">
          This code will expire in 15 minutes. If you did not initiate this request, you can safely ignore this email.
        </p>

        <div class="footer">
          SwiftTab Auto • The Detailing Studio Operating System<br />
          Protected by Studio Security Shield
        </div>
      </div>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`\n=======================================================`);
    console.log(`[RESEND EMAIL PREVIEW - NO API KEY YET]`);
    console.log(`To: ${to}`);
    console.log(`Subject: Your SwiftTab Auto Recovery Code: ${code}`);
    console.log(`Body: 6-Digit Code is ${code}`);
    console.log(`Add RESEND_API_KEY to your .env to send real inbox emails.`);
    console.log(`=======================================================\n`);
    return { success: true, id: "simulated_local_resend_id" };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `SwiftTab Auto — Reset Code: ${code}`,
      html: htmlContent,
    });

    return { success: true, id: data.data?.id };
  } catch (error: any) {
    console.error("[RESEND ERROR]", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
