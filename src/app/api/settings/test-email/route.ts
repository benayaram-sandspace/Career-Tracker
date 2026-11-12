import { NextResponse } from "next/server";
import { getUserSettings } from "@/lib/db";
import { sendEmail, isSmtpConfigured, verifySmtp } from "@/lib/email";
import { getTestEmailTemplate } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const settings = await getUserSettings();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { subject, html } = getTestEmailTemplate({
      userName: settings.userName,
      targetRole: settings.targetCareerRole,
      appUrl,
    });

    const isConfigured = isSmtpConfigured();

    if (isConfigured) {
      const verify = await verifySmtp();
      if (!verify.ok) {
        return NextResponse.json(
          {
            success: false,
            error: verify.message,
            hint: "Check that your 16-character Google App Password (not your normal Gmail password) is set in SMTP_PASS in .env",
          },
          { status: 400 }
        );
      }
    }

    const emailResult = await sendEmail({
      to: settings.userEmail,
      subject,
      html,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "Failed to dispatch test email",
        },
        { status: 500 }
      );
    }

    if (emailResult.mode === "ethereal") {
      return NextResponse.json({
        success: true,
        mode: "ethereal",
        previewUrl: emailResult.previewUrl,
        message: `Email rendered and delivered to Ethereal Test Sandbox!`,
        hint: "To receive emails in your real inbox, add your Gmail address and 16-character App Password in .env",
      });
    }

    return NextResponse.json({
      success: true,
      mode: "production",
      message: `Test email successfully delivered to ${settings.userEmail}`,
    });
  } catch (error: any) {
    console.error("POST /api/settings/test-email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute test email" },
      { status: 500 }
    );
  }
}
