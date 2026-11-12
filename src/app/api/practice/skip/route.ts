import { NextRequest, NextResponse } from "next/server";
import { skipDailyPractice, getUserSettings } from "@/lib/db";
import { getTodayIST } from "@/lib/dateUtils";
import { sendEmail } from "@/lib/email";
import { getSkipAlertTemplate } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reason } = body;

    if (!reason || typeof reason !== "string" || reason.trim().length < 15) {
      return NextResponse.json(
        {
          error:
            "A genuine skip reason of at least 15 characters is required for accountability.",
        },
        { status: 400 }
      );
    }

    const settings = await getUserSettings();
    const previousStreak = settings.currentStreak;
    const today = getTodayIST(settings.timezone);

    const result = await skipDailyPractice(today, reason.trim());

    // Fire SMTP email alert
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { subject, html } = getSkipAlertTemplate({
      userName: settings.userName,
      targetRole: settings.targetCareerRole,
      previousStreak,
      skipReason: reason.trim(),
      appUrl,
    });

    const emailResult = await sendEmail({
      to: settings.userEmail,
      cc: settings.partnerEmail || undefined,
      subject,
      html,
    });

    return NextResponse.json({
      ...result,
      emailSent: emailResult.success,
      emailMode: emailResult.mode,
      previewUrl: emailResult.previewUrl,
    });
  } catch (error: any) {
    console.error("POST /api/practice/skip error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log skip" },
      { status: 500 }
    );
  }
}

