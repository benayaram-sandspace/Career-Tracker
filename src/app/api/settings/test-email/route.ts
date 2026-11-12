import { NextResponse } from "next/server";
import { getUserSettings } from "@/lib/db";
import { sendEmail, verifySmtp } from "@/lib/email";
import { getTestEmailTemplate } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const settings = await getUserSettings();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // First verify connection
    const verifyResult = await verifySmtp();
    if (!verifyResult.ok) {
      return NextResponse.json(
        {
          success: false,
          error: verifyResult.message,
          hint: "Ensure SMTP_USER and 16-character Google App Password (SMTP_PASS) are properly configured in .env",
        },
        { status: 400 }
      );
    }

    const { subject, html } = getTestEmailTemplate({
      userName: settings.userName,
      targetRole: settings.targetCareerRole,
      appUrl,
    });

    const emailResult = await sendEmail({
      to: settings.userEmail,
      subject,
      html,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "Failed to deliver test email",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${settings.userEmail}`,
      simulated: emailResult.simulated,
    });
  } catch (error: any) {
    console.error("POST /api/settings/test-email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute test email" },
      { status: 500 }
    );
  }
}

